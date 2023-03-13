import { Col, Input, Row } from 'antd';
import Paragraph from 'antd/es/typography/Paragraph';
import Text from 'antd/es/typography/Text';
import { Card } from 'components/ui/Card';
import { Image } from 'components/ui/Image';

import * as CXLModelResults from 'models/CXLModelResults';
import { useState } from 'react';

// Image license details here: https://commons.wikimedia.org/wiki/File:Standing_jaguar.jpg
const PUBLIC_DOMAIN_PLACEHOLDER_IMAGE =
  'https://upload.wikimedia.org/wikipedia/commons/0/0a/Standing_jaguar.jpg';

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
        <Text strong>{metricName}:</Text> {formattedMetricValue}
      </>
    </Paragraph>
  );
}

function ModelRunMetadataSummary({ modelRunMetadata }: Props): JSX.Element {
  const {
    emptyimagecount,
    imagecount,
    imagedir,
    modelname,
    objectcount,
    rundate,
    runid,
    resultsdir,
  } = modelRunMetadata;
  return (
    <Card>
      <MetricDisplay metricName="Model Name" metricValue={modelname} />
      <MetricDisplay metricName="Run ID" metricValue={runid} />
      <MetricDisplay metricName="Run Date" metricValue={rundate} />
      <MetricDisplay metricName="Image Directory" metricValue={imagedir} />
      <MetricDisplay metricName="Results Directory" metricValue={resultsdir} />
      <MetricDisplay metricName="Image Count" metricValue={imagecount} />
      <MetricDisplay
        metricName="Empty Image Count"
        metricValue={emptyimagecount}
      />
      <MetricDisplay metricName="Object Count" metricValue={objectcount} />
    </Card>
  );
}

function ModelRunImagePreview({
  localPath,
}: {
  localPath?: string;
}): JSX.Element {
  const imageIds = [1, 2, 3, 4, 5, 6];
  return (
    <Row gutter={[16, 16]}>
      {imageIds.map((imageId) => (
        <Col span={8} key={imageId}>
          <Image src={localPath || PUBLIC_DOMAIN_PLACEHOLDER_IMAGE} />
        </Col>
      ))}
    </Row>
  );
}

export function ResultsSummaryCard({ modelRunMetadata }: Props): JSX.Element {
  const { rundate } = modelRunMetadata;
  const [localPath, setLocalPath] = useState('');

  const handlePathInput = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    setLocalPath(event.target.value);
  };

  return (
    <Card title={rundate.toLocaleDateString('en-US')}>
      {/* Temporary local path loader until we have paginated directory filename endpoint */}
      <Input
        placeholder="Proof-of-concept local path loader"
        onChange={handlePathInput}
      />
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <ModelRunMetadataSummary modelRunMetadata={modelRunMetadata} />
        </Col>
        <Col span={12}>
          <ModelRunImagePreview
            localPath={localPath ? `localfile:////${localPath}` : ''}
          />
        </Col>
      </Row>
    </Card>
  );
}
