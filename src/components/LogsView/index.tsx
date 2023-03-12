import { useQuery } from '@tanstack/react-query';
import { LogList } from './LogList';
import * as LogRecord from 'models/LogRecord';


const READ_LOG_QUERY = ['allLogs'];

export function LogsView(): JSX.Element {
  // Example log data (just for now)
  const logs: LogRecord.T[] = [
    {
      id: "100",
      level: "INFO",
      timestamp: new Date(),
      message: "This is the first log message."
    },
    {
      id: "101",
      level: "WARNING",
      timestamp: new Date(),
      message: "This is the second log message."
    },
    {
      id: "102",
      level: "DEBUG",
      timestamp: new Date(),
      message: "This is the third log message."
    },
    {
      id: "103",
      level: "ERROR",
      timestamp: new Date(),
      message: "This is the fourth log message."
    },
  ];

  // const { data: logs } = useQuery({
  //   queryFn: window.SentinelDesktopService.getAllLogRecords,
  //   queryKey: READ_LOG_QUERY,
  // });

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
