import _ from 'lodash';
import { createContext, Dispatch, useContext } from 'react';
import * as R from 'remeda';
import { PUBLIC_DOMAIN_PLACEHOLDER_IMAGE } from '../tempMockData';
import { AnyAction } from '../types/Action';
import ActionTypes from '../types/ActionTypes';
import ERunningImageStatus from '../types/ERunningImageStatus';
import IModelInputs from '../types/IModelInputs';
import IRunningModel from '../types/IRunningModel';
import { delay } from '../utils/commonUtils';

const IMAGES_SIZE = 10;
const BATCH_SIZE = 3;
const MAX_DELAY = 3000; // ms

export const RunningModelContext = createContext<IRunningModel | null>(null);
export const RunningModelDispatchContext = createContext<Dispatch<AnyAction>>(
  R.noop,
);

export const useRunningModel = (): IRunningModel | null => {
  return useContext(RunningModelContext);
};

export const useIsRunningModelInProgress = (): boolean => {
  const runningModel = useRunningModel();
  return _.some(runningModel?.images, {
    status: ERunningImageStatus.IN_PROGRESS,
  });
};

export const useRunningModelDispatch = (): Dispatch<AnyAction> => {
  return useContext(RunningModelDispatchContext);
};

const createModel = (): IRunningModel => {
  return {
    images: [...Array(IMAGES_SIZE)].map(() => {
      return {
        id: _.uniqueId(),
        url: PUBLIC_DOMAIN_PLACEHOLDER_IMAGE,
        status: ERunningImageStatus.NOT_STARTED,
      };
    }),
  };
};

export const useStartModelRun = (): ((
  params: IModelInputs,
) => Promise<void>) => {
  const dispatch = useRunningModelDispatch();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const startModelRun = async (modelInputs: IModelInputs): Promise<void> => {
    const newModel = createModel();
    dispatch({ type: ActionTypes.MODEL_RUN_REQUESTED, model: newModel });
    const batches = R.chunk(newModel?.images ?? [], BATCH_SIZE);
    // eslint-disable-next-line no-restricted-syntax
    for (const batch of batches) {
      // eslint-disable-next-line no-await-in-loop
      await Promise.all(
        batch.map(async (image) => {
          dispatch({
            type: ActionTypes.MODEL_RUN_IMAGE_PROCESS_REQUESTED,
            imageId: image.id,
          });
          await delay(Math.random() * MAX_DELAY);
          dispatch({
            type: ActionTypes.MODEL_RUN_IMAGE_PROCESS_COMPLETED,
            imageId: image.id,
          });
        }),
      );
    }
    dispatch({ type: ActionTypes.MODEL_RUN_COMPLETED });
  };
  return startModelRun;
};
