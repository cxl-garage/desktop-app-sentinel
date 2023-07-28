import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button, Collapse, Typography, Row, Col } from 'antd';
import {
  CaretLeftOutlined,
  CheckSquareFilled,
  CloseSquareFilled,
} from '@ant-design/icons';

export function InstalledImagePanel(): JSX.Element {
  const { data: image } = useQuery({
    queryFn: () => window.SentinelDesktopService.findImage(),
    queryKey: ['docker', 'findImage'],
  });

  function imageHeader(): React.ReactNode {
    return (
      <div>
        {image && (
          <Row gutter={[12, 0]}>
            <Col>
              <CheckSquareFilled className="text-2xl text-green-700" />
            </Col>
            <Col flex="auto">
              <Typography>
                Successfully detected Tensorflow Docker image installed
              </Typography>
            </Col>
          </Row>
        )}
        {!image && (
          <Row gutter={[12, 0]}>
            <Col>
              <CloseSquareFilled className="text-2xl text-red-700" />
            </Col>
            <Col flex="auto">
              <Typography>
                Unable to detect installed Tensorflow Docker image
              </Typography>
            </Col>
          </Row>
        )}
      </div>
    );
  }

  function imagePanel(): React.ReactNode {
    return (
      <div>
        {image && (
          <div>
            <Typography.Paragraph>
              <Typography.Text strong>Id: </Typography.Text>
              <Typography.Text>{image.id}</Typography.Text>
            </Typography.Paragraph>
            <Typography.Paragraph>
              <Typography.Text strong>Name: </Typography.Text>
              <Typography.Text>{image.name}</Typography.Text>
            </Typography.Paragraph>
            <Typography.Paragraph>
              <Typography.Text strong>Created: </Typography.Text>
              <Typography.Text>
                {new Date(image.created * 1000).toISOString()}
              </Typography.Text>
            </Typography.Paragraph>
          </div>
        )}
        {!image && (
          <Button onClick={() => window.SentinelDesktopService.pullImage()}>
            Install
          </Button>
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
      <Collapse.Panel key="docker" header={imageHeader()}>
        {imagePanel()}
      </Collapse.Panel>
    </Collapse>
  );
}
