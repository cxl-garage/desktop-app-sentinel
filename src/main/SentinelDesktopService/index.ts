/* eslint-disable class-methods-use-this */
import path from 'path';
import fs from 'fs';
import csvParser from 'csv-parser';
import * as LogRecord from 'models/LogRecord';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import type { ISentinelDesktopService } from './ISentinelDesktopService';

// Declare the expected CSV schema
const CSVLogRecordSchema = z.object({
  timestamp: z.coerce.date(),
  message: z.string(),
});

class SentinelDesktopServiceImpl implements ISentinelDesktopService {
  /**
   * Read log file and convert each log to a LogRecord model.
   *
   * TODO: this is unlikely how we actually want to read and treat logs.
   * This is just a placeholder function. It will likely change a lot.
   */
  getLogRecords(): Promise<LogRecord.T[]> {
    return new Promise((resolve) => {
      const results: LogRecord.T[] = [];

      fs.createReadStream(path.join(__dirname, '../../py/logfile.csv'))
        .pipe(csvParser())
        .on('data', (data: unknown) => {
          const logRecord = CSVLogRecordSchema.parse(data);
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
}

export const SentinelDesktopService = new SentinelDesktopServiceImpl();
