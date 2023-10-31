import { Form } from 'antd';
import _ from 'lodash';
import { useState } from 'react';
import { useController } from 'react-hook-form';
import { Control } from 'react-hook-form/dist/types';
import IRunModelInputsFormValues from '../types/IRunModelInputsFormValues';
import DirectoryInput from './formItems/DirectoryInput';

interface IProps {
  control?: Control<IRunModelInputsFormValues>;
}

function FormImportModel({ control }: IProps): JSX.Element {
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const { field, fieldState } = useController({
    control,
    name: 'modelDirectory',
    rules: {
      validate: async (value: string) => {
        setIsValidating(true);
        try {
          if (_.isEmpty(value)) {
            return 'A model is required';
          }
          const isModelFolderValid =
            await window.SentinelDesktopService.getIsModelDirectoryValid(value);
          if (!isModelFolderValid) {
            return `A model was not found in the folder. Please select a folder that contains a 'config.json' file.`;
          }
          return undefined;
        } catch (error) {
          return 'Failed to validate the model folder.';
        } finally {
          setIsValidating(false);
        }
      },
    },
  });

  return (
    <Form.Item
      label="Select Model"
      required
      validateStatus={(() => {
        if (isValidating) {
          return 'validating';
        }
        if (fieldState.error) {
          return 'error';
        }
        return undefined;
      })()}
      help={
        isValidating ? 'Validating model folder...' : fieldState.error?.message
      }
    >
      <DirectoryInput
        value={field.value}
        onChange={(newValue) => {
          field.onChange(newValue);
          field.onBlur();
        }}
      />
    </Form.Item>
  );
}

export default FormImportModel;
