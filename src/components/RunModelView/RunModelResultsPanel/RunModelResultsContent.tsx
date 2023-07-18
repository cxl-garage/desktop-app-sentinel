import React from 'react';
import { EOutputStyle } from '../../../models/RunModelOptions';
import IRunningImage from '../types/IRunningImage';
import ProcessingImagesGallery from './ImagesLoadingProgressGallery';
import OutputStyleNoneResults from './OutputStyleNoneResults';

interface IProps {
  outputStyle: EOutputStyle;
  processingImages: IRunningImage[];
  csvFilePath: string;
}

function RunModelResultsContent({
  outputStyle,
  processingImages,
  csvFilePath,
}: IProps): JSX.Element {
  return outputStyle === EOutputStyle.NONE ? (
    <OutputStyleNoneResults
      processingImages={processingImages}
      csvFilePath={csvFilePath}
    />
  ) : (
    <ProcessingImagesGallery processingImages={processingImages} />
  );
}

export default RunModelResultsContent;
