import { useQuery } from '@tanstack/react-query';
import { ResultsSummaryCard } from './ResultsSummaryCard';

const READ_PAST_RESULTS_QUERY = ['allPastResults'];

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
