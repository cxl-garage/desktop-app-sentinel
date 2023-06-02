import { Col, Row } from 'antd';
import { Card } from 'components/ui/Card';

import { useNavigate } from 'react-router-dom';
import { getDateFromTimestamp } from 'main/SentinelDesktopService/helpers';
import { ModelRun } from '../../generated/prisma/client';
import { ModelRunMetadataSummary } from './ModelRunMetadataSummary';
import { CardShadowWrapper } from './PastResultsViewStyledComponents';
import { Button } from '../ui/Button';
import {
  ModelRunImagePreview,
  ModelRunImagePreviewPlaceholder,
} from './ImagePreviews';

type Props = {
  modelRunMetadata: ModelRun;
  imagePathOverride?: string;
};

export function ResultsSummaryCard({
  modelRunMetadata,
  imagePathOverride,
}: Props): JSX.Element {
  const { startTime, outputPath } = modelRunMetadata;
  const outputPathToUse = imagePathOverride ?? outputPath;
  const navigate = useNavigate();
  const url = `/past-results/${encodeURIComponent(outputPathToUse)}`;

  const runStartDate = getDateFromTimestamp(startTime, 's');

  return (
    <CardShadowWrapper className="my-4">
      <Card title={runStartDate.toLocaleDateString('en-US')}>
        <Row gutter={16}>
          <Col span={12}>
            <ModelRunMetadataSummary modelRunMetadata={modelRunMetadata} />
          </Col>
          <Col span={12}>
            <Row>
              {outputPathToUse ? (
                <ModelRunImagePreview localPath={outputPathToUse} count={6} />
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
