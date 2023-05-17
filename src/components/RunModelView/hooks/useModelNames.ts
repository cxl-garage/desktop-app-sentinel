import { useQuery, UseQueryResult } from '@tanstack/react-query';

const useModelNames = (): UseQueryResult<string[], Error> => {
  const queryInfo = useQuery<string[], Error>({
    queryKey: ['modelNames'],
    queryFn: async () => {
      return window.SentinelDesktopService.getModelNames();
    },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
  return queryInfo;
};

export default useModelNames;
