import * as LogRecord from 'models/LogRecord';
import * as DockerVersion from 'models/DockerVersion';
import { ModelRun } from '@prisma/client';
import * as RunModelOptions from '../../models/RunModelOptions';
import * as ModelRunProgress from '../../models/ModelRunProgress';

export interface ISentinelDesktopService {
  getAllLogRecords(): Promise<LogRecord.T[]>;
  getAllCXLModelResults(): Promise<ModelRun[]>;
  getFilesInDir: (dirPath: string) => Promise<string[]>;
  getImages: () => Promise<any[]>;
  getContainers: () => Promise<any[]>;
  getVersion: () => Promise<DockerVersion.T>;
  startModel: (options: RunModelOptions.T) => Promise<number>;
  cleanup: () => Promise<void>;
  getModelNames: () => Promise<string[]>;
  isInProgress: boolean;
  getCurrentModelRunProgress: () => Promise<ModelRunProgress.T | null>;
}
