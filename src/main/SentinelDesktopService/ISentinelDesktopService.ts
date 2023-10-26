import * as LogRecord from 'models/LogRecord';
import * as DockerVersion from 'models/DockerVersion';
import type { ContainerInfo } from 'dockerode';
import { ModelRun } from '../../generated/prisma/client';
import * as RunModelOptions from '../../models/RunModelOptions';
import * as ModelRunProgress from '../../models/ModelRunProgress';
import * as DockerImage from '../../models/DockerImage';

export interface ISentinelDesktopService {
  getAllLogRecords(): Promise<LogRecord.T[]>;
  getAllCXLModelResults(modelName?: string): Promise<ModelRun[]>;
  getFilesInDir: (dirPath: string, recursive?: boolean) => Promise<string[]>;
  getModelOutputs: (modelId: number) => Promise<string[]>;
  findImage: () => Promise<DockerImage.T | null>;
  pullImage: () => Promise<void>;
  getContainers: () => Promise<ContainerInfo[]>;
  getVersion: () => Promise<DockerVersion.T>;
  getLogContents: (
    modelRunId: number,
  ) => Promise<LogRecord.LogMessage[] | null>;
  startModel: (options: RunModelOptions.T) => Promise<number>;
  cleanup: () => Promise<void>;
  isInProgress: boolean;
  getCurrentModelRunProgress: () => Promise<ModelRunProgress.T | null>;
  updateModelRun: (
    modelId: number,
    outputDirectory: string,
  ) => Promise<ModelRun>;
}
