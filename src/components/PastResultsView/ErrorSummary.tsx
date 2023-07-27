import { Result } from 'antd';
import { useIsDebugging } from 'components/RunModelView/DebuggingContext/IsDebuggingContext';
import { MISSING_DIR_ERROR_MESSAGE } from 'main/SentinelDesktopService/errors';

export default function ErrorSummary({ error }: { error: Error }): JSX.Element {
  const isDebugging = useIsDebugging();
  let errorTitle = `Error loading images`;

  if (isDebugging) {
    errorTitle = `Error loading images: ${error.message}`;
  } else if (error.message.includes(MISSING_DIR_ERROR_MESSAGE)) {
    errorTitle = MISSING_DIR_ERROR_MESSAGE;
    // TODO: Add button to allow directory changes (maybe also add in result information section)
  }
  return <Result status="warning" title={errorTitle} />;
}
