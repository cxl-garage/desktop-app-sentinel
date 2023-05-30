/* eslint-disable class-methods-use-this */
import path from 'path';
import fs from 'fs';
import csvParser from 'csv-parser';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import * as LogRecord from 'models/LogRecord';
import * as DockerVersion from 'models/DockerVersion';
import type { ImageInfo, ContainerInfo } from 'dockerode';
import { app } from 'electron';
import { ModelRun, PrismaClient } from '../../generated/prisma/client';
import * as RunModelOptions from '../../models/RunModelOptions';
import * as ModelRunProgress from '../../models/ModelRunProgress';
import { ModelRunner } from './runner';
import type { ISentinelDesktopService } from './ISentinelDesktopService';
import {
  cleanup,
  getModelNames,
  getContainers,
  getImages,
  getVersion,
  start,
} from './docker';

// Declare the expected CSV schema
const LogRecordCSVSchema = z.object({
  timestamp: z.coerce.date(),
  message: z.string(),
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CXLModelResultJSONSchema = z.object({
  emptyimagecount: z.coerce.number(),
  imagecount: z.coerce.number(),
  imagedir: z.string(),
  modelname: z.string(),
  objectcount: z.coerce.number(),
  resultsdir: z.string(),
  rundate: z.coerce.date(),
  runid: z.string(),
});

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
        setTimeout(resolve, 5000);
      });

      this.runner.start({
        inputFolder: options.inputDirectory,
        outputFolder: options.outputDirectory,
        outputStyle: options.outputStyle,
        threshold: options.confidenceThreshold,
        modelName: options.modelName,
        modelRunId: modelRun.id,
      });

      return modelRun.id;
    } catch (error) {
      console.error(`Failed to start model`);
      throw error; // rethrow
    } finally {
      this.isPreparingForModelRun = false;
    }
  }

  /**
   * Read log file and convert each log to a LogRecord model.
   *
   * TODO: this is unlikely how we actually want to read and treat logs.
   * This is just a placeholder function. It will likely change a lot.
   */
  getAllLogRecords(): Promise<LogRecord.T[]> {
    return new Promise((resolve) => {
      const results: LogRecord.T[] = [];

      fs.createReadStream(path.join(__dirname, '../../py/logfile.csv'))
        .pipe(csvParser())
        .on('data', (data: unknown) => {
          const logRecord = LogRecordCSVSchema.parse(data);
          results.push({
            id: uuid(),
            level: 'INFO', // placeholder for now
            ...logRecord,
          });
        })
        .on('end', () => {
          resolve(results);
        });
    });
  }

  /**
   * Read Results.json, which has been populated by RunCli2.py.
   * This has the number of objects detected, number of total images, and
   * number of empty images.
   *
   * TODO: this is likely to change as we build out this functionality more.
   */
  getAllCXLModelResults(): Promise<ModelRun[]> {
    return this.prisma.modelRun.findMany({
      orderBy: [{ startTime: 'desc' }],
    });
  }

  getFilesInDir(dirPath: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      fs.readdir(dirPath, (err: unknown, files: string[]) => {
        if (err) {
          reject(new Error(`Unable to read directory: ${dirPath}`));
        } else {
          // Return full paths
          resolve(files.map((file) => path.join(dirPath, file)));
        }
      });
    });
  }
}

export const SentinelDesktopService = new SentinelDesktopServiceImpl();
