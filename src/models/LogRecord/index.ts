export type LogResultType = 'SUCCESS' | 'WARNING' | 'ERROR';

/**
 * This model type represents a single log entry during a CXL Model execution.
 */
type LogRecord = {
  modelRunId: number;
  logResult: LogResultType;
  timestamp: Date;
  outputPath: string;
  modelName: string;
};

export const QueryKeys = {
  allLogRecords: ['allLogRecords'],
  getLogContents: (modelRunId: number) => ['logs', modelRunId],
};

export type LogMessage = {
  [key: string]: string;
  level: string;
  message: string;
  timestamp: string;
};

export { LogRecord as T };
