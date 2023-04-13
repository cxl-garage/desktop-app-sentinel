import { Col, Row, Space } from 'antd';
import { Card } from 'components/ui/Card';

import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import { PUBLIC_DOMAIN_PLACEHOLDER_IMAGE } from 'components/RunModelView/tempMockData';
import { CardShadowWrapper } from './PastResultsViewStyledComponents';
import { Button } from '../ui/Button';
import {
  ModelRunImagePreview,
  ModelRunImagePreviewPlaceholder,
} from './ImagePreviews';

const MainResultCardWrapper = styled(CardShadowWrapper)`
  margin-top: 10px;
  margin-bottom: 5px;
`;

export function PastResultsAllPictures(): JSX.Element {
  const { resultsPath } = useParams();
  const navigate = useNavigate();
  const url = `/past-results/`;

  return (
    <MainResultCardWrapper>
      <Card>
        <Space direction="vertical" size="middle">
          <Button onClick={() => navigate(url)}>{'<'} Back</Button>
          <Row gutter={16}>
            <Col span={24}>
              {resultsPath &&
              resultsPath !== PUBLIC_DOMAIN_PLACEHOLDER_IMAGE ? (
                <ModelRunImagePreview localPath={resultsPath} />
              ) : (
                <ModelRunImagePreviewPlaceholder count={20} />
              )}
            </Col>
          </Row>
        </Space>
      </Card>
    </MainResultCardWrapper>
  );
}
