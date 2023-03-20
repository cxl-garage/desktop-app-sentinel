import * as LogRecord from 'models/LogRecord';
import * as CXLModelResults from 'models/CXLModelResults';

export interface ISentinelDesktopService {
  getAllLogRecords(): Promise<LogRecord.T[]>;
  getAllCXLModelResults(): Promise<CXLModelResults.T[]>;
  getFilesInDir: (dirPath: string) => Promise<string[]>;
}
