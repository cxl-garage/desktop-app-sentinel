import * as LogRecord from 'models/LogRecord';

declare global {
  interface Window {
    // TODO: once all deprecated functions are either refactored or
    // removed, this type should just be the ISentinelDesktopService type
    SentinelDesktopService: {
      getLogRecords: () => Promise<LogRecord.T[]>;

      // deprecated functions (need refactoring)
      findOrgModels: (arg: any) => Promise<any>;
      runModel: (arg?: any) => Promise<any>;
      writeUserInputJson: (arg: any) => Promise<any>;
      selectInputFolder: () => Promise<any>;
      selectOutputFolder: () => Promise<any>;
      readUpdate: () => Promise<any>;
      readResults: () => Promise<any>;
      readModels: () => Promise<any>;
      openWindow: (arg: any) => Promise<any>;
      countFiles: (arg: any) => Promise<any>;
    };
  }
}

export {};
