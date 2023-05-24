/**
 * Functions to invoke the docker container to detect features
 * in an image.
 */
import path from 'path';
import {
  drawRectangle,
  isSupported,
  read,
  save,
  toDataArray,
  writeText,
  loadFont,
} from './image';

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
const DEFAULT_THRESHOLD = 0.4;
const LINE_WIDTH = 3;

export async function detect(
  folder: string,
  name: string,
  options: DetectOptions,
): Promise<DetectionResult[]> {
  const detections: DetectionResult[] = [];

  // Read the image and resize if necessary if the image type is supported
  console.log(`Detecting ${name}`);
  if (!isSupported(name)) {
    return detections;
  }
  const image = await read(folder, name, options.inputSize);
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
  const predictions = json.predictions[0];
  console.log(JSON.stringify(predictions, null, 2));

  // TODO: Make sure font is loaded for writing below
  const font = await loadFont();

  // Look through the output for all results that exceed the confidence threshold,
  // write out the image with the bounding box if detected and return the result
  // from this function.
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

        drawRectangle(image, bbox[1], bbox[0], bbox[3], bbox[2], LINE_WIDTH);
        writeText(font, image, 10, 10, `${className} (${confidence})`);
        save(options.outputFolder, name, image);
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
    save(options.outputFolder, name, image);
  }
  // TODO: This is the place to catch any exceptions and write an error output
  // detections.push([name, 'blank', 0, 0, path.join(folder, name), '']);

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
