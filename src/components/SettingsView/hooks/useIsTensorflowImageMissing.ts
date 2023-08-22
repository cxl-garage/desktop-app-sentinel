import useInstalledTensorflowImage from './useInstalledTensorflowImage';

const useIsTensorflowImageMissing = (): {
  isTensorflowImageMissing: boolean;
  isLoading: boolean;
  error: Error | null;
} => {
  const {
    data: tensorflowImage,
    isLoading,
    error,
  } = useInstalledTensorflowImage();
  return {
    isTensorflowImageMissing: !isLoading && !tensorflowImage,
    isLoading,
    error,
  };
};

export default useIsTensorflowImageMissing;
