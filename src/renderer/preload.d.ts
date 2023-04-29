import * as LogRecord from 'models/LogRecord';
import * as CXLModelResults from 'models/CXLModelResults';

declare global {
  interface Window {
    // TODO: once all deprecated functions are either refactored or
    // removed, this type should just be the ISentinelDesktopService type
    SentinelDesktopService: {
      getAllLogRecords: () => Promise<LogRecord.T[]>;
      getAllCXLModelResults: () => Promise<CXLModelResults.T[]>;
      getFilesInDir: (dirPath: string) => Promise<string[]>;
      getImages: () => Promise<any[]>;
      getContainers: () => Promise<any[]>;
      start: (folder: string, modelName: string) => Promise<boolean>;
      cleanup: () => Promise<void>;

      // deprecated functions (need refactoring)
      findOrgModels: (arg: any) => Promise<any>;
      runModel: (arg?: any) => Promise<any>;
      writeUserInputJson: (arg: any) => Promise<any>;
      selectInputFolder: () => Promise<any>;
      selectOutputFolder: () => Promise<any>;
      readUpdate: () => Promise<any>;
      readModels: () => Promise<any>;
      openWindow: (arg: any) => Promise<any>;
      countFiles: (arg: any) => Promise<any>;
    };
  }
}

export {};
