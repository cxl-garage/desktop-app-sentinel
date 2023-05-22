import { useQuery, UseQueryResult } from '@tanstack/react-query';

const useIsModelRunInProgress = (): UseQueryResult<boolean, Error> => {
  const queryInfo = useQuery<boolean, Error>({
    queryKey: ['useIsModelRunInProgress'],
    queryFn: () => {
      return window.SentinelDesktopService.getIsModelRunInProgress();
    },
    refetchInterval: 1000,
  });
  return queryInfo;
};

export default useIsModelRunInProgress;
