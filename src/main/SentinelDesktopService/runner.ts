import * as async from 'async';
import * as fs from 'node:fs/promises';
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

type JobTask = {
  folder: string;
  file: string;
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

export class ModelRunner {
  queue: async.QueueObject<JobTask>;

  private detectWorker: (task: JobTask) => Promise<JobResponse>;

  statusMap: Map<string, JobStatus>;

  constructor(prismaClient: PrismaClient) {
    this.statusMap = new Map();
    this.detectWorker = async (task: JobTask) => {
      this.statusMap.set(task.file, {
        status: ERunningImageStatus.IN_PROGRESS,
      });
      const detections = await detect(task.folder, task.file, task.options);
      const detectionMetadata = getDetectionCounts(detections);

      // update the stats of the current model run with the newest data we
      // just detected
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
    const completed: Array<{ fileName: string; parentDir?: string }> = [];
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
          const { detections, detectionOptions } = jobStatus;
          detections.forEach((detection) => {
            if (detectionOptions.outputStyle === 'class') {
              // if output style is 'class' then we need to also pass a `parentDir`
              // so that the frontend knows how to find this image by taking the
              // concatenation of {outputDir}/{parentDir}/{file}
              completed.push({
                fileName: file,
                parentDir: detection.className,
              });
            } else {
              completed.push({ fileName: file });
            }
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
    // This information should be exposed to the GUI
    const options: DetectOptions = {
      threshold,
      modelName,
      classNames: await getClassNames(modelName),
      outputFolder,
      outputStyle,
    };
    try {
      const files = await fs.readdir(inputFolder);
      const startTime = Date.now();
      files.forEach((file) => {
        this.statusMap.set(file, { status: ERunningImageStatus.NOT_STARTED });
        const task: JobTask = {
          folder: inputFolder,
          file,
          options,
          runId: modelRunId,
        };
        this.queue.push(
          task,
          (err?: Error | null, detectionResults?: JobResponse) => {
            if (err) {
              console.log('Error procsesing task', task);
              console.error(err);
            }

            if (detectionResults) {
              this.statusMap.set(file, {
                status: ERunningImageStatus.COMPLETED,
                detectionOptions: task.options,
                detections: detectionResults,
              });
            }
          },
        );
      });
      this.queue.drain(() => {
        const elapsed = Date.now() - startTime;
        console.log(`All files finished processing in ${elapsed}`);
      });
    } catch (error) {
      // ignore
      console.error('Runner Error');
    }
  }
}
