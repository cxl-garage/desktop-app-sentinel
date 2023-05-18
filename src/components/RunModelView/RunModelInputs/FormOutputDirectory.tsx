import { Form } from 'antd';
import React from 'react';
import { useController } from 'react-hook-form';
import { Control } from 'react-hook-form/dist/types';
import IRunModelInputsFormValues from '../types/IRunModelInputsFormValues';
import DirectoryInput from './formItems/DirectoryInput';

function FormOutputDirectory({
  control,
}: {
  control?: Control<IRunModelInputsFormValues>;
}): JSX.Element {
  const { field, fieldState } = useController({
    control,
    name: 'outputDirectory',
    rules: { required: 'Output Directory is required' },
  });
  return (
    <Form.Item
      label="Save results to"
      required
      validateStatus={fieldState.error && 'error'}
      help={fieldState.error?.message}
    >
      <DirectoryInput value={field.value} onChange={field.onChange} />
    </Form.Item>
  );
}

export default FormOutputDirectory;
