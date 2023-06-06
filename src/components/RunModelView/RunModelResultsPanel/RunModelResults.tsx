import { Empty, Spin } from 'antd';
import { useMemo } from 'react';
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

  const outputDirectory =
    currentModelRunProgress?.startModelOptions.outputDirectory;

  const images: IRunningImage[] = useMemo(() => {
    return runnerState && outputDirectory
      ? [
          ...runnerState.completed.map(({ fileName, parentDir }) => ({
            id: fileName,
            url: parentDir
              ? `file://${outputDirectory}/${parentDir}/${fileName}`
              : `file://${outputDirectory}/${fileName}`,
            status: ERunningImageStatus.COMPLETED,
          })),
          ...runnerState.inProgress.map((fileName) => ({
            id: fileName,
            url: `file://${outputDirectory}/${fileName}`,
            status: ERunningImageStatus.IN_PROGRESS,
          })),
          ...runnerState.notStarted.map((fileName) => ({
            id: fileName,
            url: `file://${outputDirectory}/${fileName}`,
            status: ERunningImageStatus.NOT_STARTED,
          })),
        ]
      : [];
  }, [runnerState, outputDirectory]);

  if (!currentModelRunProgress) {
    return (
      <div className="grid h-72 place-content-center">
        <Empty />
      </div>
    );
  }

  if (!runnerState) {
    return (
      <div className="grid h-72 place-content-center">
        <Spin spinning tip="Starting" />
      </div>
    );
  }

  return (
    <div>
      {images.length === 0 ? (
        <div className="flex h-72 items-center justify-center">
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
