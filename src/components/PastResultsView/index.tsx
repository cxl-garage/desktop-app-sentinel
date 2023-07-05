import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Col, Empty, Input, Pagination, Row } from 'antd';
import _ from 'lodash';
import { useCallback, useState } from 'react';
import { formatInteger } from 'components/RunModelView/utils/commonUtils';
import useLocalStorageState from 'use-local-storage-state';
import { ResultsSummaryCard } from './ResultsSummaryCard';
import { ResultsSummaryCardSkeleton } from './ResultsSummaryCardSkeleton';

const DEFAULT_PAGE_SIZE = 3;
const PAGE_SIZE_OPTIONS = [3, 5, 10];

export function PastResultsView(): JSX.Element {
  const [modelSearchTerm, setModelSearchTerm] = React.useState('');
  const [pageSize, setPageSize] = useLocalStorageState<number>(
    'pastResultsPageSize',
    {
      defaultValue: DEFAULT_PAGE_SIZE,
    },
  );
  const [currentPage, setCurrentPage] = useState<number>(1);

  const { data: pastResults } = useQuery({
    queryFn: () =>
      window.SentinelDesktopService.getAllCXLModelResults(modelSearchTerm),
    queryKey: ['allPastResults', modelSearchTerm],
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearchTermUpdate = useCallback(
    _.debounce((searchTerm) => {
      setModelSearchTerm(searchTerm);
    }, 300),
    [],
  );

  const handlePathInput = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    debouncedSearchTermUpdate(event.target.value);
  };

  let pageContents;
  if (!pastResults) {
    pageContents = (
      <>
        <ResultsSummaryCardSkeleton />
        <ResultsSummaryCardSkeleton />
      </>
    );
  } else {
    pageContents = (
      <div className="mb-4 mt-4">
        {pastResults.length ? (
          <>
            {pastResults
              ?.slice((currentPage - 1) * pageSize, currentPage * pageSize)
              .map((modelRunMetadata) => (
                <ResultsSummaryCard
                  modelRunMetadata={modelRunMetadata}
                  key={modelRunMetadata.id}
                />
              ))}
            <Pagination
              total={pastResults.length}
              showTotal={(total, range) =>
                `${formatInteger(range[0])}-${formatInteger(
                  range[1],
                )} of ${formatInteger(total)} results`
              }
              defaultCurrent={1}
              current={currentPage}
              pageSize={pageSize}
              hideOnSinglePage={pastResults.length <= DEFAULT_PAGE_SIZE}
              showSizeChanger
              onChange={(page, pSize) => {
                setCurrentPage(page);
                setPageSize(pSize);
              }}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
            />
          </>
        ) : (
          <Empty />
        )}
      </div>
    );
  }
  return (
    <Row gutter={[16, 16]} className="my-4">
      <Col span={22} offset={1}>
        <Input
          placeholder="Search by model name..."
          onChange={handlePathInput}
          className="max-w-lg"
        />
        {pageContents}
      </Col>
    </Row>
  );
}
