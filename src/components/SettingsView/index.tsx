import { Typography } from 'antd';
import { DockerVersionPanel } from './DockerVersionPanel';

export function SettingsView(): JSX.Element {
  return (
    <div className="mx-8 mt-12 p-4">
      <Typography.Title level={2}>Setting Up</Typography.Title>
      <DockerVersionPanel />
    </div>
  );
}
