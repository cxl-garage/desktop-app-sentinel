import * as async from 'async';
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

type JobTask = {
  folder: string;
  inputPath: string;
  options: DetectOptions;
  runId: number;
  framework: 'AutoML' | 'YOLOv5';
};

export const LOG_FILE_NAME = 'output.log';

type JobStatus =
  | {
      status: ERunningImageStatus.NOT_STARTED | ERunningImageStatus.IN_PROGRESS;
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

export class ModelRunner {
  queue: async.QueueObject<JobTask>;

  private prismaClient: PrismaClient;

  private detectWorker: (task: JobTask) => Promise<JobResponse>;

  statusMap: Map<string, JobStatus>;

  logger: winston.Logger = winston.createLogger();

  detectionsCSVFile: CsvFile | undefined;

  constructor(prismaClient: PrismaClient) {
    this.prismaClient = prismaClient;
    this.statusMap = new Map();
    this.detectWorker = async (task: JobTask): Promise<JobResponse> => {
      const response = await this.processJobTask(task);
      return response;
    };
    this.queue = async.queue(this.detectWorker, 3);
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
    if (error) {
      this.logger.error({
        message: 'Error processing task',
        task,
        stack: error.stack,
      });
      console.error(error);

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
    modelRunId: number,
    elapsedTimeMs: number,
  ): Promise<void> {
    this.logger.info(`All files finished processing in ${elapsedTimeMs}ms`);

    // iterate through the status map to see if there are any errors
    // intentionally use a for...of loop instead of a `forEach` because the
    // statusMap can be very large and we want to be able to break out of the
    // loop
    let someJobHasAnError = false;

    // eslint-disable-next-line no-restricted-syntax
    for (const jobStatus of this.statusMap.values()) {
      if (
        jobStatus.status === ERunningImageStatus.COMPLETED &&
        jobStatus.hasError
      ) {
        someJobHasAnError = true;
        break;
      }
    }

    // write the final status to the model
    await this.writeToDBWithRetries((prisma) =>
      prisma.modelRun.update({
        where: { id: modelRunId },
        data: {
          status: someJobHasAnError ? 'FINISHED_WITH_ERRORS' : 'SUCCESS',
        },
      }),
    );

    this.detectionsCSVFile?.close();
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
          filename: `${outputDirectory}/${LOG_FILE_NAME}`,
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

  cleanup(): void {
    this.statusMap.clear();
    this.queue.kill();
    this.queue = async.queue(this.detectWorker, 3);
    this.detectionsCSVFile?.close();
    this.detectionsCSVFile = undefined;
  }

  getProgress(): RunnerState {
    const notStarted: string[] = [];
    const inProgress: string[] = [];
    const completed: Array<{
      inputPath: string;
      outputPath: string;
    }> = [];
    this.statusMap.forEach((jobStatus, file) => {
      switch (jobStatus.status) {
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

    return { notStarted, inProgress, completed };
  }

  async start({
    inputFolder,
    inputSize,
    outputFolder,
    outputStyle,
    threshold,
    classNames,
    modelName,
    modelRunId,
    framework,
  }: {
    inputFolder: string;
    inputSize: number;
    outputFolder: string;
    outputStyle: OutputStyle;
    threshold: number;
    classNames: Map<number, string>;
    modelName: string;
    modelRunId: number;
    framework: 'AutoML' | 'YOLOv5';
  }): Promise<void> {
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

    const options: DetectOptions = {
      threshold,
      modelName,
      classNames,
      outputFolder,
      outputStyle,
      inputSize,
    };

    const startTime = Date.now();
    try {
      // Look for all image files recursively in all directories
      recursive(
        inputFolder,
        [(file, stats) => !stats.isDirectory() && !isSupported(file)],
        (_error: Error, files: string[]) => {
          files.forEach((inputPath) => {
            // set the file as NOT_STARTED
            this.statusMap.set(inputPath, {
              status: ERunningImageStatus.NOT_STARTED,
            });
            const task: JobTask = {
              folder: inputFolder,
              inputPath,
              options,
              runId: modelRunId,
              framework,
            };

            // queue this file for processing
            this.queue.push(
              task,
              (err?: Error | null, jobResponse?: JobResponse) => {
                this.processJobTaskCompletion(task, err, jobResponse);
              },
            );
          });
        },
      );

      // wait until all jobs are handled
      this.queue.drain(() => {
        const elapsedTimeMs = Date.now() - startTime;
        this.processAllJobsComplete(modelRunId, elapsedTimeMs);
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
}
