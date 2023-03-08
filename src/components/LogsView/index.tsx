import { useQuery } from '@tanstack/react-query';
import { LogComponent } from './LogComponent';

const READ_LOG_QUERY = ['logfile'];

export function LogsView(): JSX.Element {
  const { data: logs } = useQuery({
    queryFn: window.SentinelDesktopService.readLogFile,
    queryKey: READ_LOG_QUERY,
  });

  return (
    <>
      <h1>Logs</h1>
      <div className="LogsView__log-component-wrapper">
        <LogComponent data={logs} />
      </div>
      <button type="button" className="LogsView__start-button">
        Contact support
      </button>
    </>
  );
}
