import * as RunModelOptions from '../../../models/RunModelOptions';

interface IRunModelInputsFormValues {
  modelName: string;
  dataset: string;
  outputStyle: RunModelOptions.EOutputStyle;
  confidenceThreshold: number;
  inputDirectory: string;
  outputDirectory: string;
}

export default IRunModelInputsFormValues;
