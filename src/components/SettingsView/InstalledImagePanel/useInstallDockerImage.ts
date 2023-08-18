import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UseMutationResult } from '@tanstack/react-query/src/types';
import { invalidateInstalledDockerImage } from './useInstalledDockerImage';

const useInstallDockerImage = (): UseMutationResult<void, Error, void> => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: () => window.SentinelDesktopService.pullImage(),
    onSettled: () => {
      invalidateInstalledDockerImage(queryClient);
    },
  });
};

export default useInstallDockerImage;
