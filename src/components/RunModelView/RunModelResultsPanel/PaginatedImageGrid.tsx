import { LoadingOutlined } from '@ant-design/icons';
import { Image as AntdImage, Pagination } from 'antd';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { formatInteger } from '../utils/commonUtils';
import EGridSize from './EGridSize';
import GridSizeSelect from './GridSizeSelect';
import usePreloadImage from './usePreloadImage';
import usePrevious from './usePrevious';

const DEFAULT_PAGE_SIZE = 10;

const variants = {
  enter: (direction: number) => {
    // if (Math.abs(direction) > 1) {
    //   return { x: `0%` };
    // }
    return { x: `${direction * 100}%` };
  },
  middle: { x: '0%' },
  exit: (direction: number) => {
    // if (Math.abs(direction) > 1) {
    //   return { x: `0%` };
    // }
    return { x: `${direction * -100}%` };
  },
};

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

const ImageGridImage = styled(AntdImage)`
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
  imageSources: string[];
  inProgressItems?: string[];
}

function PaginatedImageGrid({
  imageSources,
  inProgressItems = [],
}: IProps): JSX.Element {
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [currentPage, setCurrentPage] = useState<number>(1);
  useEffect(() => setCurrentPage(1), [pageSize]);
  const lastPage = usePrevious(currentPage);
  const direction = currentPage - (lastPage ?? -1);
  const displayItems = imageSources.slice(
    (currentPage - 1) * pageSize,
    Math.min(currentPage * pageSize, imageSources.length),
  );
  const [gridSize, setGridSize] = useState<EGridSize>(EGridSize.DEFAULT);

  const imagesOnNextPage = imageSources.slice(
    currentPage * pageSize,
    Math.min((currentPage + 1) * pageSize, imageSources.length),
  );
  usePreloadImage({ imageSources: imagesOnNextPage });

  const imagesOnPrevPage = imageSources.slice(
    Math.max((currentPage - 2) * pageSize, 0),
    Math.min((currentPage - 1) * pageSize, imageSources.length),
  );
  usePreloadImage({ imageSources: imagesOnPrevPage });

  return (
    <MotionConfig transition={{ duration: 5 }}>
      <div>
        <div>
          <GridSizeSelect gridSize={gridSize} onChange={setGridSize} />
        </div>
        <div className="relative mt-8 overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false} custom={direction}>
            <motion.div
              key={currentPage}
              className="-mx-2.5 px-2.5"
              variants={variants}
              initial="enter"
              animate="middle"
              exit="exit"
              custom={direction}
            >
              <ImageGrid size={gridSize}>
                <>
                  {inProgressItems.map((it) => (
                    <LoadingImageWrapper key={it}>
                      <LoadingOutlined
                        style={{ fontSize: 64, color: '#00AAFF' }}
                      />
                    </LoadingImageWrapper>
                  ))}
                  {displayItems.map((src) => (
                    <ImageGridImage key={src} src={src} />
                  ))}
                </>
              </ImageGrid>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="mt-8">
          <Pagination
            total={imageSources.length}
            showTotal={(total, range) =>
              `${formatInteger(range[0])}-${formatInteger(
                range[1],
              )} of ${formatInteger(total)} images`
            }
            defaultCurrent={1}
            current={currentPage}
            pageSize={pageSize}
            hideOnSinglePage={imageSources.length <= DEFAULT_PAGE_SIZE}
            showSizeChanger
            onChange={(page, pSize) => {
              setCurrentPage(page);
              setPageSize(pSize);
            }}
          />
        </div>
      </div>
    </MotionConfig>
  );
}

export default PaginatedImageGrid;
