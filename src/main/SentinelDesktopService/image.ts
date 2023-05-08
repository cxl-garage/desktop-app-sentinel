/**
 * Utility methods to prepare and process image files.
 */

import Jimp from 'jimp';
import path from 'path';
import { ColorActionName } from '@jimp/plugin-color';
import type { Font } from '@jimp/plugin-print';

/**
 * Reads an image.
 * @param folder the input base folder
 * @param name the name of the image
 * @param size optional size will resize the image
 * @returns a Jimp image promise
 */
export async function read(
  folder: string,
  name: string,
  size?: number,
): Promise<Jimp> {
  const image = Jimp.read(path.join(folder, name));
  return size ? (await image).resize(size, size) : image;
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
 * @param promise the input image
 * @returns an array of columns that contains arrays of pixel data
 */
// TODO: This is supposed to correspond to the Python function
// np.expand_dims(np.array(image), 0) which upon inspecting output
// appears to be column-major. THIS SHOULD BE CONFIRMED!
// ALSO: This is probably the function that performs the worst,
// however if input images are first resized to 256x256, the
// performance should not be all that terrible.
// FINALLY: I'm sure there is much more idiomatic typescript
// manner in which this function can be written.
export function toDataArray(image: Jimp): number[][][] {
  const data = [];
  for (let col = 0; col < image.getWidth(); col += 1) {
    const rowData = [];
    for (let row = 0; row < image.getHeight(); row += 1) {
      const pixel = Jimp.intToRGBA(image.getPixelColor(row, col));
      rowData.push([pixel.r, pixel.g, pixel.b]);
    }
    data.push(rowData);
  }
  return data;
}

/**
 * Draws a outlined rectangle in the image.
 * @param image the image into which to draw
 * @param x0 the starting x coordinate
 * @param y0 the starting y coordinate
 * @param x1 the ending x coordinate
 * @param y1 the ending y coordinate
 * @param width the width of the rectange border
 */
export function drawRectangle(
  image: Jimp,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  width: number,
): void {
  // eslint-disable-next-line func-names
  const color = Jimp.rgbaToInt(255, 0, 0, 255);
  image.scan(x0, y0, x1 - x0, width, function (x, y, idx) {
    this.bitmap.data.writeUInt32BE(color, idx);
  });
  image.scan(x0, y0, width, y1 - y0, function (x, y, idx) {
    this.bitmap.data.writeUInt32BE(color, idx);
  });
  image.scan(x0, y1, x1 - x0, width, function (x, y, idx) {
    this.bitmap.data.writeUInt32BE(color, idx);
  });
  image.scan(x1 - width, y0, width, y1 - y0, function (x, y, idx) {
    this.bitmap.data.writeUInt32BE(color, idx);
  });
}

export async function loadFont(): Promise<Font> {
  return Jimp.loadFont(Jimp.FONT_SANS_12_BLACK);
}

/**
 * Draws text into an image.
 * @param image the input into which text is drawn
 * @param x the x coordinate of the text
 * @param y the y coordinate of the text
 * @param text the text string to be written
 */
// TODO: Write this is different colors (e.g. red)
export async function writeText(
  font: Font,
  image: Jimp,
  x: number,
  y: number,
  text: string,
): Promise<void> {
  // Unfortunately Jimp only comes with black/white fonts so we have to
  // use the trick from here: https://github.com/jimp-dev/jimp/issues/537
  const textImage = new Jimp(image.getWidth(), image.getHeight(), 0x0);
  textImage.print(font, x, y, text);
  textImage.color([
    {
      apply: ColorActionName.XOR,
      params: ['#ff0000ff'],
    },
  ]);
  image.blit(textImage, 0, 0);
}

/**
 * Saves an image to disk.
 * @param folder the output folder
 * @param name the file name of the image
 * @param image the image to save
 */
export function save(folder: string, name: string, image: Jimp): void {
  image.write(path.join(folder, name));
}
