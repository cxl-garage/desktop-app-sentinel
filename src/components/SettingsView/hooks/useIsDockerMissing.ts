import * as DockerVersion from '../../../models/DockerVersion';
import useDockerVersion from './useDockerVersion';

const useIsDockerMissing = (): {
  isDockerMissing: boolean;
  isLoading: boolean;
  error: Error | null;
} => {
  const { data: version, isLoading, error } = useDockerVersion();
  return {
    isDockerMissing: !!version && DockerVersion.isDockerError(version),
    isLoading,
    error,
  };
};

export default useIsDockerMissing;
