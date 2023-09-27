import * as React from 'react';
import { Alert, Modal } from 'antd';
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

  return (
    <IsDebuggingContextProvider>
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
