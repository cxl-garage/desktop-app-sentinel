import { Form } from 'antd';
import React from 'react';
import { useController } from 'react-hook-form';
import { Control } from 'react-hook-form/dist/types';
import IRunModelInputsFormValues from '../types/IRunModelInputsFormValues';
import PercentageSlider from './PercentageSlider';

function FormConfidenceThreshold({
  control,
}: {
  control?: Control<IRunModelInputsFormValues>;
}): JSX.Element {
  const { field, fieldState } = useController({
    control,
    name: 'confidenceThreshold',
    rules: { required: 'Confidence Threshold is required' },
  });
  return (
    <Form.Item
      label="Confidence threshold"
      required
      validateStatus={fieldState.error && 'error'}
      help={fieldState.error?.message}
    >
      <PercentageSlider
        value={field.value}
        onChange={(v) => {
          field.onChange(v?.valueOf() ?? null);
          field.onBlur(); // trigger validation
        }}
      />
    </Form.Item>
  );
}

export default FormConfidenceThreshold;
