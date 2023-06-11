import { useQuery, UseQueryResult } from '@tanstack/react-query';
import * as ModelRunProgress from '../../../models/ModelRunProgress';

const useCurrentModelRunProgress = (): UseQueryResult<
  ModelRunProgress.T | null,
  Error
> => {
  return useQuery<ModelRunProgress.T | null, Error>({
    queryKey: ['currentModelRunProgress'],
    queryFn: () => {
      return window.SentinelDesktopService.getCurrentModelRunProgress();
    },
    refetchInterval: 1000,
  });
};

export default useCurrentModelRunProgress;
