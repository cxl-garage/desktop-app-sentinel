import { CaretLeftOutlined } from '@ant-design/icons';
import { Collapse } from 'antd';
import React from 'react';
import useDockerVersion from '../hooks/useDockerVersion';
import DockerHeader from './DockerHeader';
import DockerPanel from './DockerPanel';

export function DockerVersionPanel(): JSX.Element {
  const { data: version } = useDockerVersion();

  return (
    <Collapse
      expandIconPosition="end"
      // eslint-disable-next-line react/no-unstable-nested-components
      expandIcon={({ isActive }) => (
        <CaretLeftOutlined rotate={isActive ? 90 : -90} />
      )}
    >
      <Collapse.Panel key="docker" header={<DockerHeader version={version} />}>
        <DockerPanel version={version} />
      </Collapse.Panel>
    </Collapse>
  );
}
