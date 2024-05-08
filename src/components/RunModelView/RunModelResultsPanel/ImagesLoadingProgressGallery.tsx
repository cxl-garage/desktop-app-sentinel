import _ from 'lodash';
import React, { useMemo } from 'react';
import useLocalStorageState from 'use-local-storage-state';
import ERunningImageStatus from '../types/ERunningImageStatus';
import IRunningImage from '../types/IRunningImage';
import EImageGridSize from '../../ui/PaginatedImageGrid/EImageGridSize';
import ImageGridSizeSelect from '../../ui/GridSizeSelect';
import PaginatedImageGrid from '../../ui/PaginatedImageGrid';
import RunModelProgressStats from './RunModelProgressStats';
import * as ModelRunProgress from '../../../models/ModelRunProgress';

interface IProps {
  internalRunnerStatus: ModelRunProgress.InternalModelRunStatus | undefined;
  modelRun: ModelRunProgress.T['modelRun'] | null;
  processingImages: IRunningImage[];
}

function ImagesLoadingProgressGallery({
  modelRun,
  processingImages,
  internalRunnerStatus,
}: IProps): JSX.Element {
  const inProgressImages = useMemo(
    () =>
      _.filter(processingImages, {
        status: ERunningImageStatus.IN_PROGRESS,
      }).map((it) => it.id),
    [processingImages],
  );

  const completedImages = useMemo(
    () =>
      _.filter(processingImages, {
        status: ERunningImageStatus.COMPLETED,
      }).map((it) => it.url),
    [processingImages],
  );

  const [gridSize, setGridSize] = useLocalStorageState<EImageGridSize>(
    'gridSize',
    {
      defaultValue: EImageGridSize.DEFAULT,
    },
  );

  return (
    <div className="flex-1">
      <div className="flex justify-between">
        <RunModelProgressStats
          internalRunnerStatus={internalRunnerStatus}
          modelRun={modelRun}
          processingImages={processingImages}
        />
        <div>
          <ImageGridSizeSelect gridSize={gridSize} onChange={setGridSize} />
        </div>
      </div>
      <div className="mt-8">
        <PaginatedImageGrid
          imageSources={completedImages}
          inProgressItems={inProgressImages}
          gridSize={gridSize}
        />
      </div>
    </div>
  );
}

export default ImagesLoadingProgressGallery;
