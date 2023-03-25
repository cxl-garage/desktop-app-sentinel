import { Empty } from 'antd';
import React from 'react';
import { useRunningModel } from '../RunningModelProvider/RunningModelContext';
import ProcessingImagesGallery from './ImagesLoadingProgressGallery';

function RunModelResults(): JSX.Element {
  const runningModel = useRunningModel();
  if (!runningModel) {
    return <Empty />;
  }
  return <ProcessingImagesGallery processingImages={runningModel.images} />;
}

export default RunModelResults;
