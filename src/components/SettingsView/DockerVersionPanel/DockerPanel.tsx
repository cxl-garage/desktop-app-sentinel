import { Typography } from 'antd';
import React from 'react';
import * as DockerVersion from '../../../models/DockerVersion';
import getHumanFriendlyErrorMessage from './getHumanFriendlyErrorMessage';

interface IProps {
  version: DockerVersion.T | undefined;
}

function DockerPanel({ version }: IProps): JSX.Element {
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
        <Typography.Text>
          {getHumanFriendlyErrorMessage(version.error)}
        </Typography.Text>
      )}
    </div>
  );
}

export default DockerPanel;
