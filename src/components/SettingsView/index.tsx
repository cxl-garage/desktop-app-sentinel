import { Typography } from 'antd';
import { DockerVersionPanel } from './DockerVersionPanel';
import { InstalledImagePanel } from './InstalledImagePanel';

export function SettingsView(): JSX.Element {
  return (
    <div>
      <div className="mx-8 mt-12">
        <Typography.Title level={2}>Setting Up</Typography.Title>
      </div>
      <div className="mx-8 mt-4">
        <DockerVersionPanel />
      </div>
      <div className="mx-8 mt-4">
        <InstalledImagePanel />
      </div>
    </div>
  );
}
