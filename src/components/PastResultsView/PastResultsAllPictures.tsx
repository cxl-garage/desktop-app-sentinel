import { Col, Row, Space } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { PUBLIC_DOMAIN_PLACEHOLDER_IMAGE } from 'components/RunModelView/tempMockData';
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
    <Space direction="vertical" size="middle" className="mx-8 my-4">
      {/* Vertical alignment needed becase icon by default
              sits too low and looks awkward visually. */}
      <Button
        size="large"
        icon={<LeftOutlined className="align-[1px]" />}
        onClick={() => navigate(URL)}
        type="text"
      >
        Back
      </Button>
      <Row gutter={16}>
        <Col span={24}>
          {resultsPath && resultsPath !== PUBLIC_DOMAIN_PLACEHOLDER_IMAGE ? (
            <ModelRunImagePreview localPath={resultsPath} imagesPerRow={4} />
          ) : (
            <ModelRunImagePreviewPlaceholder count={20} imagesPerRow={4} />
          )}
        </Col>
      </Row>
    </Space>
  );
}
