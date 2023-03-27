import { Form } from 'antd';
import React from 'react';
import { useController } from 'react-hook-form';
import { Control } from 'react-hook-form/dist/types';
import { FileInput } from '../../ui/FileInput';
import IModelInputs from '../types/IModelInputs';

function FormOutputDirectory({
  control,
}: {
  control?: Control<IModelInputs>;
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
      <FileInput
        directory
        type="button"
        onFileSelected={(info) => {
          field.onChange(info.file.name);
          field.onBlur(); // trigger validation
        }}
      >
        Choose a directory
      </FileInput>
    </Form.Item>
  );
}

export default FormOutputDirectory;
