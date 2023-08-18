import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UseMutationResult } from '@tanstack/react-query/src/types';
import { invalidateInstalledTensorflowImage } from './useInstalledTensorflowImage';

const useInstallTensorflowImage = (): UseMutationResult<void, Error, void> => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: () => window.SentinelDesktopService.pullImage(),
    onSettled: () => {
      invalidateInstalledTensorflowImage(queryClient);
    },
  });
};

export default useInstallTensorflowImage;
