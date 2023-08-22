import { Typography } from 'antd';
import React from 'react';
import * as DockerImage from '../../../models/DockerImage';

interface IProps {
  image: DockerImage.T;
}

function ImageInfo({ image }: IProps): JSX.Element {
  return (
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
  );
}

export default ImageInfo;
