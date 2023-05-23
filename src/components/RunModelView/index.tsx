import * as React from 'react';
import styled from 'styled-components';
import IsDebuggingContextProvider from './DebuggingContext/IsDebuggingContextProvider';
import RunModelInputs from './RunModelInputs/RunModelInputs';
import RunModelResults from './RunModelResultsPanel/RunModelResults';

const InputsPanel = styled.div`
  padding: 40px;
`;
const OutputsPanel = styled.div`
  flex: 1;
  padding: 40px;
`;

export function RunModelView(): JSX.Element {
  return (
    <IsDebuggingContextProvider>
      <div className="flex">
        <InputsPanel className="border-r-2 border-gray-200 dark:border-gray-600">
          <RunModelInputs />
        </InputsPanel>
        <OutputsPanel>
          <RunModelResults />
        </OutputsPanel>
      </div>
    </IsDebuggingContextProvider>
  );
}
