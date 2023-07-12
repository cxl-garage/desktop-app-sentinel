export type LogResultType = 'SUCCESS' | 'WARNING' | 'ERROR';

/**
 * This model type represents a single log entry during a CXL Model execution.
 */
type LogRecord = {
  id: number;
  logResult: LogResultType;
  timestamp: Date;
  outputPath: string;
  modelName: string;
};

export const QueryKeys = {
  allLogRecords: ['allLogRecords'],
};

export { LogRecord as T };
