import { useQuery } from '@tanstack/react-query';
import { UseQueryResult } from '@tanstack/react-query/build/lib/types';
import * as DockerVersion from '../../../models/DockerVersion';

const useDockerVersion = (): UseQueryResult<DockerVersion.T, Error> => {
  return useQuery<DockerVersion.T, Error>({
    queryFn: () => window.SentinelDesktopService.getVersion(),
    queryKey: ['docker', 'getVersion'],
  });
};

export default useDockerVersion;
