import { ModelRun } from '../../generated/prisma/client';
import * as RunModelOptions from '../RunModelOptions';

export type InternalModelRunStatus =
  | 'STARTING_TENSORFLOW' // first start of tensorflow
  | 'RESTARTING_MODEL' // when we restart the entire model with fewer threads
  | 'IN_PROGRESS'
  | 'COMPLETED';

export interface RunnerState {
  internalModelRunStatus: InternalModelRunStatus;
  notStarted: string[];
  ignoredImages: string[];
  inProgress: string[];
  completed: Array<{ inputPath: string; outputPath: string }>;
}

interface ModelRunProgress {
  startModelOptions: RunModelOptions.T;
  modelRun: ModelRun | null;
  runnerState: RunnerState | null;
}

export { ModelRunProgress as T };
