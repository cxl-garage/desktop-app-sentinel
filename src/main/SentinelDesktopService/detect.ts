/**
 * Functions to invoke the docker container to detect features
 * in an image.
 */
import path from 'path';
import fs from 'fs';
// import Jimp from 'jimp';
import {
  drawRectangle,
  isSupported,
  read,
  save,
  toDataArray,
  writeText,
  loadFont,
} from './image';
import assertUnreachable from '../../util/assertUnreachable';

export type OutputStyle = 'class' | 'hierarchy' | 'flat' | 'timelapse' | 'none';
export type DetectOptions = {
  inputSize?: number;
  threshold?: number;
  modelName: string;
  classNames: string[];
  outputFolder: string;
  outputStyle: OutputStyle;
};
export type DetectionCountMetadata = {
  imagesInspectedCount: number;
  detectedObjectCount: number;
  emptyImageCount: number;
};

// TODO: Maybe use object with labeled coordinates
export type BoundingBox = [number, number, number, number];
export type DetectionResult = {
  fileName: string;
  className: string;
  classId: number;
  confidence: number;
  filePath: string;
  bbox: BoundingBox;
};

type SentinelPredictions = {
  /** An array of bounding boxes for each potential animal detection */
  output_0: BoundingBox[];

  /** The confidence threshold for each potential animal detection */
  output_1: number[];

  /** The animal class for each prediction */
  output_2: number[];

  // TODO: unclear what this number is. Perhaps the total number of predictions?
  output_3: number;
};

const EMPTY_IMAGE_CLASS = 'blank';
const DEFAULT_SIZE = 256;
const DEFAULT_THRESHOLD = 0.4;
const LINE_WIDTH = 3;

// function writeDetection(image: Jimp): void {}

/**
 * This is the main function that calls the endpoint in the docker image that
 * will process an image and predict if there is a given animal in it or not.
 *
 * This function will return the `DetectionResult` array that we get from the
 * docker image. This function also has side effects where we write to the
 * `options.outputFolder` in different ways depending on the provided
 * `options.outputStyle`.
 *
 * @param {string} folder - The input folder with images to process
 * @param {string} name - The image file name
 * @param {DetectOptions} options - An object with options, such as the
 *   `modelName`, `outputStyle`, among other things.
 */
export async function detect(
  folder: string,
  name: string,
  options: DetectOptions,
): Promise<DetectionResult[]> {
  const detections: DetectionResult[] = [];

  // Read the image and resize if necessary if the image type is supported
  console.log(`Detecting ${name} with threshold ${options.threshold}`);
  if (!isSupported(name)) {
    return detections;
  }
  const image = await read(folder, name, options.inputSize ?? DEFAULT_SIZE);
  const data = toDataArray(image);

  // Invoke the docker endpoint to detect
  const url = `http://localhost:8501/v1/models/${options.modelName}:predict`;
  const body = {
    signature_name: 'serving_default',
    instances: [data],
  };
  // TODO: Should we retry this with a sleep?
  const response = await fetch(url, {
    method: 'post',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
  const json = await response.json();
  const predictions: SentinelPredictions = json.predictions[0];

  // TODO: Make sure font is loaded for writing below
  const font = await loadFont();

  // Look through the output for all results that exceed the confidence threshold,
  // write out the image with the bounding box if detected and return the result
  // from this function.
  const threshold = options.threshold ?? DEFAULT_THRESHOLD;

  let isSuccessfulDetection;

  // check if the first prediction is above our `threshold`, otherwise it means
  // no predictions passed (so we classify this with the `EMPTY_IMAGE_CLASS`)
  if (predictions.output_1[0] > threshold) {
    const predictionsAboveThreshold = predictions.output_1
      .map((confidence, i) => {
        const bbox = predictions.output_0[i];
        const classId = predictions.output_2[i];
        const className = options.classNames[classId - 1];
        return { bbox, classId, className, confidence };
      })
      .filter((prediction) => prediction.confidence > threshold);

    predictionsAboveThreshold.forEach((detection) => {
      const { bbox, className, classId, confidence } = detection;

      // Assume input and output size are the same to simplify bbox computations
      detections.push({
        fileName: name,
        className,
        classId,
        confidence,
        filePath: path.join(folder, name),
        bbox,
      });

      drawRectangle(image, bbox[1], bbox[0], bbox[3], bbox[2], LINE_WIDTH);
      writeText(font, image, 10, 10, `${className} (${confidence})`);
      save(options.outputFolder, name, image);
    });
  } else {
    detections.push({
      fileName: name,
      className: EMPTY_IMAGE_CLASS,
      classId: 0,
      confidence: 0,
      filePath: path.join(folder, name),
      bbox: [0, 0, 0, 0],
    });
    save(options.outputFolder, name, image);
  }

  // TODO: This is the place to catch any exceptions and write an error output
  // detections.push([name, 'blank', 0, 0, path.join(folder, name), '']);

  console.log('detections length', detections.length);
  console.log('first detection class name', detections[0].className);

  // TODO: YOU ARE HERE. based on the output style:
  //  1. switch statement
  //  2. check if necessary subdirectories exist
  //  3. create them
  //  4. write the image to the appropriate subdirectory
  switch (options.outputStyle) {
    case 'class': {
      // check if each animal class subdirectory exists, otherwise create them
      options.classNames.concat([EMPTY_IMAGE_CLASS]).forEach((animalClass) => {
        const animalClassDir = `${options.outputFolder}/${animalClass}`;
        if (!fs.existsSync(animalClassDir)) {
          fs.mkdirSync(animalClassDir);
        }
      });

      // now write the file to the appropriate subdirectory based on detection
      // status
      console.log('detected?', isSuccessfulDetection);
      break;
    }

    case 'hierarchy':
      throw new Error(`Output style 'hierarchy' is not implemented yet.`);
    case 'flat':
      throw new Error(`Output style 'flat' is not implemented yet.`);
    case 'timelapse':
      throw new Error(`Output style 'timelapse' is not implemented yet.`);
    case 'none':
      throw new Error(`Output style 'none' is not implemented yet.`);
    default:
      assertUnreachable(options.outputStyle);
  }

  console.log('Detection?', {
    isSuccessfulDetection,
    name,
    outputStyle: options.outputStyle,
    outputDir: options.outputFolder,
  });

  return detections;
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
