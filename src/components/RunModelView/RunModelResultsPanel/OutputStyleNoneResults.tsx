import { ExportOutlined } from '@ant-design/icons';
import _ from 'lodash';
import React, { useMemo } from 'react';
import { Button } from '../../ui/Button';
import ERunningImageStatus from '../types/ERunningImageStatus';
import IRunningImage from '../types/IRunningImage';
import RunModelProgressStats from './RunModelProgressStats';
import * as ModelRunProgress from '../../../models/ModelRunProgress';

interface IProps {
  modelRun: ModelRunProgress.T['modelRun'] | null;
  processingImages: IRunningImage[];
  csvFilePath: string;
}

function OutputStyleNoneResults({
  modelRun,
  processingImages,
  csvFilePath,
}: IProps): JSX.Element {
  const completedImagesCount = useMemo(
    () =>
      _.filter(processingImages, { status: ERunningImageStatus.COMPLETED })
        .length,
    [processingImages],
  );
  return (
    <div className="flex-1">
      <div>
        <RunModelProgressStats
          modelRun={modelRun}
          processingImages={processingImages}
        />
      </div>
      {completedImagesCount === processingImages.length && (
        <div className="mt-8">
          <span className="mr-2">
            Created file <span className="italic">detections.csv</span>
          </span>
          <Button
            onClick={() => {
              window.SentinelDesktopService.openFile(csvFilePath);
            }}
          >
            Open
            <span className="ml-1">
              <ExportOutlined />
            </span>
          </Button>
        </div>
      )}
    </div>
  );
}

export default OutputStyleNoneResults;
