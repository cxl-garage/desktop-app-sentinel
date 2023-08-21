/* eslint-disable no-console */
/* eslint-disable class-methods-use-this */
import path from 'path';
import * as LogRecord from 'models/LogRecord';
import * as DockerVersion from 'models/DockerVersion';
import type { ContainerInfo } from 'dockerode';
import { app } from 'electron';
import { readdir, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { ModelRun, PrismaClient } from '../../generated/prisma/client';
import * as RunModelOptions from '../../models/RunModelOptions';
import * as ModelRunProgress from '../../models/ModelRunProgress';
import { ModelRunner, LOG_FILE_NAME } from './runner';
import type { ISentinelDesktopService } from './ISentinelDesktopService';
import {
  cleanup,
  findImage,
  getContainers,
  getVersion,
  pullImage,
  start,
} from './docker';
import { isSupported } from './image';
import { MISSING_DIR_ERROR_MESSAGE } from './errors';
import * as DockerImage from '../../models/DockerImage';
import { getTensorflowModel, waitForStartup } from './tensorflow';
import { DB_PATH, getPlatformName, platformToExecutables } from '../util';

function getModelRunFinalStatus(status: string): LogRecord.T['status'] {
  switch (status) {
    case 'IN_PROGRESS':
    case 'SUCCESS':
    case 'FINISHED_WITH_ERRORS':
      return status;
    default:
      return 'UNKNOWN';
  }
}

class SentinelDesktopServiceImpl implements ISentinelDesktopService {
  runner: ModelRunner;

  prisma: PrismaClient;

  private registeredModelRunOptions: RunModelOptions.T | null = null;

  private registeredModelRun: ModelRun | null = null;

  private isPreparingForModelRun: boolean = false;

  constructor() {
    this.prisma = new PrismaClient(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      app.isPackaged
        ? {
            datasources: {
              // override the `DATABASE_URL` included in .env
              db: {
                url: `file:${DB_PATH}`,
              },
            },

            __internal: {
              engine: {
                binaryPath: path.join(
                  process.resourcesPath,
                  platformToExecutables[getPlatformName()].queryEngine,
                ),
              },
            },
          }
        : undefined,
    );
    this.runner = new ModelRunner(this.prisma);
  }

  async getVersion(): Promise<DockerVersion.T> {
    return getVersion();
  }

  findImage(): Promise<DockerImage.T | undefined> {
    return findImage();
  }

  pullImage(): Promise<void> {
    return pullImage();
  }

  async getContainers(): Promise<ContainerInfo[]> {
    const containers = await getContainers();
    console.log(JSON.stringify(containers, null, 2));
    return containers;
  }

  cleanup(): Promise<void> {
    this.registeredModelRunOptions = null;
    this.registeredModelRun = null;
    return cleanup();
  }

  async fetchRuns(): Promise<void> {
    const modelRuns = await this.prisma.modelRun.findMany({
      orderBy: [{ startTime: 'desc' }],
    });
    console.log('PREVIOUS RUNS: ');
    console.log(modelRuns);
  }

  /**
   * Write a modelRun to the database
   */
  registerRun(
    options: RunModelOptions.T,
    modelName: string,
  ): Promise<ModelRun> {
    console.log('Registering the model run to db');
    const data = {
      modelPath: options.modelDirectory,
      modelName,
      inputPath: options.inputDirectory,
      outputPath: options.outputDirectory,
      startTime: Math.round(Date.now() / 1000),
      outputStyle: options.outputStyle,
      confidenceThreshold: options.confidenceThreshold,
      status: 'IN_PROGRESS',
    };
    return this.prisma.modelRun.create({ data });
  }

  async getCurrentModelRunProgress(): Promise<ModelRunProgress.T | null> {
    if (!this.registeredModelRunOptions) {
      return null;
    }
    return {
      startModelOptions: this.registeredModelRunOptions,
      modelRun: this.registeredModelRun,
      runnerState: this.registeredModelRun ? this.runner.getProgress() : null,
    };
  }

  get isInProgress(): boolean {
    return this.isPreparingForModelRun || !this.runner.stats().idle;
  }

  async startModel(options: RunModelOptions.T): Promise<number> {
    if (this.isInProgress) {
      throw new Error('A model run is currently in progress');
    }
    this.isPreparingForModelRun = true;
    this.registeredModelRunOptions = options;
    this.registeredModelRun = null;
    try {
      await cleanup();
      this.runner.cleanup();

      // Parse the model directory to see if it contains a valid tensor flow
      // model
      // TODO: handle malformed model directories here.
      console.log('Getting the tensor flow model from the given directory');
      const tensorflow = getTensorflowModel(options.modelDirectory);

      // Setup the logger before we start the docker container so we can
      // log tensorflow ready status
      this.runner.resetLogger(options.outputDirectory);

      await start(tensorflow);
      const modelRun = await this.registerRun(options, tensorflow.modelName);
      this.registeredModelRun = modelRun;

      // It takes some time for the image to start, so wait
      await waitForStartup(tensorflow.modelName, this.runner.logger);

      await this.runner.start({
        inputFolder: options.inputDirectory,
        inputSize: tensorflow.inputSize,
        outputFolder: options.outputDirectory,
        outputStyle: options.outputStyle,
        threshold: options.confidenceThreshold,
        classNames: tensorflow.classNames,
        modelName: tensorflow.modelName,
        modelRunId: modelRun.id,
        framework: tensorflow.framework,
      });

      return modelRun.id;
    } catch (error) {
      this.cleanup();
      throw error; // rethrow
    } finally {
      this.isPreparingForModelRun = false;
    }
  }

  /**
   * Get all log files from the database.
   */
  async getAllLogRecords(): Promise<LogRecord.T[]> {
    console.log('Fetching all log records');

    const allModelRuns = await this.prisma.modelRun.findMany({
      orderBy: [{ startTime: 'desc' }],
    });

    const logRecords: LogRecord.T[] = allModelRuns.map((modelRun) => {
      return {
        modelRunId: modelRun.id,
        timestamp: new Date(modelRun.startTime * 1000),
        outputPath: modelRun.outputPath,
        modelName: modelRun.modelName,
        status: getModelRunFinalStatus(modelRun.status),
      };
    });

    return logRecords;
  }

  /**
   * Given a modelRunId, fetch the logs for this run. If the log file could
   * not be found then return `null`
   */
  async getLogContents(
    modelRunId: number,
  ): Promise<LogRecord.LogMessage[] | null> {
    const modelRun = await this.prisma.modelRun.findUnique({
      where: { id: modelRunId },
    });

    if (modelRun) {
      try {
        const fileText = await readFile(
          path.join(modelRun.outputPath, LOG_FILE_NAME),
          { encoding: 'utf8' },
        );
        const lines = fileText.split('\n').filter((txt) => !!txt);
        const logObjs = lines.map((txt) => JSON.parse(txt));
        return logObjs;
      } catch (error) {
        console.error(error);
        // if there was an error reading the file then return `null`
        return null;
      }
    }

    return null;
  }

  /**
   * Get all CXL model results from the database.
   */
  getAllCXLModelResults(modelNameFilter?: string): Promise<ModelRun[]> {
    let whereClause;
    if (modelNameFilter != null && modelNameFilter.length) {
      whereClause = {
        modelName: {
          contains: modelNameFilter,
        },
      };
    }

    return this.prisma.modelRun.findMany({
      where: whereClause,
      orderBy: [{ startTime: 'desc' }],
    });
  }

  async getFilesInDir(dirPath: string, recursive?: boolean): Promise<string[]> {
    if (!existsSync(dirPath)) {
      throw new Error(MISSING_DIR_ERROR_MESSAGE);
    }
    const dirents = await readdir(dirPath, { withFileTypes: true });
    const files = await Promise.all(
      dirents.map((dirent) => {
        const res = path.resolve(dirPath, dirent.name);
        return dirent.isDirectory() && recursive
          ? this.getFilesInDir(res, recursive)
          : res;
      }),
    );
    return Array.prototype.concat(...files).filter((f) => isSupported(f));
  }

  async getModelOutputs(modelId: number): Promise<string[]> {
    const model = await this.prisma.modelRun.findUnique({
      where: { id: modelId },
    });
    if (model?.outputStyle === 'flat') {
      return this.getFilesInDir(model.outputPath, false);
    }
    if (model?.outputStyle === 'class' || model?.outputStyle === 'hierarchy') {
      return this.getFilesInDir(model.outputPath, true);
    }
    if (model?.outputStyle === 'none') {
      return [];
    }
    throw new Error(
      `Output style '${model?.outputStyle}' is not implemented yet.`,
    );
  }

  async updateModelRun(
    modelId: number,
    outputDirectory: string,
  ): Promise<ModelRun> {
    console.log(`Updating outputpath for ${modelId} to ${outputDirectory}`);
    return this.prisma.modelRun.update({
      where: { id: modelId },
      data: {
        outputPath: outputDirectory,
      },
    });
  }
}

export const SentinelDesktopService = new SentinelDesktopServiceImpl();
