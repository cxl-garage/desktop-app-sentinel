/* eslint-disable no-console */
/* eslint-disable class-methods-use-this */
import path from 'path';
import * as LogRecord from 'models/LogRecord';
import * as DockerVersion from 'models/DockerVersion';
import type { ImageInfo, ContainerInfo } from 'dockerode';
import { app } from 'electron';
import { readdir, readFile } from 'fs/promises';
import { ModelRun, PrismaClient } from '../../generated/prisma/client';
import * as RunModelOptions from '../../models/RunModelOptions';
import * as ModelRunProgress from '../../models/ModelRunProgress';
import { ModelRunner, LOG_FILE_NAME } from './runner';
import type { ISentinelDesktopService } from './ISentinelDesktopService';
import {
  cleanup,
  getModelNames,
  getContainers,
  getImages,
  getVersion,
  start,
} from './docker';
import { isSupported } from './image';

class SentinelDesktopServiceImpl implements ISentinelDesktopService {
  runner: ModelRunner;

  prisma: PrismaClient;

  private registeredModelRunOptions: RunModelOptions.T | null = null;

  private registeredModelRun: ModelRun | null = null;

  private isPreparingForModelRun: boolean = false;

  constructor() {
    this.prisma = new PrismaClient(
      app.isPackaged
        ? {
            datasources: {
              db: {
                url: `file:${path.join(
                  process.resourcesPath,
                  'prisma/dev.db',
                )}`,
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

  getImages(): Promise<ImageInfo[]> {
    return getImages();
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

  registerRun(options: RunModelOptions.T): Promise<ModelRun> {
    const data = {
      modelName: options.modelName,
      inputPath: options.inputDirectory,
      outputPath: options.outputDirectory,
      startTime: Math.round(Date.now() / 1000),
      outputStyle: options.outputStyle,
      confidenceThreshold: options.confidenceThreshold,
    };
    return this.prisma.modelRun.create({ data });
  }

  async getModelNames(): Promise<string[]> {
    const modelNames = getModelNames();
    return modelNames;
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
      await start(options.modelName);
      const modelRun = await this.registerRun(options);
      this.registeredModelRun = modelRun;

      // TODO: It takes some time for the image to start, so wait
      await new Promise((resolve) => {
        setTimeout(resolve, 10 * 1000);
      });

      await this.runner.start({
        inputFolder: options.inputDirectory,
        outputFolder: options.outputDirectory,
        outputStyle: options.outputStyle,
        threshold: options.confidenceThreshold,
        modelName: options.modelName,
        modelRunId: modelRun.id,
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

    const logRecords: LogRecord.T[] = allModelRuns.map((modelRun) => ({
      modelRunId: modelRun.id,
      timestamp: new Date(modelRun.startTime * 1000),
      outputPath: modelRun.outputPath,
      modelName: modelRun.modelName,
    }));
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
          `${modelRun.outputPath}/${LOG_FILE_NAME}`,
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
}

export const SentinelDesktopService = new SentinelDesktopServiceImpl();
