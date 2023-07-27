import { useQuery } from '@tanstack/react-query';
import { Col, Row } from 'antd';
import Link from 'antd/es/typography/Link';
import Paragraph from 'antd/es/typography/Paragraph';
import { ImageGridImage } from 'components/ui/PaginatedImageGrid/ImageGridImage';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import ErrorSummary from './ErrorSummary';

function ImageGrid({
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
          <ImageGridImage src={imageFilePath} />
        </Col>
      ))}
    </Row>
  );
}

function SkeletonImageGrid({
  numImages,
  imagesPerRow,
}: {
  numImages: number;
  imagesPerRow?: number;
}): JSX.Element {
  // Grid width is 24 cells, define span to get desired row width className="h-40 w-40 px-1.5"
  const span = Math.round(24 / (imagesPerRow ?? 3));
  return (
    <Row gutter={16}>
      {Array.from(Array(numImages)).map((_, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <Col span={span} key={index}>
          <div className="animate-pulse">
            <ImageGridImage src="placeholder" placeholder />
          </div>
        </Col>
      ))}
    </Row>
  );
}

export function ModelRunImagePreviewPlaceholderSection({
  count,
  imagesPerRow,
  delay,
}: {
  count: number;
  imagesPerRow?: number;
  delay?: number;
}): JSX.Element {
  const [isShown, setIsShown] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsShown(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  // Don't immediately render to help avoid
  // flicker when load is fast
  if (!isShown) {
    return <div />;
  }

  return (
    <Row>
      <SkeletonImageGrid numImages={count} imagesPerRow={imagesPerRow} />
    </Row>
  );
}

export function ModelRunImagePreviewSection({
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
  const navigate = useNavigate();
  const url = `/past-results/${encodeURIComponent(modelId)}`;
  if (isError) {
    if (error instanceof Error) {
      return <ErrorSummary error={error} />;
    }
    return (
      <Paragraph>
        Something unexpected has occurred, please try reopening this page. If
        the issue persists, contact CXL or file an issue on github:
        <Link
          href="https://github.com/cxl-garage/desktop-app-sentinel/issues"
          target="_blank"
        >
          https://github.com/cxl-garage/desktop-app-sentinel/issues
        </Link>
      </Paragraph>
    );
  }
  if (!files) {
    return (
      <ModelRunImagePreviewPlaceholderSection
        count={count || 6}
        imagesPerRow={imagesPerRow}
        delay={300}
      />
    );
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
    <>
      <Row>
        <ImageGrid
          filePaths={imageFilePaths.slice(0, count)}
          imagesPerRow={imagesPerRow}
        />
      </Row>
      <Row>
        <div className="ml-auto">
          <Button size="large" type="text" onClick={() => navigate(url)}>
            View all images
          </Button>
        </div>
      </Row>
    </>
  );
}
