import * as async from 'async';
import * as fs from 'node:fs/promises';
import { PrismaClient } from '../../generated/prisma/client';
import { RunnerState } from '../../models/ModelRunProgress';
import ERunningImageStatus from '../../components/RunModelView/types/ERunningImageStatus';
import {
  detect,
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

export class ModelRunner {
  queue: async.QueueObject<any>;

  private detectWorker: (task: JobTask, callback: () => void) => Promise<void>;

  statusMap: Map<string, ERunningImageStatus>; // filename ->  status

  constructor(prismaClient: PrismaClient) {
    this.statusMap = new Map();
    this.detectWorker = async (task: JobTask, callback) => {
      this.statusMap.set(task.file, ERunningImageStatus.IN_PROGRESS);
      const detections = await detect(task.folder, task.file, task.options);

      const detectionMetadata = getDetectionCounts(detections);
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
      callback();
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
    const completed: string[] = [];
    this.statusMap.forEach((status, file) => {
      switch (status) {
        case ERunningImageStatus.NOT_STARTED: {
          notStarted.push(file);
          break;
        }
        case ERunningImageStatus.IN_PROGRESS: {
          inProgress.push(file);
          break;
        }
        case ERunningImageStatus.COMPLETED: {
          completed.push(file);
          break;
        }
        default: {
          break;
        }
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
      // inputSize: 256,
      threshold,
      modelName,
      classNames: await getClassNames(modelName),
      outputFolder,
      outputStyle,
    };
    try {
      const files = await fs.readdir(inputFolder);
      files.forEach((file) => {
        console.log(`Processing ${file}`);
        this.statusMap.set(file, ERunningImageStatus.NOT_STARTED);
        const task: JobTask = {
          folder: inputFolder,
          file,
          options,
          runId: modelRunId,
        };
        this.queue.push(task, (_err) => {
          this.statusMap.set(file, ERunningImageStatus.COMPLETED);
          console.log(`Finished processing ${file}`);
        });
      });
      this.queue.drain(() => {
        console.log(`All files finished processing`);
      });
    } catch (error) {
      // ignore
      console.error('Runner Error');
    }
  }
}
