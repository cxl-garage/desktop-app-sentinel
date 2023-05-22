import { ModelRun } from '@prisma/client';
import * as RunModelOptions from '../RunModelOptions';

export interface RunnerState {
  notStarted: string[];
  inProgress: string[];
  completed: string[];
}

interface ModelRunProgress {
  startModelOptions: RunModelOptions.T;
  modelRun: ModelRun | null;
  runnerState: RunnerState | null;
}

export { ModelRunProgress as T };
