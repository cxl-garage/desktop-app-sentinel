import { Card, Col, Row, Space, Tag } from 'antd';
import Text from 'antd/es/typography/Text';

import Title from 'antd/es/typography/Title';
import { useModelRun } from './ModelRunContext/ModelRunContext';
import { CardShadowWrapper } from './PastResultsViewStyledComponents';

function MetricDisplay({
  metricName,
  metricValue,
}: {
  metricName: string;
  metricValue: string | number | Date;
}): JSX.Element {
  let formattedMetricValue = metricValue;
  if (metricValue instanceof Date) {
    formattedMetricValue = metricValue.toLocaleString('en-US');
  }
  return (
    <Row gutter={16}>
      <Col span={12}>
        <Title level={5} type="secondary">
          {metricName}
        </Title>{' '}
      </Col>
      <Col span={12}>
        <Text>{String(formattedMetricValue)}</Text>
      </Col>
    </Row>
  );
}

function MetricDisplayCard({
  metricName,
  metricValue,
  highlightText,
}: {
  metricName: string;
  metricValue: string | number | Date;
  highlightText?: string;
}): JSX.Element {
  let formattedMetricValue = metricValue;
  if (metricValue instanceof Date) {
    formattedMetricValue = metricValue.toLocaleString('en-US');
  }
  return (
    <CardShadowWrapper className="h-28">
      <Card
        bodyStyle={{ padding: '10px', height: '100%' }}
        style={{ height: '100%' }}
      >
        <Row>
          <Text>{metricName}</Text>
        </Row>
        <Row className="maxh-3">
          <Col flex="auto" className="h-10 text-right">
            <Title level={1}>{String(formattedMetricValue)}</Title>
          </Col>
        </Row>
        {highlightText && (
          <Row className="mt-1">
            <Col flex="auto" className="mx-0 text-right">
              <Tag color="blue" className="mx-0" style={{ margin: '0px' }}>
                {highlightText}
              </Tag>
            </Col>
          </Row>
        )}
      </Card>
    </CardShadowWrapper>
  );
}

function toPercentageStr(
  numerator: number,
  denominator: number,
): string | undefined {
  return denominator > 0
    ? `${((numerator / denominator) * 100).toFixed(2)}%`
    : undefined;
}

export function ModelRunMetadataSummary(): JSX.Element {
  const { modelRun } = useModelRun();
  const {
    emptyImageCount,
    imageCount,
    detectedObjectCount,
    outputPath,
    modelName,
  } = modelRun;
  return (
    <>
      <Row gutter={[16, 0]}>
        <Col span={8}>
          <MetricDisplayCard
            metricName="Images processed"
            metricValue={imageCount}
          />
        </Col>
        <Col span={8}>
          <MetricDisplayCard
            metricName="Empty images"
            metricValue={emptyImageCount}
            highlightText={toPercentageStr(emptyImageCount, imageCount)}
          />
        </Col>
        <Col span={8}>
          <MetricDisplayCard
            metricName="Objects found"
            metricValue={detectedObjectCount}
            highlightText={toPercentageStr(detectedObjectCount, imageCount)}
          />
        </Col>
      </Row>
      <Row gutter={16} className="mt-4">
        <Col span={24}>
          <Space direction="vertical">
            <MetricDisplay metricName="Model name" metricValue={modelName} />
            <MetricDisplay
              metricName="Saved to folder"
              metricValue={outputPath}
            />
            <MetricDisplay
              metricName="Images in folder"
              metricValue={outputPath}
            />
          </Space>
        </Col>
      </Row>
    </>
  );
}
