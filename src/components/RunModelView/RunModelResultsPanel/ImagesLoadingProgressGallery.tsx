import { LoadingOutlined } from '@ant-design/icons';
import { Image, Spin } from 'antd';
import React from 'react';
import styled from 'styled-components';
import IImageWithProcessingStatus from './IImageWithProcessingStatus';

const Wrapper = styled.div`
  flex: 1;
  padding: 40px;
`;

const LoadingStatusWrapper = styled.div`
  display: flex;
`;

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
  processingImages: IImageWithProcessingStatus[];
}

function ImagesLoadingProgressGallery({
  processingImages,
}: IProps): JSX.Element {
  const totalCount = processingImages.length;
  const completedCount = processingImages.filter(
    (it) => !it.isProcessing,
  ).length;
  const completedPercentage = Math.round((completedCount * 100) / totalCount);
  return (
    <Wrapper>
      <LoadingStatusWrapper>
        {completedPercentage !== 100 && <Spin style={{ marginRight: 12 }} />}
        <span>
          {completedPercentage}% Processing images ({completedCount}/
          {totalCount})
        </span>
      </LoadingStatusWrapper>
      <ImageGrid>
        {processingImages.map((it) => {
          return it.isProcessing ? (
            <LoadingImageWrapper key={it.id}>
              <LoadingOutlined style={{ fontSize: 64, color: '#00AAFF' }} />
            </LoadingImageWrapper>
          ) : (
            <ImageGridImage key={it.id} src={it.src} />
          );
        })}
      </ImageGrid>
    </Wrapper>
  );
}

export default ImagesLoadingProgressGallery;
