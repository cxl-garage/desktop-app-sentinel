/**
 * Functions to invoke the docker container to detect features
 * in an image.
 */
import winston from 'winston';
import path from 'path';
import fs from 'fs';
import assertUnreachable from '../../util/assertUnreachable';
import { read, save, toDataArray, getOverlay, Image } from './image';

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

// TODO: Maybe use object with labeled coordinates
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
const DEFAULT_THRESHOLD = 0.4;
const LINE_WIDTH = 3;

function getOutputPath(
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

async function writeDetection(
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
            x0: bbox[1] * size,
            y0: bbox[0] * size,
            x1: bbox[3] * size,
            y1: bbox[2] * size,
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
  inputPath: string,
  options: DetectOptions,
  logger: winston.Logger,
): Promise<DetectionResult[]> {
  const detections: DetectionResult[] = [];

  // Read the image and resize if necessary if the image type is supported
  const startTime = Date.now();

  // intentionally not using `logger` here because we dont want to write this
  // to the log file (it'll be too big)
  console.log(`Detecting ${inputPath} with threshold ${options.threshold}`);

  const size = options.inputSize;
  const beforeRead = Date.now();
  const image = await read(inputPath, size);
  const dataArray = toDataArray(image);
  const elapsedRead = Date.now() - beforeRead;

  // Get the last part of the input path
  const name = path.basename(inputPath);

  // Invoke the docker endpoint to detect
  const beforeDetect = Date.now();
  const url = `http://localhost:8501/v1/models/${options.modelName}:predict`;
  const body = {
    signature_name: 'serving_default',
    instances: [dataArray],
  };
  // TODO: Should we retry this with a sleep?
  try {
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
          const className = options.classNames.get(classId) ?? 'unknown';
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
            inputPath,
            outputPath: getOutputPath(
              folder,
              inputPath,
              options.outputFolder,
              options.outputStyle,
              className,
            ),
            // To match Python CLI, normalize bounding box to input size
            bbox: [
              bbox[0] / size,
              bbox[1] / size,
              bbox[2] / size,
              bbox[3] / size,
            ] as BoundingBox,
          };

          // Assume input and output size are the same to simplify bbox computations
          detections.push(detectionResult);
          const beforeWrite = Date.now();
          await writeDetection(image, detectionResult, options);
          totalWrite += Date.now() - beforeWrite;
        }),
      );
    } else {
      const detectionResult = {
        fileName: name,
        className: EMPTY_IMAGE_CLASS,
        classId: 0,
        confidence: 0,
        inputPath,
        outputPath: getOutputPath(
          folder,
          inputPath,
          options.outputFolder,
          options.outputStyle,
          EMPTY_IMAGE_CLASS,
        ),
        bbox: [0, 0, 0, 0] as BoundingBox,
      };

      detections.push(detectionResult);
      const beforeWrite = Date.now();
      await writeDetection(image, detectionResult, options);
      totalWrite += Date.now() - beforeWrite;
    }

    // TODO: This is the place to catch any exceptions and write an error output
    // detections.push([name, 'blank', 0, 0, path.join(folder, name), '']);
    const elapsed = Date.now() - startTime;

    // intentionally not using `logger` here because we dont want to write this
    // to the log file (it'll be too big)
    console.log(
      `Detecting ${inputPath} finished in ${elapsedRead} (read) + ${elapsedDetect} (detect) + ${totalWrite} write = ${elapsed} ms`,
    );

    return detections;
  } catch (e) {
    logger.error({
      message: `Error detecting for ${inputPath}`,
      stack: (e as Error).stack,
    });
    throw e;
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
