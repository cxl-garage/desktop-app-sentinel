import { useQuery } from '@tanstack/react-query';
import { Card } from 'components/ui/Card';

import * as CXLModelResults from 'models/CXLModelResults';

const READ_PAST_RESULTS_QUERY = ['allPastResults'];

type SummaryCardProps = {
  modelRunMetadata: CXLModelResults.T;
};
function ResultsSummaryCard({
  modelRunMetadata,
}: SummaryCardProps): JSX.Element {
  const { rundate } = modelRunMetadata;
  return <Card title={rundate}>Results summary card</Card>;
}

export function PastResultsView(): JSX.Element {
  // read results written by the python script
  const { data: pastResults } = useQuery({
    queryFn: window.SentinelDesktopService.getAllCXLModelResults,
    queryKey: READ_PAST_RESULTS_QUERY,
  });
  console.log('Past results loaded', pastResults);

  if (!pastResults) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      {pastResults?.map((modelRunMetadata) => (
        <ResultsSummaryCard
          modelRunMetadata={modelRunMetadata}
          key={modelRunMetadata.runid}
        />
      ))}
    </div>
  );
}
