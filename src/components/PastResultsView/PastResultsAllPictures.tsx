import { Col, Row, Space } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../ui/Button';
import {
  ModelRunImagePreview,
  ModelRunImagePreviewPlaceholder,
} from './ImagePreviews';

const URL = `/past-results/`;

export function PastResultsAllPictures(): JSX.Element {
  const { modelId } = useParams();
  const navigate = useNavigate();

  return (
    <Space direction="vertical" size="middle" className="mx-8 my-4">
      <Button
        size="large"
        icon={<LeftOutlined />}
        onClick={() => navigate(URL)}
        type="text"
      >
        Back
      </Button>
      <Row gutter={16}>
        <Col span={24}>
          {modelId ? (
            // TODO: Paginate image preview page to allow removal of count cap
            <ModelRunImagePreview
              modelId={parseInt(modelId, 10)}
              imagesPerRow={4}
              count={100}
            />
          ) : (
            <ModelRunImagePreviewPlaceholder count={20} imagesPerRow={4} />
          )}
        </Col>
      </Row>
    </Space>
  );
}
