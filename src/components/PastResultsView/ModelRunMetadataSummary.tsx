import { Card, Col, Row } from 'antd';
import Paragraph from 'antd/es/typography/Paragraph';
import Text from 'antd/es/typography/Text';

import * as CXLModelResults from 'models/CXLModelResults';
import Title from 'antd/es/typography/Title';
import { CardShadowWrapper } from './PastResultsViewStyledComponents';

type Props = {
  modelRunMetadata: CXLModelResults.T;
};

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
  // Typechecking for Paragraph expects a single child for some reason
  return (
    <Paragraph>
      <>
        <Title level={5} type="secondary">
          {metricName}
        </Title>{' '}
        <Text>{String(formattedMetricValue)}</Text>
      </>
    </Paragraph>
  );
}

function MetricDisplayCard({
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
    <CardShadowWrapper>
      <Card>
        <div className="h-18 text-black">
          <Row gutter={[16, 8]}>
            <Text>{metricName}</Text>
          </Row>
          <Row gutter={[16, 8]}>
            <Title level={3}>{String(formattedMetricValue)}</Title>
          </Row>
        </div>
      </Card>
    </CardShadowWrapper>
  );
}

export function ModelRunMetadataSummary({
  modelRunMetadata,
}: Props): JSX.Element {
  const {
    emptyimagecount,
    imagecount,
    imagedir,
    modelname,
    objectcount,
    resultsdir,
  } = modelRunMetadata;
  return (
    <>
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <MetricDisplayCard
            metricName="Images processed"
            metricValue={imagecount}
          />
        </Col>
        <Col span={8}>
          <MetricDisplayCard
            metricName="Empty images"
            metricValue={emptyimagecount}
          />
        </Col>
        <Col span={8}>
          <MetricDisplayCard
            metricName="Objects found"
            metricValue={objectcount}
          />
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <MetricDisplay metricName="Model name" metricValue={modelname} />
          <MetricDisplay
            metricName="Saved to folder"
            metricValue={resultsdir}
          />
          <MetricDisplay metricName="Images in folder" metricValue={imagedir} />
        </Col>
      </Row>
    </>
  );
}
