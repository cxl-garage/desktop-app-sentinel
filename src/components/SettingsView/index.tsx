import React from 'react';
import { Button, Table, Typography } from 'antd';
import type { ImageInfo, ContainerInfo } from 'dockerode';

export function SettingsView(): JSX.Element {
  const [images, setImages] = React.useState<readonly ImageInfo[]>([]);
  const [containers, setContainers] = React.useState<readonly ContainerInfo[]>(
    [],
  );

  const start = (): void => {
    // TODO: Should get from API.
    const folder = './data';
    const modelName = 'osa_jaguar';
    window.SentinelDesktopService.startModel(folder, modelName);
  };

  const stopAll = (): void => {
    window.SentinelDesktopService.cleanup();
  };

  async function updateImages(): Promise<void> {
    setImages(await window.SentinelDesktopService.getImages());
  }

  async function updateContainers(): Promise<void> {
    setContainers(await window.SentinelDesktopService.getContainers());
  }

  function refresh(): void {
    updateImages();
    updateContainers();
  }

  return (
    <div className="pt-6 pb-12 pl-6 pr-6">
      <div className="pb-6">
        <Button type="primary" onClick={() => refresh()}>
          Refresh
        </Button>
      </div>
      <div className="pb-6">
        <Typography.Title level={3}>Docker Images</Typography.Title>
        <Table
          columns={[
            {
              title: 'Id',
              dataIndex: 'Id',
              key: 'id',
            },
            {
              title: 'Tags',
              dataIndex: 'RepoTags',
              key: 'tags',
            },
          ]}
          dataSource={images}
          pagination={false}
        />
      </div>
      <div className="pb-6">
        <Typography.Title level={3}>Docker Containers</Typography.Title>
        <Table
          columns={[
            {
              title: 'Id',
              dataIndex: 'Id',
              key: 'id',
            },
            {
              title: 'Image',
              dataIndex: 'ImageID',
              key: 'image',
            },
            {
              title: 'Names',
              dataIndex: 'Names',
              key: 'names',
            },
            {
              title: 'State',
              dataIndex: 'State',
              key: 'state',
            },
            {
              title: 'Status',
              dataIndex: 'Status',
              key: 'status',
            },
          ]}
          dataSource={containers}
          pagination={false}
        />
        <Button type="primary" onClick={stopAll}>
          Stop All
        </Button>
      </div>

      <div className="pb-6">
        <Typography.Title level={3}>Test Run</Typography.Title>
        <Button type="primary" onClick={start}>
          Start Test Run
        </Button>
      </div>
    </div>
  );
}
