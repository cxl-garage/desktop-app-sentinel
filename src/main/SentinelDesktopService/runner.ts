import * as async from 'async';
import recursive from 'recursive-readdir';
import winston from 'winston';
import sleep from '../../util/sleep';
import assertUnreachable from '../../util/assertUnreachable';
import { PrismaClient } from '../../generated/prisma/client';
import { RunnerState } from '../../models/ModelRunProgress';
import ERunningImageStatus from '../../components/RunModelView/types/ERunningImageStatus';
import {
  detect,
  DetectionResult,
  DetectOptions,
  getDetectionCounts,
  OutputStyle,
} from './detect';
import { CsvFile } from './csv';
import { isSupported } from './image';

type JobTask = {
  folder: string;
  inputPath: string;
  options: DetectOptions;
  runId: number;
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
    };

type JobResponse = DetectionResult[];

const DB_WRITE_ATTEMPT_LIMIT = 5;

export class ModelRunner {
  queue: async.QueueObject<JobTask>;

  private detectWorker: (task: JobTask) => Promise<JobResponse>;

  statusMap: Map<string, JobStatus>;

  logger: winston.Logger = winston.createLogger();

  constructor(prismaClient: PrismaClient) {
    this.statusMap = new Map();
    this.detectWorker = async (task: JobTask) => {
      this.statusMap.set(task.inputPath, {
        status: ERunningImageStatus.IN_PROGRESS,
      });
      const detections = await detect(
        task.folder,
        task.inputPath,
        task.options,
        this.logger,
      );
      const detectionMetadata = getDetectionCounts(detections);

      // update the stats of the current model run with the newest data we
      // just detected
      for (let i = 1; i <= DB_WRITE_ATTEMPT_LIMIT; i += 1) {
        try {
          // eslint-disable-next-line no-await-in-loop
          await prismaClient.modelRun.update({
            where: { id: task.runId },
            data: {
              imageCount: { increment: detectionMetadata.imagesInspectedCount },
              detectedObjectCount: {
                increment: detectionMetadata.detectedObjectCount,
              },
              emptyImageCount: { increment: detectionMetadata.emptyImageCount },
            },
          });
          break;
        } catch (e) {
          this.logger.error({
            message: 'DB Connection Error Caught',
            stack: (e as Error).stack,
          });
          console.error(e);

          if (i < DB_WRITE_ATTEMPT_LIMIT) {
            this.logger.debug('Retrying...');
            // eslint-disable-next-line no-await-in-loop
            await sleep(Math.random() * 100 + 50);
          }
        }
      }

      return detections;
    };
    this.queue = async.queue(this.detectWorker, 3);
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
  }: {
    inputFolder: string;
    inputSize: number;
    outputFolder: string;
    outputStyle: OutputStyle;
    threshold: number;
    classNames: Map<number, string>;
    modelName: string;
    modelRunId: number;
  }): Promise<void> {
    this.resetLogger(outputFolder);
    this.logger.info('Starting model run');
    this.logger.info(`Model Name: ${modelName}`);
    this.logger.info(`Input Folder: ${inputFolder}`);
    this.logger.info(`Input Size: ${inputSize}`);
    this.logger.info(`Output Folder: ${outputFolder}`);
    this.logger.info(`Output Style: ${outputStyle}`);
    this.logger.info(`Threshold: ${threshold}`);
    this.logger.info(
      `Class Names: ${Array.from(classNames.entries()).toString()}`,
    );

    const options: DetectOptions = {
      threshold,
      modelName,
      classNames,
      outputFolder,
      outputStyle,
      inputSize,
    };

    const csvFile = new CsvFile(outputFolder);
    const startTime = Date.now();
    try {
      // Look for all image files recursively in all directories
      recursive(
        inputFolder,
        [(file, stats) => !stats.isDirectory() && !isSupported(file)],
        (_error: Error, files: string[]) => {
          files.forEach((inputPath) => {
            this.statusMap.set(inputPath, {
              status: ERunningImageStatus.NOT_STARTED,
            });
            const task: JobTask = {
              folder: inputFolder,
              inputPath,
              options,
              runId: modelRunId,
            };
            this.queue.push(
              task,
              (err?: Error | null, detectionResults?: JobResponse) => {
                if (err) {
                  this.logger.error({
                    message: 'Error processing task',
                    task,
                    stack: (err as Error).stack,
                  });
                  console.error(err);
                }

                if (detectionResults) {
                  this.statusMap.set(inputPath, {
                    status: ERunningImageStatus.COMPLETED,
                    detectionOptions: task.options,
                    detections: detectionResults,
                  });
                  detectionResults.forEach((detection) =>
                    csvFile.append(detection),
                  );
                }
              },
            );
          });
        },
      );

      // Wait until all jobs are handled
      this.queue.drain(() => {
        const elapsed = Date.now() - startTime;
        this.logger.info(`All files finished processing in ${elapsed}ms`);
        csvFile.close();
      });
    } catch (error) {
      this.logger.error({
        message: 'Runner Error',
        stack: (error as Error).stack,
      });
      csvFile.close();
      throw error;
    }
  }
}
