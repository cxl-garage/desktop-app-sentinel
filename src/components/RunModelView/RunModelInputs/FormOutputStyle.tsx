import { Form } from 'antd';
import React from 'react';
import { useController } from 'react-hook-form';
import { Control } from 'react-hook-form/dist/types';
import { EOutputStyle } from '../../../models/IRunModelOptions';
import { Select } from '../../ui/Select';
import IRunModelInputsFormValues from '../types/IRunModelInputsFormValues';

function FormOutputStyle({
  control,
}: {
  control?: Control<IRunModelInputsFormValues>;
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
            label: 'Class',
            value: EOutputStyle.CLASS,
          },
          {
            label: 'Hierarchy',
            value: EOutputStyle.HIERARCHY,
          },
          {
            label: 'Flat',
            value: EOutputStyle.FLAT,
          },
          {
            label: 'Timelapse',
            value: EOutputStyle.TIMELAPSE,
          },
          {
            label: 'None',
            value: EOutputStyle.NONE,
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
