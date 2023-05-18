import * as LogRecord from 'models/LogRecord';
import * as CXLModelResults from 'models/CXLModelResults';
import IRunModelOptions from '../../models/IRunModelOptions';

export interface ISentinelDesktopService {
  getAllLogRecords(): Promise<LogRecord.T[]>;
  getAllCXLModelResults(): Promise<CXLModelResults.T[]>;
  getFilesInDir: (dirPath: string) => Promise<string[]>;
  getImages: () => Promise<any[]>;
  getContainers: () => Promise<any[]>;
  startModel: (options: IRunModelOptions) => Promise<boolean>;
  cleanup: () => Promise<void>;
  getModelNames: () => Promise<string[]>;
}
