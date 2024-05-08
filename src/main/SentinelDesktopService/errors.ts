export interface SystemError extends Error {
  cause: {
    errno: number;
    code: string;
    syscall: string;
    address: string;
    port: number;
  };
}

export const MISSING_DIR_ERROR_MESSAGE = 'Directory not found.';

export function isSystemError(error: Error): error is SystemError {
  return (
    'cause' in error &&
    typeof error.cause === 'object' &&
    !!error.cause &&
    'code' in error.cause &&
    typeof error.cause.code === 'string'
  );
}
