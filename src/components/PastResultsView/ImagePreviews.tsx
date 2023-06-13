import { useQuery } from '@tanstack/react-query';
import { Col, Row } from 'antd';
import Paragraph from 'antd/es/typography/Paragraph';
import { Image } from 'components/ui/Image';
// Image license details here: https://commons.wikimedia.org/wiki/File:Standing_jaguar.jpg
const PUBLIC_DOMAIN_PLACEHOLDER_IMAGE =
  'https://upload.wikimedia.org/wikipedia/commons/0/0a/Standing_jaguar.jpg';

export function ImageGrid({
  filePaths,
  imagesPerRow,
}: {
  filePaths: string[];
  imagesPerRow?: number;
}): JSX.Element {
  // Grid width is 24 cells, define span to get desired row width
  const span = Math.round(24 / (imagesPerRow ?? 3));
  return (
    <Row gutter={16}>
      {filePaths.map((imageFilePath) => (
        <Col span={span} key={imageFilePath}>
          <Image src={imageFilePath} />
        </Col>
      ))}
    </Row>
  );
}

export function ModelRunImagePreviewPlaceholder({
  count,
  imagesPerRow,
}: {
  count: number;
  imagesPerRow?: number;
}): JSX.Element {
  const imageFilePaths = Array.from(
    { length: count },
    (_value, index: number) =>
      `${PUBLIC_DOMAIN_PLACEHOLDER_IMAGE}?index=${index}`,
  );
  return <ImageGrid filePaths={imageFilePaths} imagesPerRow={imagesPerRow} />;
}

// TODO: Paginate
export function ModelRunImagePreview({
  modelId,
  count,
  imagesPerRow,
}: {
  modelId: number;
  count?: number;
  imagesPerRow?: number;
}): JSX.Element {
  const {
    data: files,
    isError,
    error,
  } = useQuery({
    queryFn: () => window.SentinelDesktopService.getModelOutputs(modelId),
    queryKey: ['getModelOutputs', modelId],
  });
  if (isError) {
    return (
      <Paragraph>
        {error instanceof Error
          ? `Error loading images: ${error.message}`
          : `Error loading images`}
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
  return (
    <ImageGrid
      filePaths={imageFilePaths.slice(0, count)}
      imagesPerRow={imagesPerRow}
    />
  );
}
