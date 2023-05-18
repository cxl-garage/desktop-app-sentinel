import React from 'react';
import { useQuery } from '@tanstack/react-query';
import * as DockerVersion from 'models/DockerVersion';
import { Collapse, Typography, Row, Col } from 'antd';
import {
  CaretLeftOutlined,
  CheckSquareFilled,
  CloseSquareFilled,
} from '@ant-design/icons';

export function DockerVersionPanel(): JSX.Element {
  const { data: version } = useQuery({
    queryFn: () => window.SentinelDesktopService.getVersion(),
    queryKey: ['docker', 'getVersion'],
  });

  function dockerHeader(): React.ReactNode {
    return (
      <div>
        {version && (
          <Row gutter={[12, 0]}>
            <Col>
              {DockerVersion.isDockerSuccess(version) && (
                <CheckSquareFilled className="text-2xl text-green-700" />
              )}
              {DockerVersion.isDockerError(version) && (
                <CloseSquareFilled className="text-2xl text-red-700" />
              )}
            </Col>
            <Col flex="auto">
              {DockerVersion.isDockerSuccess(version) && (
                <Typography>Docker Desktop Installed & Running</Typography>
              )}
              {DockerVersion.isDockerError(version) && (
                <Typography>
                  Please make sure
                  <a
                    href="https://www.docker.com/products/docker-desktop/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {' '}
                    Docker Desktop{' '}
                  </a>
                  is Installed & Running
                </Typography>
              )}
            </Col>
          </Row>
        )}
      </div>
    );
  }

  function dockerPanel(): React.ReactNode {
    return (
      <div>
        {DockerVersion.isDockerSuccess(version) && (
          <div>
            <Typography.Paragraph>
              <Typography.Text strong>Name: </Typography.Text>
              <Typography.Text>{version.name}</Typography.Text>
            </Typography.Paragraph>
            <Typography.Paragraph>
              <Typography.Text strong>Version: </Typography.Text>
              <Typography.Text>{version.version}</Typography.Text>
            </Typography.Paragraph>
            <Typography.Paragraph>
              <Typography.Text strong>Machine: </Typography.Text>
              <Typography.Text>
                {version.os} {version.arch} {version.kernel}
              </Typography.Text>
            </Typography.Paragraph>
          </div>
        )}
        {DockerVersion.isDockerError(version) && (
          <Typography.Text>{version.error}</Typography.Text>
        )}
      </div>
    );
  }

  return (
    <Collapse
      expandIconPosition="end"
      // eslint-disable-next-line react/no-unstable-nested-components
      expandIcon={({ isActive }) => (
        <CaretLeftOutlined rotate={isActive ? 90 : -90} />
      )}
    >
      <Collapse.Panel key="docker" header={dockerHeader()}>
        {dockerPanel()}
      </Collapse.Panel>
    </Collapse>
  );
}
