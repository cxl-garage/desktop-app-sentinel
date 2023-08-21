/**
 * Functions to invoke the docker container to detect features
 * in an image.
 */
import path from 'path';
import fs from 'fs';
import assertUnreachable from '../../util/assertUnreachable';
import { save, getOverlay, Image } from './image';

export type OutputStyle = 'class' | 'hierarchy' | 'flat' | 'none';
export type DetectOptions = {
  inputSize: number;
  threshold?: number;
  modelName: string;
  classNames: Map<number, string>;
  outputFolder: string;
  outputStyle: OutputStyle;
};
export type DetectionCountMetadata = {
  imagesInspectedCount: number;
  detectedObjectCount: number;
  emptyImageCount: number;
};

// The coordinates are in the form: [x upper-left, y upper-left, x bottom-right, y bottom-right]
export type BoundingBox = [number, number, number, number];

export type DetectionResult = {
  fileName: string;
  className: string;
  classId: number;
  confidence: number;
  inputPath: string;
  bbox: BoundingBox;
  outputPath: string;
};

export const EMPTY_IMAGE_CLASS = 'blank';
export const DEFAULT_THRESHOLD = 0.4;
const LINE_WIDTH = 3;

export function getOutputPath(
  inputFolder: string,
  inputPath: string,
  outputFolder: string,
  outputStyle: OutputStyle,
  className: string,
): string {
  switch (outputStyle) {
    case 'class':
      return path.join(outputFolder, className, path.basename(inputPath));
    case 'hierarchy':
      return path.join(outputFolder, path.relative(inputFolder, inputPath));
    case 'flat':
      return path.join(outputFolder, path.basename(inputPath));
    case 'none':
      return 'not available (Output Style: None)';
    default:
      return assertUnreachable(outputStyle);
  }
}

export async function writeDetection(
  image: Image,
  detection: DetectionResult,
  detectOptions: DetectOptions,
): Promise<void> {
  const { outputStyle, classNames, outputFolder } = detectOptions;
  const { className, confidence, bbox, outputPath } = detection;
  const size = detectOptions.inputSize;

  // create the bounding box overlay (which we only have to add to the
  // image if the detected `className` is not the `EMPTY_IMAGE_CLASS`)
  const overlay =
    className === EMPTY_IMAGE_CLASS
      ? undefined
      : await getOverlay({
          size,
          text: { x: 10, y: 10, text: `${className} (${confidence})` },
          rect: {
            x0: bbox[0] * size,
            y0: bbox[1] * size,
            x1: bbox[2] * size,
            y1: bbox[3] * size,
            width: LINE_WIDTH,
          },
        });

  switch (outputStyle) {
    case 'class': {
      // check if each animal class subdirectory exists, otherwise create them
      const emptyClassDir = `${outputFolder}/${EMPTY_IMAGE_CLASS}`;
      if (!fs.existsSync(emptyClassDir)) {
        fs.mkdirSync(emptyClassDir);
      }
      classNames.forEach((animalClass) => {
        const animalClassDir = `${outputFolder}/${animalClass}`;
        if (!fs.existsSync(animalClassDir)) {
          fs.mkdirSync(animalClassDir);
        }
      });
      await save(outputPath, image, overlay);
      break;
    }
    case 'hierarchy':
    case 'flat':
      await save(outputPath, image, overlay);
      break;
    case 'none':
      // noop
      break;
    default:
      assertUnreachable(outputStyle);
  }
}

export function getDetectionCounts(
  detections: DetectionResult[],
): DetectionCountMetadata {
  // TODO: determine CXL wants to report total detections (maybe >1 per image)
  // or number of images with detections. For now just count at most 1 per image
  const hasDetection = detections.find(
    (detection) => detection.className !== EMPTY_IMAGE_CLASS,
  );
  if (hasDetection) {
    return {
      imagesInspectedCount: 1,
      detectedObjectCount: 1,
      emptyImageCount: 0,
    };
  }

  return {
    imagesInspectedCount: 1,
    detectedObjectCount: 0,
    emptyImageCount: 1,
  };
}
