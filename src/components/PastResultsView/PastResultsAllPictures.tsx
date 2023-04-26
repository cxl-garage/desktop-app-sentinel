import { Col, Row, Space } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import { Card } from 'components/ui/Card';
import { useNavigate, useParams } from 'react-router-dom';
import { PUBLIC_DOMAIN_PLACEHOLDER_IMAGE } from 'components/RunModelView/tempMockData';
import { CardShadowWrapper } from './PastResultsViewStyledComponents';
import { Button } from '../ui/Button';
import {
  ModelRunImagePreview,
  ModelRunImagePreviewPlaceholder,
} from './ImagePreviews';

const URL = `/past-results/`;

export function PastResultsAllPictures(): JSX.Element {
  const { resultsPath } = useParams();
  const navigate = useNavigate();

  return (
    <CardShadowWrapper className="mb-1 mt-2.5">
      <Card>
        <Space direction="vertical" size="middle">
          <Button icon={<LeftOutlined />} onClick={() => navigate(URL)}>
            Back
          </Button>
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
    </CardShadowWrapper>
  );
}
