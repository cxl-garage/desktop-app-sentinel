import { useQuery, UseQueryResult } from '@tanstack/react-query';

interface IProps {
  directory: string | null;
  refetchInterval?: number; // ms
}

const useImagesInDirectory = ({
  directory,
  refetchInterval,
}: IProps): UseQueryResult<string[], Error> => {
  const queryInfo = useQuery<string[], Error>({
    queryKey: ['imagesInDirectory', directory],
    queryFn: () => {
      return window.SentinelDesktopService.getFilesInDir(directory!);
    },
    enabled: !!directory,
    refetchInterval,
  });
  return queryInfo;
};

export default useImagesInDirectory;
