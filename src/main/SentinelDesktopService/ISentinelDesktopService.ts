import * as LogRecord from 'models/LogRecord';
import * as CXLModelResults from 'models/CXLModelResults';

export interface ISentinelDesktopService {
  getAllLogRecords(): Promise<LogRecord.T[]>;
  getAllCXLModelResults(): Promise<CXLModelResults.T[]>;
  getFilesInDir: (dirPath: string) => Promise<string[]>;
  getImages: () => Promise<any[]>;
  getContainers: () => Promise<any[]>;
  startModel: (folder: string, modelName: string) => Promise<boolean>;
  cleanup: () => Promise<void>;
}
