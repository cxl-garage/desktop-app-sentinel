/**
 * Functions to invoke the docker container to detect features
 * in an image.
 */
import path from 'path';
import fs from 'fs';
import assertUnreachable from '../../util/assertUnreachable';
import {
  isSupported,
  read,
  save,
  toDataArray,
  getOverlay,
  Image,
} from './image';

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

async function writeDetection(
  name: string,
  image: Image,
  detection: DetectionResult,
  detectOptions: DetectOptions,
): Promise<void> {
  const { outputStyle, classNames, outputFolder } = detectOptions;
  const { className, confidence, bbox } = detection;
  const size = detectOptions.inputSize ?? DEFAULT_SIZE;

  // create the bounding box overlay (which we only have to add to the
  // image if the detected `className` is not the `EMPTY_IMAGE_CLASS`)
  const overlay =
    className === EMPTY_IMAGE_CLASS
      ? undefined
      : await getOverlay({
          size,
          text: { x: 10, y: 10, text: `${className} (${confidence})` },
          rect: {
            x0: bbox[1],
            y0: bbox[0],
            x1: bbox[3],
            y1: bbox[2],
            width: LINE_WIDTH,
          },
        });

  switch (outputStyle) {
    case 'class': {
      // check if each animal class subdirectory exists, otherwise create them
      classNames.concat([EMPTY_IMAGE_CLASS]).forEach((animalClass) => {
        const animalClassDir = `${outputFolder}/${animalClass}`;
        if (!fs.existsSync(animalClassDir)) {
          fs.mkdirSync(animalClassDir);
        }
      });

      await save(path.join(outputFolder, className, name), image, overlay);
      break;
    }

    case 'hierarchy':
      throw new Error(`Output style 'hierarchy' is not implemented yet.`);
    case 'flat':
      await save(path.join(outputFolder, name), image, overlay);
      break;
    case 'timelapse':
      throw new Error(`Output style 'timelapse' is not implemented yet.`);
    case 'none':
      throw new Error(`Output style 'none' is not implemented yet.`);
    default:
      assertUnreachable(outputStyle);
  }
}

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
  const startTime = Date.now();
  console.log(`Detecting ${name} with threshold ${options.threshold}`);
  if (!isSupported(name)) {
    return detections;
  }
  const size = options.inputSize ?? DEFAULT_SIZE;
  const beforeRead = Date.now();
  const image = await read(path.join(folder, name), size);
  const dataArray = toDataArray(image);
  const elapsedRead = Date.now() - beforeRead;

  // Invoke the docker endpoint to detect
  const beforeDetect = Date.now();
  const url = `http://localhost:8501/v1/models/${options.modelName}:predict`;
  const body = {
    signature_name: 'serving_default',
    instances: [dataArray],
  };
  // TODO: Should we retry this with a sleep?
  const response = await fetch(url, {
    method: 'post',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
  const json = await response.json();
  const elapsedDetect = Date.now() - beforeDetect;
  const predictions: SentinelPredictions = json.predictions[0];

  // Look through the output for all results that exceed the confidence threshold,
  // write out the image with the bounding box if detected and return the result
  // from this function.
  let totalWrite = 0;
  const threshold = options.threshold ?? DEFAULT_THRESHOLD;

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

    // process all passing predictions asynchronously
    await Promise.all(
      predictionsAboveThreshold.map(async (detection) => {
        const { bbox, className, classId, confidence } = detection;
        const detectionResult = {
          fileName: name,
          className,
          classId,
          confidence,
          filePath: path.join(folder, name),
          bbox,
        };

        // Assume input and output size are the same to simplify bbox computations
        detections.push(detectionResult);

        const beforeWrite = Date.now();
        await writeDetection(name, image, detectionResult, options);
        totalWrite += Date.now() - beforeWrite;
      }),
    );
  } else {
    const detectionResult = {
      fileName: name,
      className: EMPTY_IMAGE_CLASS,
      classId: 0,
      confidence: 0,
      filePath: path.join(folder, name),
      bbox: [0, 0, 0, 0] as BoundingBox,
    };

    detections.push(detectionResult);
    const beforeWrite = Date.now();
    await writeDetection(name, image, detectionResult, options);
    totalWrite += Date.now() - beforeWrite;
  }

  // TODO: This is the place to catch any exceptions and write an error output
  // detections.push([name, 'blank', 0, 0, path.join(folder, name), '']);
  const elapsed = Date.now() - startTime;
  console.log(
    `Detecting ${name} finished in ${elapsedRead} (read) + ${elapsedDetect} (detect) + ${totalWrite} write = ${elapsed} ms`,
  );

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
