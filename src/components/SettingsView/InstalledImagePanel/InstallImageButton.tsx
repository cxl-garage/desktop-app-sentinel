import { LoadingOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import React from 'react';
import useInstallDockerImage from './useInstallDockerImage';

function InstallImageButton(): JSX.Element {
  const { mutate: installDockerImage, isLoading } = useInstallDockerImage();
  return (
    <Button
      disabled={isLoading}
      icon={isLoading ? <LoadingOutlined /> : undefined}
      onClick={() => {
        installDockerImage();
      }}
    >
      {isLoading ? 'Installing...' : 'Install'}
    </Button>
  );
}

export default InstallImageButton;
