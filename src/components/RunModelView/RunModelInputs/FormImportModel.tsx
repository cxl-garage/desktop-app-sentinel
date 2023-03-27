import { DownloadOutlined } from '@ant-design/icons';
import { Form } from 'antd';
import React from 'react';
import { useController } from 'react-hook-form';
import { Control } from 'react-hook-form/dist/types';
import styled from 'styled-components';
import { FileInput } from '../../ui/FileInput';
import IModelInputs from '../types/IModelInputs';

const InputWrapper = styled.div`
  padding: 0 8px;
`;

function FormImportModel({
  control,
}: {
  control?: Control<IModelInputs>;
}): JSX.Element {
  const { field, fieldState } = useController({
    control,
    name: 'model',
    rules: { required: 'Model is required' },
  });
  return (
    <Form.Item
      label="Import model"
      required
      validateStatus={fieldState.error && 'error'}
      help={fieldState.error?.message}
      wrapperCol={{ span: 12 }}
    >
      <FileInput
        type="drag-area"
        onFileSelected={(info) => {
          field.onChange(info.file.name);
          field.onBlur(); // trigger validation
        }}
      >
        <InputWrapper>
          <DownloadOutlined />
          <div>Drag & Drop or browse your device</div>
        </InputWrapper>
      </FileInput>
    </Form.Item>
  );
}

export default FormImportModel;
