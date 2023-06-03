import { useEffect } from 'react';

interface IProps {
  imageSources: string[];
}

const images = new Set<string>();
const preloadImage = (src: string): void => {
  if (images.has(src)) {
    return;
  }
  images.add(src);
  const img = new Image();
  img.src = src;
};

const usePreloadImage = ({ imageSources }: IProps): void => {
  useEffect(() => {
    imageSources.forEach(preloadImage);
  }, [imageSources]);
};

export default usePreloadImage;
