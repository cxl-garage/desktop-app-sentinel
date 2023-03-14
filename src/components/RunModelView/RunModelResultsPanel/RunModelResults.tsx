import React from 'react';
import ProcessingImagesGallery from './ImagesLoadingProgressGallery';
import useProcessingImages from './useProcessingImages';

function RunModelResults(): JSX.Element {
  const data = useProcessingImages();
  return <ProcessingImagesGallery processingImages={data} />;
}

export default RunModelResults;
