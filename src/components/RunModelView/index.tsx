import * as React from 'react';
import IsDebuggingContextProvider from './DebuggingContext/IsDebuggingContextProvider';
import RunModelInputs from './RunModelInputs/RunModelInputs';
import RunModelResults from './RunModelResultsPanel/RunModelResults';

export function RunModelView(): JSX.Element {
  return (
    <IsDebuggingContextProvider>
      <div className="flex h-full overflow-y-hidden">
        <div className="w-96 overflow-y-auto border-r-2 border-gray-200 p-10 dark:border-gray-600">
          <RunModelInputs />
        </div>
        <div className="flex-1 overflow-y-auto p-10">
          <RunModelResults />
        </div>
      </div>
    </IsDebuggingContextProvider>
  );
}
