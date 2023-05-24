import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Col, Input, Row } from 'antd';
import { ResultsSummaryCard } from './ResultsSummaryCard';

const READ_PAST_RESULTS_QUERY = ['allPastResults'];

export function PastResultsView(): JSX.Element {
  // read results written by the python script
  const { data: pastResults } = useQuery({
    queryFn: window.SentinelDesktopService.getAllCXLModelResults,
    queryKey: READ_PAST_RESULTS_QUERY,
  });
  const [localPath, setLocalPath] = React.useState('');

  const handlePathInput = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    setLocalPath(event.target.value);
  };

  if (!pastResults) {
    return <div>Loading...</div>;
  }
  return (
    <Row gutter={[16, 16]} className="my-4">
      <Col span={22} offset={1}>
        <Input
          placeholder="Search results... (currently: proof-of-concept local path loader)"
          onChange={handlePathInput}
          className="max-w-lg"
        />
        {pastResults?.map((modelRunMetadata) => (
          <ResultsSummaryCard
            modelRunMetadata={modelRunMetadata}
            key={modelRunMetadata.id}
            imagePathOverride={localPath !== '' ? localPath : undefined}
          />
        ))}
      </Col>
    </Row>
  );
}
