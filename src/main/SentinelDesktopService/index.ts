/* eslint-disable class-methods-use-this */
import path from 'path';
import fs from 'fs';
import csvParser from 'csv-parser';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import * as LogRecord from 'models/LogRecord';
import * as CXLModelResults from 'models/CXLModelResults';
import type { ISentinelDesktopService } from './ISentinelDesktopService';

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
}

export const SentinelDesktopService = new SentinelDesktopServiceImpl();
