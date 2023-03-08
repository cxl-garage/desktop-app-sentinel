import { useQuery } from '@tanstack/react-query';

const READ_PAST_RESULTS_QUERY = ['logfile'];

export function PastResultsView(): JSX.Element {
  // read results written by the python script
  const { data: pastResults } = useQuery({
    queryFn: window.SentinelDesktopService.readResults,
    queryKey: READ_PAST_RESULTS_QUERY,
  });

  console.log('Past results loaded', pastResults);

  return <p>PastResults view</p>;
}
