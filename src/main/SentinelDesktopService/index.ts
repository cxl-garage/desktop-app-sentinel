/* eslint-disable class-methods-use-this */
import path from 'path';
import fs from 'fs';
import csvParser from 'csv-parser';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import * as LogRecord from 'models/LogRecord';
import * as CXLModelResults from 'models/CXLModelResults';
import { DockerVersion } from 'models/DockerVersion';
import type { ImageInfo, ContainerInfo } from 'dockerode';
import { PrismaClient } from '@prisma/client';
import { app } from 'electron';
import IRunModelOptions from '../../models/IRunModelOptions';
import { ModelRunner } from './runner';
import type { ISentinelDesktopService } from './ISentinelDesktopService';
import { cleanup, getContainers, getImages, getVersion, start } from './docker';

// Declare the expected CSV schema
const LogRecordCSVSchema = z.object({
  timestamp: z.coerce.date(),
  message: z.string(),
});

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

  constructor() {
    this.runner = new ModelRunner();
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
  }

  async getVersion(): Promise<DockerVersion> {
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
    return cleanup();
  }

  async fetchRuns(): Promise<void> {
    const modelRuns = await this.prisma.modelRun.findMany();
    console.log('PREVIOUS RUNS: ');
    console.log(modelRuns);
  }

  async registerRun(modelName: string): Promise<void> {
    const modelRun = await this.prisma.modelRun.create({
      data: {
        modelName,
        outputPath: 'placeholder_path/output',
        startTime: Math.round(Date.now() / 1000),
      },
    });
    console.log('NEW RUN: ');
    console.log(modelRun);
  }

  async getModelNames(): Promise<string[]> {
    const modelNames = getModelNames();
    return modelNames;
  }

  async startModel(options: IRunModelOptions): Promise<boolean> {
    await cleanup();
    await start(options.modelName);

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
    });
    return Promise.resolve(true);
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
  getAllCXLModelResults(): Promise<CXLModelResults.T[]> {
    return new Promise((resolve, reject) => {
      fs.readFile(
        path.join(__dirname, '../../py/Results.json'),
        'utf-8',
        (_error: unknown, jsonString: unknown) => {
          const dataArray =
            typeof jsonString === 'string' ? JSON.parse(jsonString) : undefined;

          if (Array.isArray(dataArray)) {
            const cxlModelResults = dataArray.map((dataObj: unknown) =>
              CXLModelResultJSONSchema.parse(dataObj),
            );
            resolve(cxlModelResults);
          } else {
            reject(
              new Error(
                'JSON data of model results was expected to be an array',
              ),
            );
          }
        },
      );
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
