import * as LogRecord from 'models/LogRecord';
import { useQuery } from '@tanstack/react-query';
import { Button } from 'components/ui/Button';
import { LogList } from './LogList';
import './LogsView.css';

export function LogsView(): JSX.Element {
  const { data: logs } = useQuery({
    queryFn: window.SentinelDesktopService.getAllLogRecords,
    queryKey: LogRecord.QueryKeys.allLogRecords,
  });

  return (
    <div className="mx-8 mt-12 pb-12">
      <div className="LogsView__log-component-wrapper">
        <LogList logs={logs} />
      </div>
      <div className="LogsView__start-button">
        <Button>Report Issue</Button>
      </div>
    </div>
  );
}
