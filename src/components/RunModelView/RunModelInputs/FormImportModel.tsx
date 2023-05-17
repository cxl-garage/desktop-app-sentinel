import { Form, Select } from 'antd';
import React from 'react';
import { useController } from 'react-hook-form';
import { Control } from 'react-hook-form/dist/types';
import useModelNames from '../hooks/useModelNames';
import IRunModelInputsFormValues from '../types/IRunModelInputsFormValues';

/* eslint-disable react/jsx-props-no-spreading */
function FormImportModel({
  control,
}: {
  control?: Control<IRunModelInputsFormValues>;
}): JSX.Element {
  const { field, fieldState } = useController({
    control,
    name: 'modelName',
    rules: { required: 'Model is required' },
  });
  const { data: modelNames } = useModelNames();
  return (
    <Form.Item
      label="Import model"
      required
      validateStatus={fieldState.error && 'error'}
      help={fieldState.error?.message}
      wrapperCol={{ span: 24 }}
    >
      <Select
        options={modelNames?.map((name) => ({ label: name, value: name }))}
        {...field}
      />
    </Form.Item>
  );
}

export default FormImportModel;
