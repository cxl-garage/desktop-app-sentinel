import { createContext, useContext } from 'react';
import { ModelRun } from '../../../generated/prisma/client';

interface IModelRunContext {
  modelRun: ModelRun;
  setModelRun: React.Dispatch<React.SetStateAction<ModelRun>>; // (modelRun: ModelRun) => null;
}

export const ModelRunContext = createContext<IModelRunContext>({
  modelRun: {} as ModelRun,
  setModelRun: (_modelRun) => null,
});

export const useModelRun = (): IModelRunContext => {
  return useContext(ModelRunContext);
};
