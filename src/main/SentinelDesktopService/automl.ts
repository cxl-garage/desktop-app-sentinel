/**
 * Functions to invoke the docker container to detect features
 * in an image for AutoML images.
 */
import winston from 'winston';
import path from 'path';
import { read, toDataArray } from './image';
import {
  getOutputPath,
  writeDetection,
  DetectOptions,
  DetectionResult,
  DEFAULT_THRESHOLD,
  EMPTY_IMAGE_CLASS,
  BoundingBox,
} from './detect';

type AutoMLResult = {
  /** An array of bounding boxes for each potential animal detection */
  output_0: number[][];

  /** The confidence threshold for each potential animal detection */
  output_1: number[];

  /** The animal class for each prediction */
  output_2: number[];

  // TODO: unclear what this number is. Perhaps the total number of predictions?
  output_3: number;
};

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
    const predictions = json.predictions[0] as AutoMLResult;

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
            // Normalize bounding box to input size, AutoML also
            // transposes the x and y coordinates
            bbox: [
              bbox[1] / size,
              bbox[0] / size,
              bbox[3] / size,
              bbox[2] / size,
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
