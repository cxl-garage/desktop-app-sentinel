import React from 'react';
import { PUBLIC_DOMAIN_PLACEHOLDER_IMAGE } from '../tempMockData';
import IImageWithProcessingStatus from './IImageWithProcessingStatus';

const COUNT = 10;

let uniqueId = 100;

class LoadingImage {
  public id: number;

  public src: string;

  public isProcessing: boolean;

  public processingTimeout: number; // millis

  constructor(src: string) {
    this.id = uniqueId;
    uniqueId += 1;
    this.src = src;
    this.isProcessing = true;
    this.processingTimeout = Math.random() * 5000;
  }
}

const useProcessingImages = (): IImageWithProcessingStatus[] => {
  const [images, setImages] = React.useState<IImageWithProcessingStatus[]>([]);
  React.useEffect(() => {
    setImages(() =>
      [...Array(COUNT)].map(() => {
        const image = new LoadingImage(PUBLIC_DOMAIN_PLACEHOLDER_IMAGE);
        setTimeout(() => {
          setImages((prev) =>
            prev.map((it) =>
              it.id === image.id ? { ...it, isProcessing: false } : it,
            ),
          );
        }, image.processingTimeout);
        return image;
      }),
    );
  }, []);

  return images;
};

export default useProcessingImages;
