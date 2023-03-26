import { Form } from 'antd';
import React from 'react';
import { useController } from 'react-hook-form';
import { Control } from 'react-hook-form/dist/types';
import { Select } from '../../ui/Select';
import IModelInputs from '../types/IModelInputs';

function FormOutputStyle({
  control,
}: {
  control?: Control<IModelInputs>;
}): JSX.Element {
  const { field, fieldState } = useController({
    control,
    name: 'outputStyle',
    rules: { required: 'Output Style is required' },
  });
  return (
    <Form.Item
      label="Output Style"
      required
      validateStatus={fieldState.error && 'error'}
      help={fieldState.error?.message}
      wrapperCol={{ span: 15 }}
    >
      <Select
        placeholder="Select an option"
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
        value={field.value}
        onChange={(v) => {
          field.onChange(v?.valueOf() ?? null);
          field.onBlur(); // trigger validation
        }}
      />
    </Form.Item>
  );
}

export default FormOutputStyle;
