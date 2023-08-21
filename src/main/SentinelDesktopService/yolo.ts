/**
 * Functions to invoke the docker container to detect features
 * in an image for YOLOv5 images.
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
  // YOLOv5 expects the RGB values to be normalized to [0, 1]
  const dataArray = toDataArray(image, true);
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
    const predictions = json.predictions[0] as number[][];

    // Look through the output for all results that exceed the confidence threshold,
    // write out the image with the bounding box if detected and return the result
    // from this function.
    let totalWrite = 0;
    const threshold = options.threshold ?? DEFAULT_THRESHOLD;

    // Loop through all of predictions and find the one with the largest confidence
    // that is above the threshold.
    let topPrediction: number[] = [];
    let topConfidence: number = 0.0;
    predictions.forEach((prediction) => {
      // Take the maximum confidence value over all classes
      const confidence = prediction[4] * Math.max(...prediction.slice(5));
      if (confidence > threshold && confidence > topConfidence) {
        topConfidence = confidence;
        topPrediction = prediction;
      }
    });

    if (topPrediction.length) {
      // Find the class with the highest value and let that be the creature
      // detect
      const confidence = topConfidence;
      const classes = topPrediction.slice(5);
      const classId = classes.indexOf(Math.max(...classes));
      const className = options.classNames.get(classId) ?? 'unknown';
      // x,y are centers
      const x = topPrediction[0];
      const y = topPrediction[1];
      const w = topPrediction[2];
      const h = topPrediction[3];

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
        // The bounding box is already in normalized coordinates
        bbox: [x - w / 2, y - h / 2, x + w / 2, y + h / 2] as BoundingBox,
      };
      // Assume input and output size are the same to simplify bbox computations
      detections.push(detectionResult);
      const beforeWrite = Date.now();
      await writeDetection(image, detectionResult, options);
      totalWrite += Date.now() - beforeWrite;
    } else {
      // If there is no result with a confidence level above the threshold
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
