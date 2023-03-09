import './LogList.css';
import * as LogRecord from 'models/LogRecord';
import logIcon from '../../../assets/log.svg';

type Props = {
  logs?: LogRecord.T[];
};

export function LogList({ logs = [] }: Props): JSX.Element {
  return (
    <div className="LogList">
      <img src={logIcon} alt="log" />
      {logs.map((log: LogRecord.T) => (
        <p key={log.id}>{log.message}</p>
      ))}
    </div>
  );
}
