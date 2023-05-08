import { Col, Row } from 'antd';
import { Card } from 'components/ui/Card';

import * as CXLModelResults from 'models/CXLModelResults';
import { useNavigate } from 'react-router-dom';
import { PUBLIC_DOMAIN_PLACEHOLDER_IMAGE } from 'components/RunModelView/tempMockData';
import { ModelRunMetadataSummary } from './ModelRunMetadataSummary';
import { CardShadowWrapper } from './PastResultsViewStyledComponents';
import { Button } from '../ui/Button';
import {
  ModelRunImagePreview,
  ModelRunImagePreviewPlaceholder,
} from './ImagePreviews';

type Props = {
  modelRunMetadata: CXLModelResults.T;
  imagePathOverride?: string;
};

export function ResultsSummaryCard({
  modelRunMetadata,
  imagePathOverride,
}: Props): JSX.Element {
  const navigate = useNavigate();
  const url = `/past-results/${encodeURIComponent(
    imagePathOverride && imagePathOverride.length
      ? imagePathOverride
      : PUBLIC_DOMAIN_PLACEHOLDER_IMAGE,
  )}`;
  const { rundate } = modelRunMetadata;

  return (
    <CardShadowWrapper className="my-4">
      <Card title={rundate.toLocaleDateString('en-US')}>
        <Row gutter={16}>
          <Col span={12}>
            <ModelRunMetadataSummary modelRunMetadata={modelRunMetadata} />
          </Col>
          <Col span={12}>
            <Row>
              {imagePathOverride ? (
                <ModelRunImagePreview localPath={imagePathOverride} count={6} />
              ) : (
                <ModelRunImagePreviewPlaceholder count={6} />
              )}
            </Row>
            <Row>
              <div className="ml-auto">
                <Button size="large" type="text" onClick={() => navigate(url)}>
                  View all images
                </Button>
              </div>
            </Row>
          </Col>
        </Row>
      </Card>
    </CardShadowWrapper>
  );
}
