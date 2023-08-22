import { QueryClient, useQuery } from '@tanstack/react-query';
import { UseQueryResult } from '@tanstack/react-query/build/lib/types';
import * as DockerImage from '../../../models/DockerImage';

const QUERY_KEY = ['docker', 'findImage'];

const useInstalledTensorflowImage = (): UseQueryResult<
  DockerImage.T | undefined,
  Error
> => {
  return useQuery<DockerImage.T | undefined, Error>({
    queryFn: () => window.SentinelDesktopService.findImage(),
    queryKey: QUERY_KEY,
  });
};

export const invalidateInstalledTensorflowImage = (
  queryClient: QueryClient,
): Promise<void> => {
  return queryClient.invalidateQueries(QUERY_KEY);
};

export default useInstalledTensorflowImage;
