import { DateTime } from 'luxon';
import { useQuery } from '@tanstack/react-query';
import * as LogRecord from '../../models/LogRecord';

type Props = {
  logRecord: LogRecord.T;
};

export default function LogContents({ logRecord }: Props): JSX.Element {
  const { data: logContents, isLoading } = useQuery({
    queryKey: LogRecord.QueryKeys.getLogContents(logRecord.modelRunId),
    queryFn: async () => {
      return window.SentinelDesktopService.getLogContents(logRecord.modelRunId);
    },
  });

  if (logContents === undefined || isLoading) {
    return <div>Loading...</div>;
  }

  if (logContents === null) {
    return <div>Couldn&apos;t find any logs in this directory</div>;
  }

  return (
    <div className="h-96 space-y-2 overflow-y-auto">
      {logContents.map((log, i) => {
        return (
          // logs are not rearrangeable so its safe to use index as they key
          // eslint-disable-next-line react/no-array-index-key
          <div key={i}>
            <p>
              <strong className="uppercase">{log.level}</strong> |{' '}
              {DateTime.fromISO(log.timestamp).toFormat(
                'yyyy-MM-dd HH:mm:ss.SSS',
              )}{' '}
              | {log.message}
            </p>
            {log.level === 'error' && log.stack ? <p>{log.stack}</p> : null}
          </div>
        );
      })}
    </div>
  );
}
