import * as React from 'react';
import styled from 'styled-components';
import RunModelInputs from './RunModelInputs/RunModelInputs';
import RunModelResults from './RunModelResultsPanel/RunModelResults';
import RunningModelProvider from './RunningModelProvider/RunningModelProvider';

const InputsPanel = styled.div`
  padding: 40px;
`;
const OutputsPanel = styled.div`
  flex: 1;
  padding: 40px;
`;

export function RunModelView(): JSX.Element {
  return (
    <RunningModelProvider>
      <div className="flex">
        <InputsPanel className="border-r-2 border-gray-200 dark:border-gray-600">
          <RunModelInputs />
        </InputsPanel>
        <OutputsPanel>
          <RunModelResults />
        </OutputsPanel>
      </div>
    </RunningModelProvider>
  );
}
