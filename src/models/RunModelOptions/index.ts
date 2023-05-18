export enum EOutputStyle {
  CLASS = 'class',
  HIERARCHY = 'hierarchy', // is there a typo in https://github.com/cxl-garage/sentinel-cli ?
  FLAT = 'flat',
  TIMELAPSE = 'timelapse',
  NONE = 'none',
}

interface RunModelOptions {
  modelName: string;
  outputStyle: EOutputStyle;
  confidenceThreshold: number;
  inputDirectory: string; // dataset location
  outputDirectory: string;
}

export { RunModelOptions as T };
