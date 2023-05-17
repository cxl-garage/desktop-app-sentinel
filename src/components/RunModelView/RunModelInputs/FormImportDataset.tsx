import { Form } from 'antd';
import React from 'react';
import { useController } from 'react-hook-form';
import { Control } from 'react-hook-form/dist/types';
import IRunModelInputsFormValues from '../types/IRunModelInputsFormValues';
import DirectoryInput from './formItems/DirectoryInput';

function FormImportDataset({
  control,
}: {
  control?: Control<IRunModelInputsFormValues>;
}): JSX.Element {
  const { field, fieldState } = useController({
    control,
    name: 'dataset',
    rules: { required: 'Dataset is required' },
  });
  return (
    <Form.Item
      label="Import dataset"
      required
      validateStatus={fieldState.error && 'error'}
      help={fieldState.error?.message}
      wrapperCol={{ span: 12 }}
    >
      <DirectoryInput value={field.value} onChange={field.onChange} />
    </Form.Item>
  );
}

export default FormImportDataset;
