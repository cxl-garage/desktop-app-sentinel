import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Col, Empty, Input, Row } from 'antd';
import _ from 'lodash';
import { useRef } from 'react';
import { ResultsSummaryCard } from './ResultsSummaryCard';
import { ResultsSummaryCardSkeleton } from './ResultsSummaryCardSkeleton';

export function PastResultsView(): JSX.Element {
  const [modelSearchTerm, setModelSearchTerm] = React.useState('');

  const { data: pastResults } = useQuery({
    queryFn: () =>
      window.SentinelDesktopService.getAllCXLModelResults(modelSearchTerm),
    queryKey: ['allPastResults', modelSearchTerm],
  });

  const debouncedSearchTermUpdate = useRef(
    _.debounce(async (searchTerm) => {
      setModelSearchTerm(searchTerm);
    }, 300),
  ).current;

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
      <div className="mt-4">
        {pastResults.length ? (
          pastResults?.map((modelRunMetadata) => (
            <ResultsSummaryCard
              modelRunMetadata={modelRunMetadata}
              key={modelRunMetadata.id}
            />
          ))
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
