import { EOutputStyle } from '../../../models/IRunModelOptions';

interface IRunModelInputsFormValues {
  modelName: string;
  dataset: string;
  outputStyle: EOutputStyle;
  confidenceThreshold: number;
  outputDirectory: string;
}

export default IRunModelInputsFormValues;
