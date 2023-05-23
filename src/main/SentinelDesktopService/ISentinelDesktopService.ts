import * as LogRecord from 'models/LogRecord';
import * as CXLModelResults from 'models/CXLModelResults';
import * as DockerVersion from 'models/DockerVersion';
import * as RunModelOptions from '../../models/RunModelOptions';
import * as ModelRunProgress from '../../models/ModelRunProgress';

export interface ISentinelDesktopService {
  getAllLogRecords(): Promise<LogRecord.T[]>;
  getAllCXLModelResults(): Promise<CXLModelResults.T[]>;
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
