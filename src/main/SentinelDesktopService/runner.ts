import * as async from 'async';
import recursive from 'recursive-readdir';
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
import { getClassNames } from './docker';
import { CsvFile } from './csv';
import { isSupported } from './image';

type JobTask = {
  folder: string;
  inputPath: string;
  options: DetectOptions;
  runId: number;
};

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
          console.log('DB Connection Error Caught');
          console.log(e);
          if (i < DB_WRITE_ATTEMPT_LIMIT) {
            console.log('Retrying...');
            // eslint-disable-next-line no-await-in-loop
            await sleep(Math.random() * 100 + 50);
          }
        }
      }

      return detections;
    };
    this.queue = async.queue(this.detectWorker, 3);
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
    outputFolder,
    outputStyle,
    threshold,
    modelName,
    modelRunId,
  }: {
    inputFolder: string;
    outputFolder: string;
    outputStyle: OutputStyle;
    threshold: number;
    modelName: string;
    modelRunId: number;
  }): Promise<void> {
    const options: DetectOptions = {
      threshold,
      modelName,
      classNames: await getClassNames(modelName),
      outputFolder,
      outputStyle,
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
            console.log(inputPath);
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
                  console.log('Error processing task', task);
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
        console.log(`All files finished processing in ${elapsed}`);
        csvFile.close();
      });
    } catch (error) {
      console.error('Runner Error');
      csvFile.close();
      throw error;
    }
  }
}
