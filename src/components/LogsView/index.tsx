import { useQuery } from '@tanstack/react-query';
import { LogList } from './LogList';

const READ_LOG_QUERY = ['allLogs'];

export function LogsView(): JSX.Element {
  const { data: logs } = useQuery({
    queryFn: window.SentinelDesktopService.getLogRecords,
    queryKey: READ_LOG_QUERY,
  });

  return (
    <>
      <h1>Logs</h1>
      <div className="LogsView__log-component-wrapper">
        <LogList logs={logs} />
      </div>
      <button type="button" className="LogsView__start-button">
        Contact support
      </button>
    </>
  );
}
