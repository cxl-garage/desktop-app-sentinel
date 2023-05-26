import { LoadingOutlined } from '@ant-design/icons';
import { Form } from 'antd';
import _ from 'lodash';
import React, { useEffect } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import ReactJson from 'react-json-view';
import styled from 'styled-components';
import * as RunModelOptions from '../../../models/RunModelOptions';
import { Button } from '../../ui/Button';
import { useIsDebugging } from '../DebuggingContext/IsDebuggingContext';
import useCurrentModelRunProgress from '../hooks/useCurrentModelRunProgress';
import useIsModelRunInProgress from '../hooks/useIsModelRunInProgress';
import type IRunModelInputsFormValues from '../types/IRunModelInputsFormValues';
import FormConfidenceThreshold from './FormConfidenceThreshold';
import FormImportDataset from './FormImportDataset';
import FormImportModel from './FormImportModel';
import FormOutputDirectory from './FormOutputDirectory';
import FormOutputStyle from './FormOutputStyle';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 40px;
  label.ant-form-item-required {
    font-size: 20px;
    font-weight: 700;
  }
`;

function RunModelInputs(): JSX.Element {
  const { data: isModelRunInProgress } = useIsModelRunInProgress();
  const { data: currentModelRunProgress } = useCurrentModelRunProgress();

  const {
    handleSubmit,
    watch,
    control,
    formState: { errors, touchedFields },
    setValue,
  } = useForm<IRunModelInputsFormValues>({ mode: 'onBlur' });

  const currentModelRun = currentModelRunProgress?.modelRun;

  useEffect(() => {
    // If there was a model run, fill the form with the input values of the existing model run
    if (currentModelRun) {
      setValue('modelName', currentModelRun.modelName);
      setValue(
        'outputStyle',
        currentModelRun.outputStyle as RunModelOptions.EOutputStyle,
      );
      setValue(
        'confidenceThreshold',
        Math.floor(currentModelRun.confidenceThreshold * 100),
      );
      setValue('inputDirectory', currentModelRun.inputPath);
      setValue('outputDirectory', currentModelRun.outputPath);
    }
  }, [currentModelRun, setValue]);

  const onSubmit: SubmitHandler<IRunModelInputsFormValues> = (values) => {
    return window.SentinelDesktopService.startModel({
      modelName: values.modelName,
      outputStyle: values.outputStyle,
      confidenceThreshold: values.confidenceThreshold / 100.0,
      outputDirectory: values.outputDirectory,
      inputDirectory: values.inputDirectory,
    });
  };

  const isDebugging = useIsDebugging();

  return (
    <Form
      layout="vertical"
      onFinish={handleSubmit(onSubmit)}
      requiredMark={false}
    >
      <Wrapper>
        <FormImportModel control={control} />
        <FormImportDataset control={control} />
        <FormOutputStyle control={control} />
        <FormConfidenceThreshold control={control} />
        <FormOutputDirectory control={control} />
        <div>
          <Button
            type="primary"
            htmlType="submit"
            disabled={isModelRunInProgress}
            icon={isModelRunInProgress ? <LoadingOutlined /> : undefined}
          >
            {isModelRunInProgress ? 'RUNNING' : 'RUN MODEL'}
          </Button>
        </div>
      </Wrapper>
      {isDebugging && (
        <div>
          <hr className="my-4" />
          <div className="my-4">
            <Button
              onClick={() => {
                setValue('modelName', 'osa_jaguar');
                setValue('outputStyle', RunModelOptions.EOutputStyle.FLAT);
                setValue('confidenceThreshold', 20);
                setValue(
                  'inputDirectory',
                  '/Users/alee/dev/github/cxl-garage/data-subset',
                );
                setValue(
                  'outputDirectory',
                  '/Users/alee/dev/github/cxl-garage/output',
                );
              }}
            >
              Prefill Value
            </Button>
          </div>
          <ReactJson name="watch()" src={watch()} />
          <ReactJson
            name="errors"
            src={_.reduce(
              errors,
              (previous, value, key) => {
                previous[key] = _.omit(value, 'ref');
                return previous;
              },
              {} as Record<string, unknown>,
            )}
          />
          <ReactJson name="touchedFields" src={touchedFields} />
        </div>
      )}
    </Form>
  );
}

export default RunModelInputs;
