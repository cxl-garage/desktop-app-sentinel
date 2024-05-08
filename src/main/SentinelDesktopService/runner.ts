import * as async from 'async';
import path from 'path';
import recursive from 'recursive-readdir';
import winston from 'winston';
import sleep from '../../util/sleep';
import assertUnreachable from '../../util/assertUnreachable';
import { PrismaClient } from '../../generated/prisma/client';
import { RunnerState } from '../../models/ModelRunProgress';
import ERunningImageStatus from '../../components/RunModelView/types/ERunningImageStatus';
import {
  DetectionResult,
  DetectOptions,
  DetectionCountMetadata,
  getDetectionCounts,
  OutputStyle,
} from './detect';
import { detect as AutoMLDetect } from './automl';
import { detect as YOLOv5Detect } from './yolo';
import { CsvFile } from './csv';
import { isSupported } from './image';
import { isSystemError } from './errors';
import { cleanup, start } from './docker';
import { TensorflowModel, waitForStartup } from './tensorflow';
import { type InternalModelRunStatus } from '../../models/ModelRunProgress';

type ModelExecutionConfig = {
  inputFolder: string;
  inputSize: number;
  outputFolder: string;
  outputStyle: OutputStyle;
  threshold: number;
  classNames: Map<number, string>;
  modelName: string;
  modelRunId: number;
  framework: 'AutoML' | 'YOLOv5';
  tensorflowModel: TensorflowModel;
};

type JobTask = {
  jobBatchId: number;
  folder: string;
  inputPath: string;
  options: DetectOptions;
  runId: number;
  framework: 'AutoML' | 'YOLOv5';
};

export const LOG_FILE_NAME = 'output.log';

const HIDDEN_DIRECTORY_NAMES = [/__MACOSX/];

type JobStatus =
  | {
      status:
        | ERunningImageStatus.NOT_STARTED
        | ERunningImageStatus.IN_PROGRESS
        | ERunningImageStatus.IGNORED;
    }
  | {
      status: ERunningImageStatus.COMPLETED;
      detections: DetectionResult[];
      detectionOptions: DetectOptions;
      hasError: boolean;
    };

type JobResponse = {
  detectionResults: DetectionResult[];
  detectionCounts: DetectionCountMetadata;
};

const DB_WRITE_ATTEMPT_LIMIT = 5;

const INIT_NUMBER_OF_THREADS = 3;

// these are the errors that, if we see them, it implies Tensorflow
// crashed and we should just exit quickly
const TENSORFLOW_CRASH_ERROR_CODES = ['ECONNREFUSED', 'UND_ERR_SOCKET'];

export class ModelRunner {
  queue: async.QueueObject<JobTask>;

  private prismaClient: PrismaClient;

  private detectWorker: (task: JobTask) => Promise<JobResponse>;

  statusMap: Map<string, JobStatus>; // key is the file path

  logger: winston.Logger = winston.createLogger();

  detectionsCSVFile: CsvFile | undefined;

  currentJobBatchId: number = 1;

  numThreads: number = INIT_NUMBER_OF_THREADS;

  encounteredFatalError: boolean = false;

  internalModelRunStatus: InternalModelRunStatus = 'STARTING_TENSORFLOW';

  constructor(prismaClient: PrismaClient) {
    this.prismaClient = prismaClient;
    this.statusMap = new Map();
    this.detectWorker = async (task: JobTask): Promise<JobResponse> => {
      const response = await this.processJobTask(task);
      return response;
    };
    this.queue = async.queue(this.detectWorker, this.numThreads);
  }

  /**
   * Check if *any* job (i.e. 'task', i.e. an image) has an error.
   */
  private doesSomeJobHaveAnError(): boolean {
    // iterate through the status map to see if there are any errors
    // intentionally use a for...of loop instead of a `forEach` because the
    // statusMap can be very large and we want to be able to break out of the
    // loop
    // eslint-disable-next-line no-restricted-syntax
    for (const jobStatus of this.statusMap.values()) {
      if (
        jobStatus.status === ERunningImageStatus.COMPLETED &&
        jobStatus.hasError
      ) {
        return true;
        break;
      }
    }
    return false;
  }

  /**
   * Process a job task (i.e. an image)
   *
   * NOTE: there is no need to wrap this function in a try/catch. Any thrown errors
   * will bubble up and be received by the `processJobTaskCompletion` function in
   * the `error` argument. Any errors should get processed there.
   */
  private async processJobTask(task: JobTask): Promise<JobResponse> {
    this.statusMap.set(task.inputPath, {
      status: ERunningImageStatus.IN_PROGRESS,
    });
    const detect = task.framework === 'YOLOv5' ? YOLOv5Detect : AutoMLDetect;

    const detections = await detect(
      task.folder,
      task.inputPath,
      task.options,
      this.logger,
    );
    const detectionMetadata = getDetectionCounts(detections);

    return {
      detectionResults: detections,
      detectionCounts: detectionMetadata,
    };
  }

  /*
   * If the current job batch id is not equal to this task's batch id then it
   * means we kicked off a new batch already (due to some fatal error that had
   * occurred with our previous batch), so we should ignore these results.
   * These results are from jobs from the previous batch that we did
   * not get canceled.
   */
  shouldWeIgnoreThisTask(task: JobTask): boolean {
    return task.jobBatchId !== this.currentJobBatchId;
  }

  /**
   * When a job has finished running (either with an error or with a
   * DetectionResult response) then update the job's status and write any
   * necessary results to the detections CSV file.
   */
  private async processJobTaskCompletion(
    task: JobTask,
    error?: Error | null,
    jobResponse?: JobResponse,
  ): Promise<void> {
    if (this.shouldWeIgnoreThisTask(task)) {
      // ignore the results
      return;
    }

    if (error) {
      this.logger.error({
        message: `Error processing task.\n${error.message}`,
        task,
        stack: error.stack,
      });

      if (
        isSystemError(error) &&
        TENSORFLOW_CRASH_ERROR_CODES.includes(error.cause.code)
      ) {
        console.error(error);

        // rethrow the error so we can catch this a level up
        throw error;
      }

      // update the error stats of the current model run
      await this.writeToDBWithRetries((prisma) =>
        prisma.modelRun.update({
          where: { id: task.runId },
          // NOTE: this will need to change if a job task ever includes more
          // than 1 image
          data: {
            imageCount: { increment: 1 },
            errorCount: { increment: 1 },
          },
        }),
      );

      // update the in-memory status of this task
      this.statusMap.set(task.inputPath, {
        status: ERunningImageStatus.COMPLETED,
        detectionOptions: task.options,
        detections: [],
        hasError: true,
      });
    } else if (jobResponse) {
      const { detectionResults, detectionCounts } = jobResponse;

      // update the stats of the current model run with the newest data we
      // just detected
      await this.writeToDBWithRetries((prisma) =>
        prisma.modelRun.update({
          where: { id: task.runId },
          data: {
            imageCount: {
              increment: detectionCounts.imagesInspectedCount,
            },
            detectedObjectCount: {
              increment: detectionCounts.detectedObjectCount,
            },
            emptyImageCount: {
              increment: detectionCounts.emptyImageCount,
            },
          },
        }),
      );

      // update the in-memory status of this task
      this.statusMap.set(task.inputPath, {
        status: ERunningImageStatus.COMPLETED,
        detectionOptions: task.options,
        detections: detectionResults,
        hasError: false,
      });

      // write to the detections CSV
      detectionResults.forEach((detection) => {
        this.detectionsCSVFile?.append(detection);
      });
    }
  }

  /**
   * This function is called when all jobs are completed.
   */
  private async processAllJobsComplete(
    modelRunConfig: ModelExecutionConfig,
    options: { elapsedTimeMs: number; hasError: boolean },
  ): Promise<void> {
    const { elapsedTimeMs, hasError } = options;
    this.logger.info(`All files finished processing in ${elapsedTimeMs}ms`);

    // remove any jobs in memory that still say they're processing.
    // This happens when we encountered a fatal error which ends the job,
    // but some images staid 'in progress'. We will change their status
    // to IGNORED
    this.statusMap.forEach((jobStatus, filePath) => {
      if (jobStatus.status === ERunningImageStatus.IN_PROGRESS) {
        this.statusMap.set(filePath, {
          status: ERunningImageStatus.IGNORED,
        });
      }
    });

    // write the final status to the model
    await this.writeToDBWithRetries((prisma) =>
      prisma.modelRun.update({
        where: { id: modelRunConfig.modelRunId },
        data: {
          status: hasError ? 'FINISHED_WITH_ERRORS' : 'SUCCESS',
        },
      }),
    );

    this.detectionsCSVFile?.close();
    this.internalModelRunStatus = 'COMPLETED';
  }

  private async writeToDBWithRetries<T>(
    dbWriteFunc: (prismaClient: PrismaClient) => Promise<T>,
  ): Promise<T> {
    // update the stats of the current model run with the newest data we
    // just detected
    let error: Error | undefined;

    /* eslint-disable no-await-in-loop */
    for (let i = 1; i <= DB_WRITE_ATTEMPT_LIMIT; i += 1) {
      try {
        const result = await dbWriteFunc(this.prismaClient);
        return result;
      } catch (e) {
        error = e as Error;
        this.logger.error({
          message: 'DB Connection Error Caught',
          stack: error.stack,
        });
        console.error(e);

        if (i < DB_WRITE_ATTEMPT_LIMIT) {
          this.logger.debug('Retrying...');
          await sleep(Math.random() * 100 + 50);
        }
      }
    }
    /* eslint-enable */

    // if we hit our attempt limit then bubble up the last error we saw
    const errorToThrow = error ?? new Error('Failed to write to DB');
    throw errorToThrow;
  }

  /**
   * This resets the winston logger to write to a new output directory.
   * This should get called whenever we are starting a new model run.
   */
  resetLogger(outputDirectory: string): void {
    this.logger = winston.createLogger({
      level: 'debug',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({
          filename: path.join(outputDirectory, LOG_FILE_NAME),
        }),
      ],
    });
  }

  stats(): { idle: boolean; length: number } {
    return {
      idle: this.queue.idle(),
      length: this.queue.length(),
    };
  }

  cleanup(numThreadsToSet: number = INIT_NUMBER_OF_THREADS): void {
    this.statusMap.clear();
    this.queue.kill();
    this.numThreads = numThreadsToSet;
    this.queue = async.queue(this.detectWorker, this.numThreads);
    this.detectionsCSVFile?.close();
    this.detectionsCSVFile = undefined;
    this.encounteredFatalError = false;
  }

  getProgress(): RunnerState {
    const notStarted: string[] = [];
    const inProgress: string[] = [];
    const ignoredImages: string[] = [];
    const completed: Array<{
      inputPath: string;
      outputPath: string;
    }> = [];
    this.statusMap.forEach((jobStatus, file) => {
      switch (jobStatus.status) {
        case ERunningImageStatus.IGNORED: {
          ignoredImages.push(file);
          break;
        }
        case ERunningImageStatus.NOT_STARTED: {
          notStarted.push(file);
          break;
        }
        case ERunningImageStatus.IN_PROGRESS: {
          inProgress.push(file);
          break;
        }
        case ERunningImageStatus.COMPLETED: {
          const { detections } = jobStatus;
          detections.forEach((detection) => {
            completed.push({
              inputPath: file,
              // If we support outputStyle = 'none' at some point, perhaps
              // make 'outputPath' possibly undefined?
              outputPath: detection.outputPath,
            });
          });
          break;
        }
        default:
          assertUnreachable(jobStatus);
      }
    });

    return {
      internalModelRunStatus: this.internalModelRunStatus,
      notStarted,
      inProgress,
      completed,
      ignoredImages,
    };
  }

  async findFilesAndScheduleJobs(
    startTime: number,
    config: ModelExecutionConfig,
  ): Promise<void> {
    this.logger.info(`Number of threads: ${this.numThreads}`);
    this.internalModelRunStatus = 'IN_PROGRESS';

    const {
      inputFolder,
      inputSize,
      outputFolder,
      outputStyle,
      threshold,
      classNames,
      modelName,
      modelRunId,
      framework,
    } = config;
    const detectionOptions: DetectOptions = {
      threshold,
      modelName,
      classNames,
      outputFolder,
      outputStyle,
      inputSize,
    };

    try {
      // Look for all image files recursively in all directories
      recursive(
        inputFolder,
        [
          (file: string, stats) => {
            // if this is a directory, ignore the __MACOSX directory
            if (stats.isDirectory()) {
              return HIDDEN_DIRECTORY_NAMES.some((regex) => regex.test(file));
            }

            // ignore unsupported files
            return !isSupported(file);
          },
        ],
        (_error: Error, files: string[]) => {
          files.forEach((inputPath) => {
            // set the file as NOT_STARTED
            this.statusMap.set(inputPath, {
              status: ERunningImageStatus.NOT_STARTED,
            });
            const task: JobTask = {
              folder: inputFolder,
              options: detectionOptions,
              inputPath,
              runId: modelRunId,
              framework,
              jobBatchId: this.currentJobBatchId,
            };

            // queue this file for processing
            this.queue.push(
              task,
              async (err?: Error | null, jobResponse?: JobResponse) => {
                if (this.shouldWeIgnoreThisTask(task)) {
                  return;
                }

                try {
                  await this.processJobTaskCompletion(task, err, jobResponse);
                } catch (error) {
                  // a system error means something went wrong with Tensorflow,
                  // e.g. OOM (Out Of Memory) error
                  if (isSystemError(error as Error)) {
                    this.logger.info(
                      `Encountered a fatal error on job batch ${task.jobBatchId}. Canceling its jobs.`,
                    );

                    if (!this.shouldWeIgnoreThisTask(task)) {
                      this.queue.pause();

                      // remove all jobs
                      this.queue.remove(() => true);
                      this.encounteredFatalError = true;
                    }
                  }
                }
              },
            );
          });
        },
      );

      // wait until all jobs are handled
      this.queue.drain(async () => {
        if (this.encounteredFatalError) {
          // if we are still trying to run the model with multiple threads,
          // remove one thread and try again to see if that conserves memory,
          // because the fatal error could have been an OOM error
          if (this.numThreads > 1) {
            // cleanup runner class bookkeeping
            this.cleanup(this.numThreads - 1);
            this.currentJobBatchId += 1;

            // try again now that we reduced the thread count in order to
            // save up on memory
            this.logger.info(
              'Starting the model execution all over again with one less thread.',
            );
            this.queue.resume();

            // restart docker tensorflow
            this.internalModelRunStatus = 'RESTARTING_MODEL';
            this.logger.info('Restarting docker container...');
            await cleanup(); // cleans up tensorflow and docker
            this.logger.info('Restarting tensorflow server...');
            await start(config.tensorflowModel);
            await waitForStartup(config.tensorflowModel.modelName, this.logger);

            this.findFilesAndScheduleJobs(startTime, config);
          } else {
            this.processAllJobsComplete(config, {
              elapsedTimeMs: Date.now() - startTime,
              hasError: true,
            });

            // This is the case where we got a fatal error while testing
            // with only 1 thread.
            this.internalModelRunStatus = 'FAILED_TO_START';
            await this.writeToDBWithRetries((prisma) =>
              prisma.modelRun.update({
                where: { id: config.modelRunId },
                data: {
                  status: 'FINISHED_WITH_ERRORS',
                },
              }),
            );
          }
        } else {
          this.processAllJobsComplete(config, {
            elapsedTimeMs: Date.now() - startTime,
            hasError: this.doesSomeJobHaveAnError(),
          });
        }
      });
    } catch (error) {
      this.logger.error({
        message: 'Runner Error',
        stack: (error as Error).stack,
      });
      this.detectionsCSVFile?.close();
      throw error;
    }
  }

  async start(config: ModelExecutionConfig): Promise<void> {
    const {
      inputFolder,
      inputSize,
      outputFolder,
      outputStyle,
      threshold,
      classNames,
      modelName,
      framework,
    } = config;

    // log the modelRun options
    this.logger.info('Starting model run');
    this.logger.info(`Model Name: ${modelName}`);
    this.logger.info(`Input Folder: ${inputFolder}`);
    this.logger.info(`Input Size: ${inputSize}`);
    this.logger.info(`Output Folder: ${outputFolder}`);
    this.logger.info(`Output Style: ${outputStyle}`);
    this.logger.info(`Threshold: ${threshold}`);
    this.logger.info(`Framework: ${framework}`);
    this.logger.info(
      `Class Names: ${Array.from(classNames.entries()).toString()}`,
    );

    // initialize the CSV file to write detections
    this.detectionsCSVFile = new CsvFile(outputFolder);

    const startTime = Date.now();
    this.findFilesAndScheduleJobs(startTime, config);
  }
}
