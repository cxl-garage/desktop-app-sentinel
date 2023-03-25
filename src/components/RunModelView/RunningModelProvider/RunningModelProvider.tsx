import _ from 'lodash';
import React, { useReducer } from 'react';
import { AnyAction } from '../types/Action';
import ActionTypes from '../types/ActionTypes';
import ERunningImageStatus from '../types/ERunningImageStatus';
import IRunningModel from '../types/IRunningModel';
import {
  RunningModelContext,
  RunningModelDispatchContext,
} from './RunningModelContext';

type State = IRunningModel | null;

const reducer = (state: State, action: AnyAction): State => {
  // console.log('reducer', action, state);
  switch (action.type) {
    case ActionTypes.MODEL_RUN_REQUESTED: {
      return action.model;
    }
    case ActionTypes.MODEL_RUN_IMAGE_PROCESS_REQUESTED: {
      if (!state) {
        return state;
      }
      const imageIndex = _.findIndex(state.images, { id: action.imageId });
      return {
        images: [
          ...state.images.slice(0, imageIndex),
          {
            ...state.images[imageIndex],
            status: ERunningImageStatus.IN_PROGRESS,
          },
          ...state.images.slice(imageIndex + 1),
        ],
      };
    }
    case ActionTypes.MODEL_RUN_IMAGE_PROCESS_COMPLETED: {
      if (!state) {
        return state;
      }
      const imageIndex = _.findIndex(state.images, { id: action.imageId });
      return {
        images: [
          ...state.images.slice(0, imageIndex),
          {
            ...state.images[imageIndex],
            status: ERunningImageStatus.COMPLETED,
          },
          ...state.images.slice(imageIndex + 1),
        ],
      };
    }
    case ActionTypes.MODEL_RUN_COMPLETED: {
      return state;
    }
    default: {
      return state;
    }
  }
  return state;
};

interface IProps {
  children: React.ReactNode;
}

function RunningModelProvider({ children }: IProps): JSX.Element {
  const [runningModel, dispatch] = useReducer(reducer, null);
  return (
    <RunningModelContext.Provider value={runningModel}>
      <RunningModelDispatchContext.Provider value={dispatch}>
        {children}
      </RunningModelDispatchContext.Provider>
    </RunningModelContext.Provider>
  );
}

export default RunningModelProvider;
