import { UseQueryResult } from '@tanstack/react-query';
import useCurrentModelRunProgress from './useCurrentModelRunProgress';
import useImagesInDirectory from './useImagesInDirectory';

const useOutputImages = (): UseQueryResult<string[], Error> => {
  const { data: currentModelRunProgress } = useCurrentModelRunProgress();
  return useImagesInDirectory({
    directory:
      currentModelRunProgress?.startModelOptions.outputDirectory ?? null,
    refetchInterval: 1000,
  });
};

export default useOutputImages;
