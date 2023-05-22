import { Empty, Spin } from 'antd';
import React from 'react';
import ReactJson from 'react-json-view';
import { useIsDebugging } from '../DebuggingContext/IsDebuggingContext';
import ERunningImageStatus from '../types/ERunningImageStatus';
import useCurrentModelRunProgress from '../hooks/useCurrentModelRunProgress';
import IRunningImage from '../types/IRunningImage';
import ProcessingImagesGallery from './ImagesLoadingProgressGallery';

function RunModelResults(): JSX.Element {
  const { data: currentModelRunProgress } = useCurrentModelRunProgress();
  const runnerState = currentModelRunProgress?.runnerState;
  const isDebugging = useIsDebugging();

  if (!currentModelRunProgress) {
    return <Empty />;
  }
  if (!runnerState) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Spin spinning tip="Starting" />
      </div>
    );
  }
  const images: IRunningImage[] = [
    ...runnerState.completed.map((fileName) => ({
      id: fileName,
      url: `file://${currentModelRunProgress.startModelOptions.outputDirectory}/${fileName}`,
      status: ERunningImageStatus.COMPLETED,
    })),
    ...runnerState.inProgress.map((fileName) => ({
      id: fileName,
      url: `file://${currentModelRunProgress.startModelOptions.outputDirectory}/${fileName}`,
      status: ERunningImageStatus.IN_PROGRESS,
    })),
    ...runnerState.notStarted.map((fileName) => ({
      id: fileName,
      url: `file://${currentModelRunProgress.startModelOptions.outputDirectory}/${fileName}`,
      status: ERunningImageStatus.NOT_STARTED,
    })),
  ];
  return (
    <div>
      {images.length === 0 ? (
        <div className="flex h-40 items-center justify-center">
          <Spin spinning tip="Detecting" />
        </div>
      ) : (
        <ProcessingImagesGallery processingImages={images} />
      )}
      {isDebugging && currentModelRunProgress && (
        <ReactJson
          name="currentModelRunProgress"
          src={currentModelRunProgress}
        />
      )}
    </div>
  );
}

export default RunModelResults;
