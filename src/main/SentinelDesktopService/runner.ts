import fs from 'fs';
import * as async from 'async';
import { detect } from './detect';
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

  start(folder: string, modelName: string): void {
    // This information should be exposed to the GUI
    const options = {
      inputSize: 256,
      threshold: 0.4,
      modelName,
      classNames: getClassNames(modelName),
      outputFolder: `${folder}/output`,
    };

    fs.readdir(folder, (err, files) => {
      files.forEach((file) => {
        console.log(`Processing ${file}`);
        this.queue.push({ folder, file, options }, function (_err) {
          console.log(`Finished processing ${file}`);
        });
      });
    });
  }
}
