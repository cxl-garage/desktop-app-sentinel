/* eslint-disable no-await-in-loop */
/**
 * Functions to help with the tensorflow savemodel files
 * used as model input
 */
import fs from 'fs';
import path from 'path';
import winston from 'winston';
import { z, ZodError } from 'zod';
import sleep from '../../util/sleep';

export type TensorflowModel = {
  modelPath: string;
  classNames: Map<number, string>;
  modelName: string;
  savedModelPath: string;
  inputSize: number;
};

const ModelClassDefinition = z.object({
  name: z.string(),
  id: z.number(),
});

const ModelConfig = z.object({
  algName: z.string(),
  inputSize: z.number(),
  classes: z.array(ModelClassDefinition),
});
type ModelConfig = z.infer<typeof ModelConfig>;

function readAndValidateModelConfig(modelPath: string): ModelConfig {
  let json;
  try {
    const data = fs.readFileSync(path.join(modelPath, 'config.json'), 'utf-8');
    json = JSON.parse(data);
  } catch (error) {
    throw Error(
      `Failed to read model config.json! Original error: ${
        (error as Error).message
      }`,
    );
  }

  try {
    return ModelConfig.parse(json);
  } catch (error) {
    throw Error(
      `Invalid model config! Original error: ${(error as ZodError).message}`,
    );
  }
}

export function getTensorflowModel(modelPath: string): TensorflowModel {
  const parsedModelConfig = readAndValidateModelConfig(modelPath);
  const savedModelPath = path.join(modelPath, 'data');

  if (!fs.existsSync(savedModelPath)) {
    throw Error(`No "data" directory present in model ${modelPath} !`);
  }

  // Parse out the class names of the form [{"name": "xxx", "id": y}, ...]
  const classNames = new Map<number, string>();
  parsedModelConfig.classes.forEach((clazz: { name: string; id: number }) => {
    const { name, id } = clazz;
    if (id !== null) {
      classNames.set(id, name);
    }
  });

  return {
    modelPath,
    classNames,
    modelName: parsedModelConfig.algName,
    inputSize: parsedModelConfig.inputSize,
    savedModelPath,
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
