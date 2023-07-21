import { Col, Row } from 'antd';
import { Card } from 'components/ui/Card';

import { getDateFromTimestamp } from 'main/SentinelDesktopService/helpers';
import { ModelRun } from '../../generated/prisma/client';
import { ModelRunMetadataSummary } from './ModelRunMetadataSummary';
import { CardShadowWrapper } from './PastResultsViewStyledComponents';
import {
  ModelRunImagePreviewSection,
  ModelRunImagePreviewPlaceholderSection,
} from './ImagePreviews';

type Props = {
  modelRunMetadata: ModelRun;
};

export function ResultsSummaryCard({ modelRunMetadata }: Props): JSX.Element {
  const { startTime, id: modelId } = modelRunMetadata;
  const runStartDate = getDateFromTimestamp(startTime, 's');

  return (
    <CardShadowWrapper className="my-4">
      <Card title={runStartDate.toLocaleDateString('en-US')}>
        <Row gutter={16}>
          <Col span={12}>
            <ModelRunMetadataSummary modelRunMetadata={modelRunMetadata} />
          </Col>
          <Col span={12}>
            {modelId ? (
              <ModelRunImagePreviewSection modelId={modelId} count={6} />
            ) : (
              <ModelRunImagePreviewPlaceholderSection count={6} />
            )}
          </Col>
        </Row>
      </Card>
    </CardShadowWrapper>
  );
}
