/**
 * This model type represents a single log entry during a CXL Model execution.
 */
type LogRecord = {
  modelRunId: number;
  timestamp: Date;
  outputPath: string;
  modelName: string;
  status: 'SUCCESS' | 'FINISHED_WITH_ERRORS' | 'IN_PROGRESS' | 'UNKNOWN';
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
