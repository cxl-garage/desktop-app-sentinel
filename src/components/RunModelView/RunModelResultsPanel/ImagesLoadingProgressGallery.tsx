import { LoadingOutlined } from '@ant-design/icons';
import { Image, Spin } from 'antd';
import _ from 'lodash';
import React from 'react';
import styled from 'styled-components';
import ERunningImageStatus from '../types/ERunningImageStatus';
import IRunningImage from '../types/IRunningImage';

const ImageGrid = styled.div`
  margin-top: 32px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(150px, 100%), 1fr));
  gap: 20px;
`;

const ImageGridImage = styled(Image)`
  border-radius: 10px;
  object-fit: cover;
  aspect-ratio: 1 / 1;
  box-shadow: 0 4px 4px 0px rgb(0 0 0 / 0.25);
`;

const LoadingImageWrapper = styled.div`
  background-color: #eaeaea;
  border-radius: 10px;
  padding: 40px;
  display: grid;
  place-content: center;
  box-shadow: 0 4px 4px 0px rgb(0 0 0 / 0.25);
`;

interface IProps {
  processingImages: IRunningImage[];
}

function ImagesLoadingProgressGallery({
  processingImages,
}: IProps): JSX.Element {
  const totalCount = processingImages.length;
  const completedCount = _.filter(processingImages, {
    status: ERunningImageStatus.COMPLETED,
  }).length;
  const completedPercentage = Math.round((completedCount * 100) / totalCount);
  return (
    <div className="flex-1 p-10">
      <div className="flex">
        {completedPercentage !== 100 && <Spin style={{ marginRight: 12 }} />}
        <span>
          {completedPercentage}% Processing images ({completedCount}/
          {totalCount})
        </span>
      </div>
      <ImageGrid>
        {processingImages
          .filter(
            (it) =>
              it.status === ERunningImageStatus.IN_PROGRESS ||
              it.status === ERunningImageStatus.COMPLETED,
          )
          .map((it) => {
            return it.status === ERunningImageStatus.IN_PROGRESS ? (
              <LoadingImageWrapper key={it.id}>
                <LoadingOutlined style={{ fontSize: 64, color: '#00AAFF' }} />
              </LoadingImageWrapper>
            ) : (
              <ImageGridImage key={it.id} src={it.url} />
            );
          })}
      </ImageGrid>
    </div>
  );
}

export default ImagesLoadingProgressGallery;
