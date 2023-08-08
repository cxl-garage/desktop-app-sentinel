/**
 * Functions to help with the tensorflow savemodel files
 * used as model input
 */
import fs from 'fs';
import path from 'path';

export type TensorflowModel = {
  modelPath: string;
  classNames: Map<number, string>;
  modelName: string;
  savedModelPath: string;
  inputSize: number;
};

export function getTensorflowModel(modelPath: string): TensorflowModel {
  // TODO: Handle errors, validate config.json, etc.
  const data = fs.readFileSync(`${modelPath}/config.json`, 'utf-8');
  const json = JSON.parse(data);

  // Parse out the class names of the form [{"name": "xxx", "id": y}, ...]
  const classNames = new Map<number, string>();
  json.classes.forEach((clazz: { name: string; id: number }) => {
    const { name, id } = clazz;
    if (id !== null) {
      classNames.set(id, name);
    }
  });
  return {
    modelPath,
    classNames,
    modelName: json.algName,
    inputSize: json.inputSize,
    savedModelPath: path.join(modelPath, 'data'),
  };
}
