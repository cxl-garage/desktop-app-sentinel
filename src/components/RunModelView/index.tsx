import * as React from 'react';
import { Alert, Modal } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { DockerVersionPanel } from '../SettingsView/DockerVersionPanel';
import useIsDependenciesMissing from '../SettingsView/hooks/useIsDependenciesMissing';
import { TensorflowImagePanel } from '../SettingsView/TensorflowImagePanel/TensorflowImagePanel';
import IsDebuggingContextProvider from './DebuggingContext/IsDebuggingContextProvider';
import RunModelInputs from './RunModelInputs/RunModelInputs';
import RunModelResults from './RunModelResultsPanel/RunModelResults';

export function RunModelView(): JSX.Element {
  const { isDependenciesMissing } = useIsDependenciesMissing();
  const [
    isMissingDependenciesModalDismissed,
    setIsMissingDependenciesModalDismissed,
  ] = React.useState<boolean>(false);

  const { data: envVars } = useQuery({
    queryFn: async () => {
      const dbURL = await window.SentinelDesktopService.getEnv('DATABASE_URL');
      const cliQueryEngineType = await window.SentinelDesktopService.getEnv(
        'PRISMA_CLI_QUERY_ENGINE_TYPE',
      );
      const clientEngineType = await window.SentinelDesktopService.getEnv(
        'PRISMA_CLIENT_ENGINE_TYPE',
      );
      const qeBinary = await window.SentinelDesktopService.getEnv(
        'PRISMA_QUERY_ENGINE_BINARY',
      );
      const seBinary = await window.SentinelDesktopService.getEnv(
        'PRISMA_SCHEMA_ENGINE_BINARY',
      );
      return {
        dbURL,
        cliQueryEngineType,
        clientEngineType,
        qeBinary,
        seBinary,
      };
    },
    queryKey: ['getEnv'],
  });

  return (
    <IsDebuggingContextProvider>
      <p>DB URL: {envVars?.dbURL}</p>
      <p>CLI Engine Type: {envVars?.cliQueryEngineType}</p>
      <p>Client Engine Type: {envVars?.clientEngineType}</p>
      <p>QE Binary: {envVars?.qeBinary}</p>
      <p>SE Binary: {envVars?.seBinary}</p>

      <div className="flex h-full overflow-y-hidden">
        <div className="w-96 overflow-y-auto border-r-2 border-gray-200 p-10 dark:border-gray-600">
          <RunModelInputs />
        </div>
        <div className="flex-1 overflow-y-auto p-10">
          <RunModelResults />
        </div>
      </div>
      <Modal
        title="Missing dependencies"
        open={isDependenciesMissing && !isMissingDependenciesModalDismissed}
        onOk={() => {
          setIsMissingDependenciesModalDismissed(true);
        }}
        onCancel={() => {
          setIsMissingDependenciesModalDismissed(true);
        }}
        okButtonProps={{ type: 'default' }}
        cancelButtonProps={{ style: { display: 'none' } }}
        width={540}
      >
        <div className="mb-8 mt-6 flex flex-col gap-4">
          <Alert
            showIcon
            type="warning"
            description="You will not be able to run a model until all the dependencies are installed. Please check the settings below."
          />
          <DockerVersionPanel />
          <TensorflowImagePanel />
        </div>
      </Modal>
    </IsDebuggingContextProvider>
  );
}
