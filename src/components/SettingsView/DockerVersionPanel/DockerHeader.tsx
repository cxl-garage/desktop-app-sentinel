import { CheckSquareFilled, CloseSquareFilled } from '@ant-design/icons';
import { Col, Row, Typography } from 'antd';
import React from 'react';
import * as DockerVersion from '../../../models/DockerVersion';

interface IProps {
  version: DockerVersion.T | undefined;
}

function DockerHeader({ version }: IProps): JSX.Element {
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

export default DockerHeader;
