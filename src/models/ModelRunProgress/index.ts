import { ModelRun } from '../../generated/prisma/client';
import * as RunModelOptions from '../RunModelOptions';

export interface RunnerState {
  notStarted: string[];
  inProgress: string[];
  completed: Array<{ inputPath: string; outputPath: string }>;
}

interface ModelRunProgress {
  startModelOptions: RunModelOptions.T;
  modelRun: ModelRun | null;
  runnerState: RunnerState | null;
}

export { ModelRunProgress as T };
