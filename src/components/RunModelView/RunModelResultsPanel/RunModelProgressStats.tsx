import { Spin, Typography } from 'antd';
import _ from 'lodash';
import React, { useMemo } from 'react';
import ERunningImageStatus from '../types/ERunningImageStatus';
import IRunningImage from '../types/IRunningImage';
import * as ModelRunProgress from '../../../models/ModelRunProgress';

interface IProps {
  internalRunnerStatus: ModelRunProgress.InternalModelRunStatus | undefined;
  modelRun: ModelRunProgress.T['modelRun'] | null;
  processingImages: IRunningImage[];
}

function isModelRunCompleted(
  modelRun: ModelRunProgress.T['modelRun'],
): boolean {
  const stillRunning = modelRun === null || modelRun.status === 'IN_PROGRESS';
  return !stillRunning;
}

function RunModelProgressStats({
  modelRun,
  processingImages,
  internalRunnerStatus,
}: IProps): JSX.Element {
  const completedImages = useMemo(
    () =>
      _.filter(processingImages, {
        status: ERunningImageStatus.COMPLETED,
      }).map((it) => it.url),
    [processingImages],
  );

  const totalCount = processingImages.length;
  const completedCount = completedImages.length;
  const completedPercentage = Math.round((completedCount * 100) / totalCount);

  if (
    internalRunnerStatus === undefined ||
    internalRunnerStatus === 'STARTING_TENSORFLOW'
  ) {
    return (
      <div>
        <Spin spinning style={{ marginRight: 12 }} />
        <Typography.Text>Waiting for TensorFlow to start</Typography.Text>
      </div>
    );
  }

  if (internalRunnerStatus === 'RESTARTING_MODEL') {
    return (
      <div className="space-x-4">
        <div>
          <Spin spinning style={{ marginRight: 12 }} />
          <Typography.Text>Restarting model</Typography.Text>
        </div>
        <Typography.Text>
          (TensorFlow ran out of memory so we&apos;re trying again)
        </Typography.Text>
      </div>
    );
  }

  if (totalCount === 0 && completedCount === 0) {
    return (
      <div>
        <Typography.Text>There are no results to show</Typography.Text>
      </div>
    );
  }

  return (
    <div>
      {!isModelRunCompleted(modelRun) ? (
        <Spin style={{ marginRight: 12 }} />
      ) : null}
      <Typography.Text className="whitespace-nowrap">
        {isModelRunCompleted(modelRun) ? (
          <>
            <p>
              Finished processing images ({completedCount}/{totalCount})
            </p>
            {completedCount === 0 ? (
              <p className="font-bold text-red-600">
                There was an error running this model.
              </p>
            ) : null}
          </>
        ) : (
          <>
            {completedPercentage}% Processing images ({completedCount}/
            {totalCount})
          </>
        )}
      </Typography.Text>
    </div>
  );
}

export default RunModelProgressStats;
