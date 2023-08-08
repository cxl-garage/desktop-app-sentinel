import { LoadingOutlined } from '@ant-design/icons';
import { Alert, Form } from 'antd';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
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
  } = useForm<IRunModelInputsFormValues>({
    mode: 'onBlur',
    defaultValues: {
      confidenceThreshold: 40,
    },
  });

  const currentModelRun = currentModelRunProgress?.modelRun;

  useEffect(() => {
    // If there was a model run, fill the form with the input values of the existing model run
    if (currentModelRun) {
      setValue('modelDirectory', currentModelRun.modelPath);
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

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const onSubmit: SubmitHandler<IRunModelInputsFormValues> = async (values) => {
    setSubmissionError(null);
    setIsSubmitting(true);
    try {
      await window.SentinelDesktopService.startModel({
        modelDirectory: values.modelDirectory,
        outputStyle: values.outputStyle,
        confidenceThreshold: values.confidenceThreshold / 100.0,
        outputDirectory: values.outputDirectory,
        inputDirectory: values.inputDirectory,
      });
    } catch (error) {
      setSubmissionError(
        error instanceof Error ? error.message : String(error),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDebugging = useIsDebugging();
  const isRunning = isSubmitting || isModelRunInProgress;

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
        {submissionError && (
          <Alert
            type="error"
            message="Failed to start model"
            description={submissionError}
            closable
          />
        )}
        <div>
          <Button
            type="primary"
            htmlType="submit"
            disabled={isRunning}
            icon={isRunning ? <LoadingOutlined /> : undefined}
          >
            {isRunning ? 'RUNNING' : 'RUN MODEL'}
          </Button>
        </div>
      </Wrapper>
      {isDebugging && (
        <div>
          <hr className="my-4" />
          <div className="my-4">
            <Button
              onClick={() => {
                setValue('modelDirectory', './model');
                setValue('outputStyle', RunModelOptions.EOutputStyle.FLAT);
                setValue('confidenceThreshold', 40);
                setValue('inputDirectory', './data');
                setValue('outputDirectory', './results');
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
