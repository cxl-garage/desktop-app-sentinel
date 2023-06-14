import * as LogRecord from 'models/LogRecord';
import * as DockerVersion from 'models/DockerVersion';
import type { ImageInfo, ContainerInfo } from 'dockerode';
import { ModelRun } from '../../generated/prisma/client';
import * as RunModelOptions from '../../models/RunModelOptions';
import * as ModelRunProgress from '../../models/ModelRunProgress';

export interface ISentinelDesktopService {
  getAllLogRecords(): Promise<LogRecord.T[]>;
  getAllCXLModelResults(modelName?: string): Promise<ModelRun[]>;
  getFilesInDir: (dirPath: string, recursive?: boolean) => Promise<string[]>;
  getModelOutputs: (modelId: number) => Promise<string[]>;
  getImages: () => Promise<ImageInfo[]>;
  getContainers: () => Promise<ContainerInfo[]>;
  getVersion: () => Promise<DockerVersion.T>;
  startModel: (options: RunModelOptions.T) => Promise<number>;
  cleanup: () => Promise<void>;
  getModelNames: () => Promise<string[]>;
  isInProgress: boolean;
  getCurrentModelRunProgress: () => Promise<ModelRunProgress.T | null>;
}
