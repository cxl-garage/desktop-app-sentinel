import { Form } from 'antd';
import React from 'react';
import { useController } from 'react-hook-form';
import { Control } from 'react-hook-form/dist/types';
import IRunModelInputsFormValues from '../types/IRunModelInputsFormValues';
import DirectoryInput from './formItems/DirectoryInput';

interface IProps {
  control?: Control<IRunModelInputsFormValues>;
}

function FormImportDataset({ control }: IProps): JSX.Element {
  const { field, fieldState } = useController({
    control,
    name: 'inputDirectory',
    rules: { required: 'Dataset is required' },
  });
  return (
    <Form.Item
      label="Import dataset"
      required
      validateStatus={fieldState.error && 'error'}
      help={fieldState.error?.message}
    >
      <DirectoryInput value={field.value} onChange={field.onChange} />
    </Form.Item>
  );
}

export default FormImportDataset;
