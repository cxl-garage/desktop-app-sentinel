import { Empty, Spin, Typography } from 'antd';
import { useMemo } from 'react';
import ReactJson from 'react-json-view';
import { useIsDebugging } from '../DebuggingContext/IsDebuggingContext';
import useCurrentModelRunProgress from '../hooks/useCurrentModelRunProgress';
import ERunningImageStatus from '../types/ERunningImageStatus';
import IRunningImage from '../types/IRunningImage';
import RunModelResultsContent from './RunModelResultsContent';

function RunModelResults(): JSX.Element {
  const { data: currentModelRunProgress } = useCurrentModelRunProgress();
  const runnerState = currentModelRunProgress?.runnerState;
  const isDebugging = useIsDebugging();

  const images: IRunningImage[] = useMemo(() => {
    return runnerState
      ? [
          ...runnerState.completed.map(({ inputPath, outputPath }) => ({
            id: inputPath,
            url: `file://${outputPath}`,
            status: ERunningImageStatus.COMPLETED,
          })),
          ...runnerState.inProgress.map((fileName) => ({
            id: fileName,
            url: '', // Not currently used
            status: ERunningImageStatus.IN_PROGRESS,
          })),
          ...runnerState.notStarted.map((fileName) => ({
            id: fileName,
            url: '', // Not currently used
            status: ERunningImageStatus.NOT_STARTED,
          })),
        ]
      : [];
  }, [runnerState]);

  if (!currentModelRunProgress) {
    return (
      <div className="grid h-72 place-content-center">
        <Empty />
      </div>
    );
  }

  const isModelStarting =
    !currentModelRunProgress.runnerState ||
    (images.length === 0 && !currentModelRunProgress.modelRun);

  return (
    <div>
      {isModelStarting ? (
        <div className="flex h-72 items-center justify-center">
          <div>
            <Spin spinning />
            <Typography.Text className="ml-2">Starting ...</Typography.Text>
          </div>
        </div>
      ) : (
        <RunModelResultsContent
          modelRun={currentModelRunProgress.modelRun}
          outputStyle={currentModelRunProgress.startModelOptions.outputStyle}
          processingImages={images}
          csvFilePath={`${currentModelRunProgress.startModelOptions.outputDirectory}/detections.csv`}
        />
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
