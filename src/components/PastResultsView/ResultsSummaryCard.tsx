import { useQuery } from '@tanstack/react-query';
import { Col, Row } from 'antd';
import Paragraph from 'antd/es/typography/Paragraph';
import { Card } from 'components/ui/Card';
import { Image } from 'components/ui/Image';

import * as CXLModelResults from 'models/CXLModelResults';
import styled from 'styled-components';
import { ModelRunMetadataSummary } from './ModelRunMetadataSummary';
import { CardShadowWrapper } from './PastResultsViewStyledComponents';

// Image license details here: https://commons.wikimedia.org/wiki/File:Standing_jaguar.jpg
const PUBLIC_DOMAIN_PLACEHOLDER_IMAGE =
  'https://upload.wikimedia.org/wikipedia/commons/0/0a/Standing_jaguar.jpg';

type Props = {
  modelRunMetadata: CXLModelResults.T;
  imagePathOverride?: string;
};

const MainResultCardWrapper = styled(CardShadowWrapper)`
  margin-top: 10px;
  margin-bottom: 5px;
`;

function ImageGrid({ filePaths }: { filePaths: string[] }): JSX.Element {
  return (
    <Row gutter={16}>
      {filePaths.map((imageFilePath) => (
        <Col span={8} key={imageFilePath}>
          <Image src={imageFilePath} />
        </Col>
      ))}
    </Row>
  );
}

function ModelRunImagePreviewPlaceholder(): JSX.Element {
  const imageFilePaths = Array.from(
    { length: 6 },
    (_value, index: number) =>
      `${PUBLIC_DOMAIN_PLACEHOLDER_IMAGE}?index=${index}`,
  );
  return <ImageGrid filePaths={imageFilePaths} />;
}

function ModelRunImagePreview({
  localPath,
}: {
  localPath: string;
}): JSX.Element {
  const {
    data: files,
    isError,
    error,
  } = useQuery({
    queryFn: () => window.SentinelDesktopService.getFilesInDir(localPath),
    queryKey: ['fetchDir', localPath],
  });
  if (isError) {
    return (
      <Paragraph>
        <>Error loading images: {(error as Error).message}</>
      </Paragraph>
    );
  }
  if (!files) {
    return <div>Loading...</div>;
  }

  const imageFilePaths: string[] = files
    .filter(
      (file: string) =>
        file.endsWith('.jpg') ||
        file.endsWith('.png') ||
        file.endsWith('.jpeg'),
    )
    .map((file: string) => `localfile://${file}`);
  return <ImageGrid filePaths={imageFilePaths.slice(0, 6)} />;
}

export function ResultsSummaryCard({
  modelRunMetadata,
  imagePathOverride,
}: Props): JSX.Element {
  const { rundate } = modelRunMetadata;

  return (
    <MainResultCardWrapper>
      <Card title={rundate.toLocaleDateString('en-US')}>
        <Row gutter={16}>
          <Col span={12}>
            <ModelRunMetadataSummary modelRunMetadata={modelRunMetadata} />
          </Col>
          <Col span={12}>
            {imagePathOverride ? (
              <ModelRunImagePreview localPath={imagePathOverride} />
            ) : (
              <ModelRunImagePreviewPlaceholder />
            )}
          </Col>
        </Row>
      </Card>
    </MainResultCardWrapper>
  );
}
