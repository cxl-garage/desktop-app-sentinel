import useIsDockerMissing from './useIsDockerMissing';
import useIsTensorflowImageMissing from './useIsTensorflowImageMissing';

const useIsDependenciesMissing = (): {
  isDependenciesMissing: boolean;
  isLoading: boolean;
  error: Error | null;
} => {
  const {
    isDockerMissing,
    isLoading: isDockerMissingCheckLoading,
    error: dockerMissingCheckError,
  } = useIsDockerMissing();
  const {
    isTensorflowImageMissing,
    isLoading: isTensorflowImageMissingCheckLoading,
    error: tensorflowImageMissingCheckError,
  } = useIsTensorflowImageMissing();
  return {
    isDependenciesMissing: isDockerMissing || isTensorflowImageMissing,
    isLoading:
      isDockerMissingCheckLoading || isTensorflowImageMissingCheckLoading,
    error: dockerMissingCheckError ?? tensorflowImageMissingCheckError,
  };
};

export default useIsDependenciesMissing;
