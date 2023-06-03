import { LoadingOutlined } from '@ant-design/icons';
import { Image, Pagination, Radio, Spin, Typography } from 'antd';
import _ from 'lodash';
import React, { useState } from 'react';
import styled from 'styled-components';
import ERunningImageStatus from '../types/ERunningImageStatus';
import IRunningImage from '../types/IRunningImage';

enum EGridSize {
  LARGE = 300,
  DEFAULT = 150,
  SMALL = 100,
}

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: ${({
    size = EGridSize.DEFAULT,
  }: {
    size: EGridSize;
  }) => `repeat(
      auto-fill,
      minmax(min(${size}px, 100%), 1fr)
    );`};
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

function PhotoIcon({ size }: { size: EGridSize }): JSX.Element {
  const w = (() => {
    switch (size) {
      case EGridSize.LARGE:
        return 'w-6 h-6';
      case EGridSize.SMALL:
        return 'w-3.5 h-3.5';
      case EGridSize.DEFAULT:
      default:
        return 'w-4.5 h-4.5';
    }
  })();
  return (
    <span className="inline-flex h-full items-center align-middle">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className={w}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
        />
      </svg>
    </span>
  );
}
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
  const inProgressOrCompletedImages = processingImages.filter(
    (it) =>
      it.status === ERunningImageStatus.IN_PROGRESS ||
      it.status === ERunningImageStatus.COMPLETED,
  );
  const DEFAULT_PAGE_SIZE = 10;
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const itemCount = inProgressOrCompletedImages.length;
  const [currentPage, setCurrentPage] = useState<number>(1);
  const displayItems = inProgressOrCompletedImages.slice(
    (currentPage - 1) * pageSize,
    Math.min(currentPage * pageSize, itemCount),
  );
  const [gridSize, setGridSize] = useState<EGridSize>(EGridSize.DEFAULT);
  return (
    <div className="flex-1">
      <div className="flex justify-between">
        <div>
          {completedPercentage !== 100 && <Spin style={{ marginRight: 12 }} />}
          <Typography.Text>
            {completedPercentage}% Processing images ({completedCount}/
            {totalCount})
          </Typography.Text>
        </div>
        <Radio.Group
          size="small"
          options={[EGridSize.SMALL, EGridSize.DEFAULT, EGridSize.LARGE].map(
            (it) => ({ label: <PhotoIcon size={it} />, value: it }),
          )}
          onChange={(e) => setGridSize(e.target.value)}
          value={gridSize}
          optionType="button"
        />
      </div>
      <ImageGrid className="mt-8" size={gridSize}>
        {displayItems.map((it) => {
          return it.status === ERunningImageStatus.IN_PROGRESS ? (
            <LoadingImageWrapper key={it.id}>
              <LoadingOutlined style={{ fontSize: 64, color: '#00AAFF' }} />
            </LoadingImageWrapper>
          ) : (
            <ImageGridImage key={it.id} src={it.url} />
          );
        })}
      </ImageGrid>
      <div className="mt-8">
        <Pagination
          total={itemCount}
          showTotal={(total, range) =>
            `${range[0]}-${range[1]} of ${total} images`
          }
          defaultCurrent={1}
          pageSize={pageSize}
          hideOnSinglePage={itemCount <= DEFAULT_PAGE_SIZE}
          showSizeChanger
          onChange={(page, pSize) => {
            setCurrentPage(page);
            setPageSize(pSize);
          }}
        />
      </div>
    </div>
  );
}

export default ImagesLoadingProgressGallery;
