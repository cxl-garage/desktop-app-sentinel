import { CaretLeftOutlined } from '@ant-design/icons';
import { Collapse, Spin } from 'antd';
import React from 'react';
import ImagePanel from './ImagePanel';
import InstallImageButton from './InstallImageButton';
import PanelHeader from './PanelHeader';
import useInstalledDockerImage from './useInstalledDockerImage';

export function InstalledImagePanel(): JSX.Element {
  const { data: image, isLoading } = useInstalledDockerImage();

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
          return image ? <ImagePanel image={image} /> : <InstallImageButton />;
        })()}
      </Collapse.Panel>
    </Collapse>
  );
}
