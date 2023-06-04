import LRUCache from 'lru-cache';
import { useEffect } from 'react';

interface IProps {
  imageSources: string[];
}

const images = new LRUCache<string, any>({ max: 1000 });

const preloadImage = (src: string): void => {
  if (images.has(src)) {
    return;
  }
  const img = new Image();
  images.set(src, img);
  img.src = src;
  // img.onload = () => {
  //   console.log(`finish loading ${src}`);
  // };
  // img.onerror = () => {
  //   console.log(`error loading ${src}`);
  // };
};

const usePreloadImage = ({ imageSources }: IProps): void => {
  useEffect(() => {
    imageSources.forEach(preloadImage);
  }, [imageSources]);
};

export default usePreloadImage;
