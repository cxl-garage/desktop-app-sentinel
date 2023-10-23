import { LoadingOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import useInstallTensorflowImage from '../hooks/useInstallTensorflowImage';

function InstallIButton(): JSX.Element {
  const { mutate: installTensorflowImage, isLoading } =
    useInstallTensorflowImage();
  return (
    <Button
      disabled={isLoading}
      icon={isLoading ? <LoadingOutlined /> : undefined}
      onClick={() => {
        installTensorflowImage();
      }}
    >
      {isLoading ? 'Installing...' : 'Install'}
    </Button>
  );
}

export default InstallIButton;
