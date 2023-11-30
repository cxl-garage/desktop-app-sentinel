import { Spin, Typography } from 'antd';
import _ from 'lodash';
import React, { useMemo } from 'react';
import ERunningImageStatus from '../types/ERunningImageStatus';
import IRunningImage from '../types/IRunningImage';
import * as ModelRunProgress from '../../../models/ModelRunProgress';

interface IProps {
  modelRun: ModelRunProgress.T['modelRun'] | null;
  processingImages: IRunningImage[];
}

function isModelRunCompleted(
  modelRun: ModelRunProgress.T['modelRun'],
  completedCount: number,
  totalCount: number,
): boolean {
  if (completedCount >= totalCount) {
    return true;
  }
  const stillRunning = modelRun === null || modelRun.status === 'IN_PROGRESS';
  return !stillRunning;
}

function RunModelProgressStats({
  modelRun,
  processingImages,
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

  if (totalCount === 0 && completedCount === 0) {
    return (
      <div>
        <Typography.Text>There are no results to show</Typography.Text>
      </div>
    );
  }

  const isModelRunFinished = isModelRunCompleted(
    modelRun,
    completedCount,
    totalCount,
  );

  return (
    <div>
      {!isModelRunFinished ? <Spin style={{ marginRight: 12 }} /> : null}
      <Typography.Text className="whitespace-nowrap">
        {isModelRunFinished ? (
          <>
            Finished processing images ({completedCount}/{totalCount})
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
