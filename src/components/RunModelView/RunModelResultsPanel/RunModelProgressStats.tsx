import { Spin, Typography } from 'antd';
import _ from 'lodash';
import React, { useMemo } from 'react';
import ERunningImageStatus from '../types/ERunningImageStatus';
import IRunningImage from '../types/IRunningImage';

interface IProps {
  processingImages: IRunningImage[];
}

function RunModelProgressStats({ processingImages }: IProps): JSX.Element {
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

  return (
    <div>
      {completedPercentage !== 100 && <Spin style={{ marginRight: 12 }} />}
      <Typography.Text className="whitespace-nowrap">
        {completedPercentage}% Processing images ({completedCount}/{totalCount})
      </Typography.Text>
    </div>
  );
}

export default RunModelProgressStats;
