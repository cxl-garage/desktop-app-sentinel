import _ from 'lodash';
import React from 'react';
import { useImmerReducer } from 'use-immer';
import { AnyAction } from '../types/Action';
import ActionTypes from '../types/ActionTypes';
import ERunningImageStatus from '../types/ERunningImageStatus';
import IRunningModel from '../types/IRunningModel';
import {
  RunningModelContext,
  RunningModelDispatchContext,
} from './RunningModelContext';

type State = { runningModel: IRunningModel | null };

function reducer(draft: State, action: AnyAction): void {
  switch (action.type) {
    case ActionTypes.MODEL_RUN_REQUESTED: {
      draft.runningModel = action.model;
      break;
    }
    case ActionTypes.MODEL_RUN_IMAGE_PROCESS_REQUESTED: {
      if (draft.runningModel) {
        const { images } = draft.runningModel;
        const imageIndex = _.findIndex(images, { id: action.imageId });
        images[imageIndex].status = ERunningImageStatus.IN_PROGRESS;
      }
      break;
    }
    case ActionTypes.MODEL_RUN_IMAGE_PROCESS_COMPLETED: {
      if (draft.runningModel) {
        const { images } = draft.runningModel;
        const imageIndex = _.findIndex(images, { id: action.imageId });
        images[imageIndex].status = ERunningImageStatus.COMPLETED;
      }
      break;
    }
    default: {
      break;
    }
  }
}

interface IProps {
  children: React.ReactNode;
}

function RunningModelProvider({ children }: IProps): JSX.Element {
  const [state, dispatch] = useImmerReducer<State, AnyAction>(reducer, {
    runningModel: null,
  });
  return (
    <RunningModelContext.Provider value={state.runningModel}>
      <RunningModelDispatchContext.Provider value={dispatch}>
        {children}
      </RunningModelDispatchContext.Provider>
    </RunningModelContext.Provider>
  );
}

export default RunningModelProvider;
