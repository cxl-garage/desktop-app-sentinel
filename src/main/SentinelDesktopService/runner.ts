import fs from 'fs';
import * as async from 'async';
import { detect } from './detect';
import { getClassNames } from './docker';

export class ModelRunner {
  queue: async.QueueObject<any>;

  constructor() {
    this.queue = async.queue(async function (task: any, callback) {
      // eslint-disable-next-line promise/catch-or-return, promise/always-return
      await detect(task.folder, task.file, task.options);
      callback();
    }, 3);
  }

  stats(): any {
    return {
      idle: this.queue.idle,
      length: this.queue.length,
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
