/**
 * Functions to invoke the docker container to detect features
 * in an image.
 */
import path from 'path';
import { isSupported, read, save, toDataArray, getOverlay } from './image';

export type OutputStyle = 'class' | 'hierarchy' | 'flat' | 'timelapse' | 'none';
export type DetectOptions = {
  inputSize?: number;
  threshold?: number;
  modelName: string;
  classNames: string[];
  outputFolder: string;
  outputStyle: OutputStyle; // TODO, this is currently not being used
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

const EMPTY_IMAGE_CLASS = 'blank';
const DEFAULT_SIZE = 256;
const DEFAULT_THRESHOLD = 0.4;
const LINE_WIDTH = 3;

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
  const predictions = json.predictions[0];

  // Look through the output for all results that exceed the confidence threshold,
  // write out the image with the bounding box if detected and return the result
  // from this function.
  let totalWrite = 0;
  const threshold = options.threshold ?? DEFAULT_THRESHOLD;
  if (predictions.output_1[0] > threshold) {
    let x = 0;
    while (true) {
      if (
        predictions.output_1[x] > threshold &&
        x < predictions.output_1.length
      ) {
        // Assume input and output size are the same to simplify bbox computations
        const bbox = predictions.output_0[x];
        const classId = predictions.output_2[x];
        const className = options.classNames[classId - 1];
        const confidence = predictions.output_1[x];
        detections.push({
          fileName: name,
          className,
          classId,
          confidence,
          filePath: path.join(folder, name),
          bbox,
        });

        const beforeWrite = Date.now();
        // eslint-disable-next-line no-await-in-loop
        const overlay = await getOverlay({
          size,
          text: {
            x: 10,
            y: 10,
            text: `${className} (${confidence})`,
          },
          rect: {
            x0: bbox[1],
            y0: bbox[0],
            x1: bbox[3],
            y1: bbox[2],
            width: LINE_WIDTH,
          },
        });
        // eslint-disable-next-line no-await-in-loop
        await save(path.join(options.outputFolder, name), image, overlay);
        totalWrite += Date.now() - beforeWrite;
        x += 1;
      } else {
        break;
      }
    }
  } else {
    detections.push({
      fileName: name,
      className: EMPTY_IMAGE_CLASS,
      classId: 0,
      confidence: 0,
      filePath: path.join(folder, name),
      bbox: [0, 0, 0, 0],
    });
    const beforeWrite = Date.now();
    await save(path.join(options.outputFolder, name), image);
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
