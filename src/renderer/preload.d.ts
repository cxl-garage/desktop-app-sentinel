import * as LogRecord from 'models/LogRecord';
import * as DockerVersion from 'models/DockerVersion';
import type { ContainerInfo, ContainerInfo } from 'dockerode';
import * as DockerImage from 'models/DockerImage';
import { ModelRun } from '../generated/prisma/client';
import { ModelRun } from '../../generated/prisma/client';
import * as RunModelOptions from '../models/RunModelOptions';
import * as ModelRunProgress from '../models/ModelRunProgress';

declare global {
  interface Window {
    // TODO: once all deprecated functions are either refactored or
    // removed, this type should just be the ISentinelDesktopService type
    SentinelDesktopService: {
      getAllLogRecords: () => Promise<LogRecord.T[]>;
      getAllCXLModelResults: (modelName?: string) => Promise<ModelRun[]>;
      getEnv: (envKey: string) => Promise<string | undefined>;
      getFilesInDir: (dirPath: string, boolean?: string) => Promise<string[]>;
      getModelOutputs: (modelId: number) => Promise<string[]>;
      findImage: () => Promise<DockerImage.T | undefined>;
      pullImage: () => Promise<void>;
      getContainers: () => Promise<ContainerInfo[]>;
      getVersion: () => Promise<DockerVersion.T>;
      getLogContents: (
        modelRunId: number,
      ) => Promise<LogRecord.LogMessage[] | null>;
      startModel: (options: RunModelOptions.T) => Promise<number>;
      cleanup: () => Promise<void>;
      getCurrentModelRunProgress: () => Promise<ModelRunProgress.T | null>;
      getIsModelRunInProgress: () => Promise<boolean>;
      getIsModelDirectoryValid: (modelDirectory: string) => Promise<boolean>;
      selectFolder: () => Promise<string | undefined>;
      openFile: (filePath: string) => Promise<void>;
      updateModelRun: (
        modelId: number,
        outputDirectory: string,
      ) => Promise<ModelRun>;
    };
  }
}

export {};
