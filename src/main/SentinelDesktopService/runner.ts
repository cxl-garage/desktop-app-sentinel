import fs from 'fs';
import * as async from 'async';
import { detect, DetectOptions, OutputStyle } from './detect';
import { getClassNames } from './docker';

type JobTask = {
  folder: string;
  file: string;
  options: {
    inputSize: number;
    threshold: number;
    modelName: string;
    classNames: string[];
    outputFolder: string;
    outputStyle: EOutputStyle;
  };
};

export class ModelRunner {
  queue: async.QueueObject<any>;

  constructor() {
    this.queue = async.queue(async (task: JobTask, callback) => {
      await detect(task.folder, task.file, task.options);
      callback();
    }, 3);
  }

  stats(): { idle: boolean; length: number } {
    return {
      idle: this.queue.idle(),
      length: this.queue.length(),
    };
  }

  start({
    inputFolder,
    outputFolder,
    outputStyle,
    threshold,
    modelName,
  }: {
    inputFolder: string;
    outputFolder: string;
    outputStyle: OutputStyle;
    threshold: number;
    modelName: string;
  }): void {
    // This information should be exposed to the GUI
    const options: DetectOptions = {
      // inputSize: 256,
      threshold,
      modelName,
      classNames: getClassNames(modelName),
      outputFolder,
      outputStyle,
    };

    fs.readdir(inputFolder, (err, files) => {
      files.forEach((file) => {
        console.log(`Processing ${file}`);
        this.queue.push(
          { folder: inputFolder, file, options },
          function (_err) {
            console.log(`Finished processing ${file}`);
          },
        );
      });
    });
  }
}
