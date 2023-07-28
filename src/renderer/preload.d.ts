import * as LogRecord from 'models/LogRecord';
import * as DockerVersion from 'models/DockerVersion';
import * as DockerImage from 'models/DockerImage';
import type { ContainerInfo } from 'dockerode';
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
      getFilesInDir: (dirPath: string, boolean?: string) => Promise<string[]>;
      getModelOutputs: (modelId: number) => Promise<string[]>;
      findImage: () => Promise<DockerImage.T | undefined>;
      pullImage: () => Promise<void>;
      getContainers: () => Promise<ContainerInfo[]>;
      getVersion: () => Promise<DockerVersion.T>;
      startModel: (options: RunModelOptions.T) => Promise<number>;
      cleanup: () => Promise<void>;
      getCurrentModelRunProgress: () => Promise<ModelRunProgress.T | null>;
      getIsModelRunInProgress: () => Promise<boolean>;
      selectInputFolder: () => Promise<any>;
      selectOutputFolder: () => Promise<any>;
      openFile: (filePath: string) => Promise<void>;

      // deprecated functions (need refactoring)
      findOrgModels: (arg: any) => Promise<any>;
      runModel: (arg?: any) => Promise<any>;
      writeUserInputJson: (arg: any) => Promise<any>;
      readUpdate: () => Promise<any>;
      readModels: () => Promise<any>;
      openWindow: (arg: any) => Promise<any>;
      countFiles: (arg: any) => Promise<any>;
    };
  }
}

export {};
