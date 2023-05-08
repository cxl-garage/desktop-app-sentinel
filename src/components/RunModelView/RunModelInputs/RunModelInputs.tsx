import { Form } from 'antd';
import _ from 'lodash';
import React from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import ReactJson from 'react-json-view';
import styled from 'styled-components';
import { Button } from '../../ui/Button';
import {
  useIsRunningModelInProgress,
  useStartModelRun,
} from '../RunningModelProvider/RunningModelContext';
import type IModelInputs from '../types/IModelInputs';
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
  const startModelRun = useStartModelRun();
  const isRunningModelInProgress = useIsRunningModelInProgress();
  const {
    handleSubmit,
    watch,
    control,
    formState: { errors, touchedFields },
  } = useForm<IModelInputs>({ mode: 'onBlur' });
  const onSubmit: SubmitHandler<IModelInputs> = (modelInputs) => {
    startModelRun(modelInputs);
  };
  const isDebugging = false;
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
            disabled={isRunningModelInProgress}
          >
            RUN MODEL
          </Button>
        </div>
      </Wrapper>
      {isDebugging && (
        <div>
          <hr />
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
