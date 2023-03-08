declare global {
  interface Window {
    SentinelDesktopService: {
      findOrgModels: (arg: any) => Promise<any>;
      runModel: (arg?: any) => Promise<any>;
      writeUserInputJson: (arg: any) => Promise<any>;
      selectInputFolder: () => Promise<any>;
      selectOutputFolder: () => Promise<any>;
      readLogFile: () => Promise<any>;
      readUpdate: () => Promise<any>;
      readResults: () => Promise<any>;
      readModels: () => Promise<any>;
      openWindow: (arg: any) => Promise<any>;
      countFiles: (arg: any) => Promise<any>;
    };
  }
}

export {};
