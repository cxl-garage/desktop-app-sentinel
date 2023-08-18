import { CaretLeftOutlined } from '@ant-design/icons';
import { Collapse, Spin } from 'antd';
import React from 'react';
import ImageInfo from './ImageInfo';
import InstallIButton from './InstallIButton';
import PanelHeader from './PanelHeader';
import useInstalledTensorflowImage from '../hooks/useInstalledTensorflowImage';

export function TensorflowImagePanel(): JSX.Element {
  const { data: image, isLoading } = useInstalledTensorflowImage();

  return (
    <Collapse
      expandIconPosition="end"
      // eslint-disable-next-line react/no-unstable-nested-components
      expandIcon={({ isActive }) => (
        <CaretLeftOutlined rotate={isActive ? 90 : -90} />
      )}
    >
      <Collapse.Panel
        key="docker"
        header={
          isLoading ? (
            <div className="ml-1 flex items-center gap-3">
              <Spin spinning />
              <span>Detecting if Tensorflow Docker image was installed</span>
            </div>
          ) : (
            <PanelHeader image={image} />
          )
        }
      >
        {(() => {
          if (isLoading) {
            return null;
          }
          return image ? <ImageInfo image={image} /> : <InstallIButton />;
        })()}
      </Collapse.Panel>
    </Collapse>
  );
}
