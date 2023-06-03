import { Spin, Typography } from 'antd';
import _ from 'lodash';
import React, { useMemo } from 'react';
import ERunningImageStatus from '../types/ERunningImageStatus';
import IRunningImage from '../types/IRunningImage';
import PaginatedImageGrid from './PaginatedImageGrid';

interface IProps {
  processingImages: IRunningImage[];
}

function ImagesLoadingProgressGallery({
  processingImages,
}: IProps): JSX.Element {
  const inProgressImages = useMemo(
    () =>
      _.filter(processingImages, {
        status: ERunningImageStatus.IN_PROGRESS,
      }).map((it) => it.url),
    [processingImages],
  );

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
    <div className="flex-1">
      <div className="flex justify-between">
        <div>
          {completedPercentage !== 100 && <Spin style={{ marginRight: 12 }} />}
          <Typography.Text className="whitespace-nowrap">
            {completedPercentage}% Processing images ({completedCount}/
            {totalCount})
          </Typography.Text>
        </div>
      </div>
      <PaginatedImageGrid
        imageSources={completedImages}
        inProgressItems={inProgressImages}
      />
    </div>
  );
}

export default ImagesLoadingProgressGallery;
