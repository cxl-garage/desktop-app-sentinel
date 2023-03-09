import * as LogRecord from 'models/LogRecord';

export interface ISentinelDesktopService {
  getLogRecords(): Promise<LogRecord.T[]>;
}
