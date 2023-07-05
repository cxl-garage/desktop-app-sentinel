/**
 * Utility methods to prepare and process image files.
 */
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

export type Image = {
  data: Buffer;
  info: sharp.OutputInfo;
};

export type TextOptions = {
  text: string;
  x: number;
  y: number;
};

export type RectOptions = {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  width: number;
};

export type OverlapProps = {
  size: number;
  text?: TextOptions;
  rect?: RectOptions;
};

/**
 * Reads an image.
 * @param path the image path
 * @param size optional size will resize the image
 * @returns an image promise
 */
export async function read(inputPath: string, size?: number): Promise<Image> {
  const image = size
    ? sharp(inputPath).resize({ width: size, height: size, fit: 'fill' })
    : sharp(inputPath);
  return image.raw().toBuffer({ resolveWithObject: true });
}

/**
 * Checks if the image type for a file name is supported.
 * @param name the image file name
 * @returns true if the image type is supported
 */
export function isSupported(name: string): boolean {
  const lowerCaseName = name.toLowerCase();
  return (
    lowerCaseName.endsWith('.png') ||
    lowerCaseName.endsWith('.jpg') ||
    lowerCaseName.endsWith('.jpeg')
  );
}

/**
 * Converts an image into a column-major array of RGB values.
 * @param image the input image
 * @returns an array of columns that contains arrays of pixel data
 */
// TODO: This is supposed to correspond to the Python function
// np.expand_dims(np.array(image), 0) which upon inspecting output
// appears to be column-major. THIS SHOULD BE CONFIRMED!
export function toDataArray(image: Image): number[][][] {
  const { data, info } = image;
  const output = new Array<number[][]>(info.height);
  let index = 0;
  for (let row = 0; row < info.height; row += 1) {
    const rowData = new Array<number[]>(info.width);
    for (let col = 0; col < info.width; col += 1) {
      rowData[col] = [data[index], data[index + 1], data[index + 2]];
      index += 3;
    }
    output[row] = rowData;
  }
  return output;
}

export async function getOverlay(props: OverlapProps): Promise<Buffer> {
  const { size, text, rect } = props;
  let content = '';
  if (text) {
    content = `<text x="${text.x}" y="${text.y}" fill="red" font="monospace" font-weight="bold">${text.text}</text>`;
  }
  if (rect) {
    const width = rect.x1 - rect.x0;
    const height = rect.y1 - rect.y0;
    content += `<rect x="${rect.x0}" y="${rect.y0}" width="${width}" height="${height}" style="fill:none;stroke:red;stroke-width:${rect.width}" />`;
  }
  const svg = `
    <svg width="${size}" height="${size}">
    ${content}
    </svg>
  `;
  return sharp(Buffer.from(svg)).sharpen({ sigma: 2 }).toBuffer();
}

/**
 * Saves an image to disk.
 * @param folder the output folder
 * @param name the file name of the image
 * @param image the image to save
 */
export async function save(
  outputPath: string,
  image: Image,
  overlay?: Buffer,
): Promise<void> {
  const { data, info } = image;
  let baseImage = await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 3,
    },
  });
  if (overlay) {
    baseImage = baseImage.composite([{ input: overlay, gravity: 'northwest' }]);
  }
  try {
    // Create any directories as needed
    const basePath = path.dirname(outputPath);
    if (!fs.existsSync(basePath)) {
      fs.mkdirSync(path.dirname(outputPath));
    }
    await baseImage.toFile(outputPath);
  } catch (error) {
    console.log(`Error: ${error}`);
  }
}
