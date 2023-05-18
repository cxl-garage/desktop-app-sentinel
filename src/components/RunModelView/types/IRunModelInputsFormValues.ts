import * as RunModelOptions from '../../../models/RunModelOptions';

interface IRunModelInputsFormValues {
  modelName: string;
  dataset: string;
  outputStyle: RunModelOptions.EOutputStyle;
  confidenceThreshold: number;
  outputDirectory: string;
}

export default IRunModelInputsFormValues;
