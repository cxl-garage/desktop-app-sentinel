import React from 'react';
import { EOutputStyle } from '../../../models/RunModelOptions';
import IRunningImage from '../types/IRunningImage';
import ProcessingImagesGallery from './ImagesLoadingProgressGallery';
import OutputStyleNoneResults from './OutputStyleNoneResults';
import * as ModelRunProgress from '../../../models/ModelRunProgress';

interface IProps {
  internalRunnerStatus: ModelRunProgress.InternalModelRunStatus | undefined;
  modelRun: ModelRunProgress.T['modelRun'] | null;
  outputStyle: EOutputStyle;
  processingImages: IRunningImage[];
  csvFilePath: string;
}

function RunModelResultsContent({
  modelRun,
  outputStyle,
  processingImages,
  csvFilePath,
  internalRunnerStatus,
}: IProps): JSX.Element {
  return outputStyle === EOutputStyle.NONE ? (
    <OutputStyleNoneResults
      modelRun={modelRun}
      processingImages={processingImages}
      csvFilePath={csvFilePath}
    />
  ) : (
    <ProcessingImagesGallery
      internalRunnerStatus={internalRunnerStatus}
      modelRun={modelRun}
      processingImages={processingImages}
    />
  );
}

export default RunModelResultsContent;
