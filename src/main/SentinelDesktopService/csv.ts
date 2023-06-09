import { format, CsvFormatterStream, Row } from '@fast-csv/format';
import fs from 'fs';
import { DetectionResult } from './detect';

export class CsvFile {
  private readonly outputFolder: string;

  private readonly csvStream: CsvFormatterStream<Row, Row>;

  constructor(outputFolder: string) {
    this.outputFolder = outputFolder;
    this.csvStream = format({
      headers: [
        'File',
        'Class Name',
        'ClassID',
        'Confidence',
        'Path',
        'Bounded Box',
      ],
      writeHeaders: true,
      alwaysWriteHeaders: true,
    });
    this.csvStream.pipe(fs.createWriteStream(`${outputFolder}/detections.csv`));
  }

  close(): void {
    this.csvStream.end();
  }

  append(detection: DetectionResult): void {
    this.csvStream.write([
      detection.fileName,
      detection.className,
      detection.classId,
      detection.confidence,
      detection.filePath,
      // To match the format output by the Python CLI
      `[${detection.bbox[0]}, ${detection.bbox[1]}, ${detection.bbox[2]}, ${detection.bbox[3]}]`,
    ]);
  }
}
