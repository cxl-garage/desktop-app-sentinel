import { LoadingOutlined } from '@ant-design/icons';
import { Image, Pagination } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import useLocalStorageState from 'use-local-storage-state';
import { formatInteger } from '../../RunModelView/utils/commonUtils';
import EImageGridSize from './EImageGridSize';
import usePreloadImage from '../../RunModelView/RunModelResultsPanel/usePreloadImage';

const DEFAULT_PAGE_SIZE = 10;

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: ${({
    size = EImageGridSize.DEFAULT,
  }: {
    size: EImageGridSize;
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
  display: grid;
  place-content: center;
  box-shadow: 0 4px 4px 0px rgb(0 0 0 / 0.25);
`;

interface IProps {
  imageSources: string[];
  inProgressItems?: string[]; // each of the in-progress item will cause a spinner to display in the grid. Each item should be the source(string) of an image (This is not currently displayed in the UI).
  gridSize?: EImageGridSize;
}

function PaginatedImageGrid({
  imageSources,
  inProgressItems = [],
  gridSize = EImageGridSize.DEFAULT,
}: IProps): JSX.Element {
  const totalItemCount = imageSources.length + inProgressItems.length;
  const [pageSize, setPageSize] = useLocalStorageState<number>('gridPageSize', {
    defaultValue: DEFAULT_PAGE_SIZE,
  });
  const lastPage = Math.ceil(totalItemCount / pageSize);

  const [currentPage, setCurrentPage] = useState<number>(1);
  useEffect(() => setCurrentPage(1), [pageSize]);

  const displayItems = imageSources.slice(
    (currentPage - 1) * pageSize,
    Math.min(currentPage * pageSize, totalItemCount),
  );

  const imagesOnNextPage = useMemo(
    () =>
      imageSources.slice(
        currentPage * pageSize,
        Math.min((currentPage + 1) * pageSize, imageSources.length),
      ),
    [imageSources, currentPage, pageSize],
  );
  usePreloadImage({ imageSources: imagesOnNextPage });

  const imagesOnPrevPage = useMemo(
    () =>
      imageSources.slice(
        Math.max((currentPage - 2) * pageSize, 0),
        Math.min((currentPage - 1) * pageSize, imageSources.length),
      ),
    [imageSources, currentPage, pageSize],
  );
  usePreloadImage({ imageSources: imagesOnPrevPage });

  return (
    <div>
      <ImageGrid size={gridSize}>
        <>
          {displayItems.map((src) => (
            <ImageGridImage key={src} src={src} />
          ))}
          {currentPage === lastPage &&
            inProgressItems.map((it) => (
              <LoadingImageWrapper key={it}>
                <LoadingOutlined
                  style={{
                    fontSize: gridSize * 0.5,
                    color: '#00AAFF',
                    height: gridSize,
                  }}
                />
              </LoadingImageWrapper>
            ))}
        </>
      </ImageGrid>
      <div className="mt-8">
        <Pagination
          total={totalItemCount}
          showTotal={(total, range) =>
            `${formatInteger(range[0])}-${formatInteger(
              range[1],
            )} of ${formatInteger(total)} images`
          }
          defaultCurrent={1}
          current={currentPage}
          pageSize={pageSize}
          hideOnSinglePage={totalItemCount <= DEFAULT_PAGE_SIZE}
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

export default PaginatedImageGrid;
