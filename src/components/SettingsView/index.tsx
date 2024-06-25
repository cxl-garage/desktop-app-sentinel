import { Typography } from 'antd';
import { DockerVersionPanel } from './DockerVersionPanel/DockerVersionPanel';
import { TensorflowImagePanel } from './TensorflowImagePanel/TensorflowImagePanel';

export function SettingsView(): JSX.Element {
  return (
    <div>
      <div className="mx-8 mt-12">
        <Typography.Title level={2}>Setting Up TEST 2</Typography.Title>
      </div>
      <div className="mx-8 mt-4">
        <DockerVersionPanel />
      </div>
      <div className="mx-8 mt-4">
        <TensorflowImagePanel />
      </div>
    </div>
  );
}
