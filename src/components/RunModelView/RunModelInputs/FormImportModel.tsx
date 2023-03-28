import { DownloadOutlined } from '@ant-design/icons';
import { Form } from 'antd';
import React from 'react';
import { useController } from 'react-hook-form';
import { Control } from 'react-hook-form/dist/types';
import { FileInput } from '../../ui/FileInput';
import IModelInputs from '../types/IModelInputs';

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
        <div className="mx-2">
          <DownloadOutlined />
          <div>Drag & Drop or browse your device</div>
        </div>
      </FileInput>
    </Form.Item>
  );
}

export default FormImportModel;
