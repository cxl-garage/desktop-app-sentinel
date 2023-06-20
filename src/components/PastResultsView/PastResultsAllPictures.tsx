import { Space } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import PaginatedImageGrid from 'components/ui/PaginatedImageGrid';
import EImageGridSize from 'components/ui/PaginatedImageGrid/EImageGridSize';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../ui/Button';

const URL = `/past-results/`;

export function PastResultsAllPictures(): JSX.Element {
  const { modelId } = useParams();
  const navigate = useNavigate();

  const { data: files } = useQuery({
    queryFn: () =>
      window.SentinelDesktopService.getModelOutputs(parseInt(modelId!, 10)),
    queryKey: ['getModelOutputs', modelId],
  });

  return (
    <Space direction="vertical" size="middle" className="mx-8 my-4">
      <Button
        size="large"
        icon={<LeftOutlined />}
        onClick={() => navigate(URL)}
        type="text"
      >
        Back
      </Button>
      <PaginatedImageGrid
        imageSources={files?.map((path) => `localfile://${path}`) ?? []}
        inProgressItems={[]}
        gridSize={EImageGridSize.DEFAULT}
      />
    </Space>
  );
}
