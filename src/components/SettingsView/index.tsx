import React from 'react';
import { Typography } from 'antd';
import { DockerVersionPanel } from './DockerVersionPanel';

export function SettingsView(): JSX.Element {
  return (
    <div className="p-4">
      <Typography.Title level={2}>Setting Up</Typography.Title>
      <DockerVersionPanel />
    </div>
  );
}
