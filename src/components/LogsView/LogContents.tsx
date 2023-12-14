import { DateTime } from 'luxon';
import { useQuery } from '@tanstack/react-query';
import { Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import * as LogRecord from '../../models/LogRecord';

type Props = {
  logRecord: LogRecord.T;
};

const CXL_EMAIL = 'sentinel-support@conservationxlabs.org';

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

  // get all log contents as a single string to make it copyable to
  // the clipboard
  const logContentsText = logContents
    .map((log) => {
      const logLevel = log.level.toUpperCase();
      const dateString = DateTime.fromISO(log.timestamp).toFormat(
        'yyyy-MM-dd HH:mm:ss.SSS',
      );
      return `${logLevel} | ${dateString} | ${log.message}`;
    })
    .join('\n');

  return (
    <div className="max-h-96 space-y-2 overflow-y-auto">
      <div className="space-x-2">
        <Button
          onClick={() => {
            const logDate = DateTime.fromJSDate(logRecord.timestamp).toFormat(
              'yyyy-MM-dd',
            );

            const anchorElt = document.createElement('a');
            const file = new Blob([logContentsText], { type: 'text/plain' });
            anchorElt.href = URL.createObjectURL(file);
            anchorElt.download = `${logRecord.modelName}-${logDate}.txt`;
            document.body.appendChild(anchorElt); // required for Firefox
            anchorElt.click();
            document.body.removeChild(anchorElt); // clean up
          }}
        >
          <DownloadOutlined />
          Download log file
        </Button>
        <Button
          onClick={() => {
            const to = encodeURIComponent(CXL_EMAIL);
            const subject = encodeURIComponent(
              `ISSUE: Problem running ${logRecord.modelName} model`,
            );
            const body = encodeURIComponent(
              `Hello,\nI encountered a problem running the ${logRecord.modelName} model. The content of the log file is:\n\n${logContentsText}`,
            );
            window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
          }}
        >
          Report Issue
        </Button>
      </div>
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
