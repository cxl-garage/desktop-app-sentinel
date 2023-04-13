import { useQuery } from '@tanstack/react-query';
import { Col, Row } from 'antd';
import Paragraph from 'antd/es/typography/Paragraph';
import { Image } from 'components/ui/Image';
// Image license details here: https://commons.wikimedia.org/wiki/File:Standing_jaguar.jpg
const PUBLIC_DOMAIN_PLACEHOLDER_IMAGE =
  'https://upload.wikimedia.org/wikipedia/commons/0/0a/Standing_jaguar.jpg';

export function ImageGrid({ filePaths }: { filePaths: string[] }): JSX.Element {
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

export function ModelRunImagePreviewPlaceholder({
  count,
}: {
  count: number;
}): JSX.Element {
  const imageFilePaths = Array.from(
    { length: count },
    (_value, index: number) =>
      `${PUBLIC_DOMAIN_PLACEHOLDER_IMAGE}?index=${index}`,
  );
  return <ImageGrid filePaths={imageFilePaths} />;
}

export function ModelRunImagePreview({
  localPath,
  count,
}: {
  localPath: string;
  count?: number;
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
  return <ImageGrid filePaths={imageFilePaths.slice(0, count)} />;
}
