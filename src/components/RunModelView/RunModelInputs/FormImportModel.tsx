import { Form, Select } from 'antd';
import { useController } from 'react-hook-form';
import { Control } from 'react-hook-form/dist/types';
import useModelNames from '../hooks/useModelNames';
import IRunModelInputsFormValues from '../types/IRunModelInputsFormValues';

interface IProps {
  control?: Control<IRunModelInputsFormValues>;
}

function FormImportModel({ control }: IProps): JSX.Element {
  const { field, fieldState } = useController({
    control,
    name: 'modelName',
    rules: { required: 'Model is required' },
  });
  const { data: modelNames } = useModelNames();

  /* eslint-disable react/jsx-props-no-spreading */
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
