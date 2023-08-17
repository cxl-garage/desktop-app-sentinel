/* eslint-disable no-await-in-loop */
/**
 * Functions to help with the tensorflow savemodel files
 * used as model input
 */
import fs from 'fs';
import path from 'path';
import winston from 'winston';
import sleep from '../../util/sleep';

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

const RETRY_WAIT_TIME = 2000; // millseconds
const MAXIMUM_ATTEMPTS = 30;

/** Waits until the model status endpoint reports AVAILABLE */
export async function waitForStartup(
  modelName: string,
  logger: winston.Logger,
): Promise<void> {
  const url = `http://localhost:8501/v1/models/${modelName}`;
  logger.info(`Waiting for tensforflow model startup at ${url}`);
  for (let attempt = 1; attempt <= MAXIMUM_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
      });
      const json = await response.json();
      const { state } = json.model_version_status[0];
      if (state !== 'AVAILABLE') {
        logger.info(`On attempt ${attempt} got status ${state}, retrying`);
        await sleep(RETRY_WAIT_TIME);
      } else {
        logger.info(`On attempt ${attempt} got AVAILABLE status.`);
        return;
      }
    } catch (error) {
      logger.info({
        message: `Waiting for tensorflow model startup, attempt ${attempt}`,
        stack: (error as Error).stack,
      });
      await sleep(RETRY_WAIT_TIME);
    }
  }
  const message =
    'Exceeded maximum number of attempts waiting for tensorflow startup.';
  logger.error(message);
  throw new Error(message);
}
