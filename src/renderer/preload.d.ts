declare global {
  interface Window {
    electron: {
      FindOrgModels: (arg: any) => Promise<any>;
      RunModel: (arg?: any) => Promise<any>;
      WriteUserInputJson: (arg: any) => Promise<any>;
      SelectInputFolder: () => Promise<any>;
      SelectOutputFolder: () => Promise<any>;
      ReadLogFile: () => Promise<any>;
      ReadUpdate: () => Promise<any>;
      ReadResults: () => Promise<any>;
      ReadModels: () => Promise<any>;
      OpenWindow: (arg: any) => Promise<any>;
      CountFiles: (arg: any) => Promise<any>;
    };
  }
}

export {};
