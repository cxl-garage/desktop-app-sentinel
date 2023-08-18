import { CheckSquareFilled, CloseSquareFilled } from '@ant-design/icons';
import { Col, Row, Typography } from 'antd';
import React from 'react';
import * as DockerImage from '../../../models/DockerImage';

interface IProps {
  image: DockerImage.T | undefined;
}

function PanelHeader({ image }: IProps): JSX.Element {
  return (
    <Row gutter={[12, 0]}>
      <Col>
        {image ? (
          <CheckSquareFilled className="text-2xl text-green-700" />
        ) : (
          <CloseSquareFilled className="text-2xl text-red-700" />
        )}
      </Col>
      <Col flex="auto">
        <Typography>
          {image
            ? 'Successfully detected Tensorflow Docker image installed'
            : 'Unable to detect installed Tensorflow Docker image'}
        </Typography>
      </Col>
    </Row>
  );
}

export default PanelHeader;
