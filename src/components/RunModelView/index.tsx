import * as React from 'react';
import styled from 'styled-components';
import RunModelInputs from './RunModelInputs/RunModelInputs';
import RunModelResults from './RunModelResultsPanel/RunModelResults';
import RunningModelProvider from './RunningModelProvider/RunningModelProvider';

const InputsPanel = styled.div`
  border-right: 2px solid #dddddd;
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
        <InputsPanel>
          <RunModelInputs />
        </InputsPanel>
        <OutputsPanel>
          <RunModelResults />
        </OutputsPanel>
      </div>
    </RunningModelProvider>
  );
}
