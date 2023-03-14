import { InputNumber, Slider } from 'antd';
import React from 'react';
import styled from 'styled-components';
import { Button } from '../../ui/Button';
import { FileInfo, FileInput } from '../../ui/FileInput';
import { Heading } from '../../ui/Heading';
import { Select } from '../../ui/Select';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 40px;
`;

function RunModelInputs(): JSX.Element {
  const onFileOrFolderSelected = (fileInfo: FileInfo): void => {
    console.log(fileInfo);
  };
  return (
    <Wrapper>
      <Heading.H1>Import model</Heading.H1>
      <FileInput type="drag-area" onFileSelected={onFileOrFolderSelected}>
        Drop a file here
      </FileInput>
      <Heading.H1>Import dataset</Heading.H1>
      <FileInput type="drag-area" onFileSelected={onFileOrFolderSelected}>
        Drop a file here
      </FileInput>

      <Select
        options={[
          {
            label: 'Option 1',
            value: 'opt1',
          },
          {
            label: 'Option 2',
            value: 'opt2',
          },
        ]}
        defaultValue="opt1"
        onChange={(value: string) => console.log(value)}
      />
      <div>
        <Heading.H1>Confidence Threshold</Heading.H1>
        <div>
          <Slider
            min={1}
            max={20}
            onChange={(value) => {
              console.log(value);
            }}
          />
          <InputNumber min={1} max={20} style={{ margin: '0 16px' }} />
        </div>
      </div>
      <div>
        <Heading.H1>Save results to</Heading.H1>
        <FileInput directory onFileSelected={onFileOrFolderSelected}>
          Pick a directory
        </FileInput>
      </div>
      <Button type="primary" onClick={() => alert('clicked!')}>
        RUN MODEL
      </Button>
    </Wrapper>
  );
}

export default RunModelInputs;
