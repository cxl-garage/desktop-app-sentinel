/**
 * This model type represents a single log entry during a CXL Model execution.
 */
type LogRecord = {
  id: string;
  level: string;
  message: string;
  timestamp: Date;
};

export { LogRecord as T };
