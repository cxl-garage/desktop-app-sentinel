import { useQuery, UseQueryResult } from '@tanstack/react-query';
import * as ModelRunProgress from '../../../models/ModelRunProgress';
import useIsModelRunInProgress from './useIsModelRunInProgress';

const useCurrentModelRunProgress = (): UseQueryResult<
  ModelRunProgress.T | null,
  Error
> => {
  const { data: isModelRunInProgress } = useIsModelRunInProgress();
  return useQuery<ModelRunProgress.T | null, Error>({
    queryKey: ['currentModelRunProgress'],
    queryFn: () => {
      return window.SentinelDesktopService.getCurrentModelRunProgress();
    },
    enabled: !!isModelRunInProgress,
    refetchInterval: 1000,
  });
};

export default useCurrentModelRunProgress;
