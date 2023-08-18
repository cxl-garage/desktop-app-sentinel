import { QueryClient, useQuery } from '@tanstack/react-query';
import { UseQueryResult } from '@tanstack/react-query/build/lib/types';
import * as DockerImage from '../../../models/DockerImage';

const QUERY_KEY = ['docker', 'findImage'];

const useInstalledDockerImage = (): UseQueryResult<
  DockerImage.T | undefined,
  Error
> => {
  return useQuery<DockerImage.T | undefined, Error>({
    queryFn: () => window.SentinelDesktopService.findImage(),
    queryKey: QUERY_KEY,
  });
};

export const invalidateInstalledDockerImage = (
  queryClient: QueryClient,
): Promise<void> => {
  return queryClient.invalidateQueries(QUERY_KEY);
};

export default useInstalledDockerImage;
