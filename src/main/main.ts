/* eslint-disable no-console */
/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain, dialog, protocol } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import fs from 'fs';
import { PythonShell } from 'python-shell';
import invariant from 'invariant';
import * as LogRecord from 'models/LogRecord';
import * as DockerVersion from 'models/DockerVersion';
import * as urllib from 'url';
import { ModelRun } from '../generated/prisma/client';
import * as ModelRunProgress from '../models/ModelRunProgress';
import * as RunModelOptions from '../models/RunModelOptions';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import { SentinelDesktopService } from './SentinelDesktopService';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | undefined;

ipcMain.handle('api/logs/getAll', async (): Promise<LogRecord.T[]> => {
  console.log('Calling api/logs/getAll');
  const logs = await SentinelDesktopService.getAllLogRecords();
  return logs;
});

ipcMain.handle(
  'api/cxl-model-results/getAll',
  async (_event, modelName?: string): Promise<ModelRun[]> => {
    console.log('Calling api/cxl-model-results/getAll');
    const cxlModelResults = await SentinelDesktopService.getAllCXLModelResults(
      modelName,
    );
    return cxlModelResults;
  },
);

ipcMain.handle(
  'api/files/getDir',
  async (_event, dirPath: string, recursive?: boolean): Promise<string[]> => {
    console.log('Calling api/files/getDir');
    // TODO: Handle exceptions cleanly somehow, pass custom errors to client
    return SentinelDesktopService.getFilesInDir(dirPath, recursive);
  },
);

ipcMain.handle(
  'api/files/getModelOutputs',
  async (_event, modelId: number): Promise<string[]> => {
    console.log('api/files/getModelOutputs');
    return SentinelDesktopService.getModelOutputs(modelId);
  },
);

ipcMain.handle('api/docker/getImages', async (): Promise<any[]> => {
  console.log('Calling api/docker/getImages');
  return SentinelDesktopService.getImages();
});

ipcMain.handle('api/docker/getContainers', async (): Promise<any[]> => {
  console.log('Calling api/docker/getContainers');
  return SentinelDesktopService.getContainers();
});

ipcMain.handle('api/docker/getVersion', async (): Promise<DockerVersion.T> => {
  return SentinelDesktopService.getVersion();
});

ipcMain.handle('api/docker/cleanup', async (): Promise<void> => {
  console.log('Calling api/docker/cleanup');
  return SentinelDesktopService.cleanup();
});

ipcMain.handle(
  'api/docker/start',
  async (_event, options: RunModelOptions.T): Promise<number> => {
    console.log('Calling api/docker/start');
    return SentinelDesktopService.startModel(options);
  },
);

ipcMain.handle(
  'api/docker/getModelNames',
  async (_event): Promise<string[]> => {
    console.log('Calling api/docker/getModelNames');
    return SentinelDesktopService.getModelNames();
  },
);

ipcMain.handle(
  'api/docker/getCurrentModelRunProgress',
  async (_event): Promise<ModelRunProgress.T | null> => {
    return SentinelDesktopService.getCurrentModelRunProgress();
  },
);

ipcMain.handle(
  'api/docker/getIsModelRunInProgress',
  async (_event): Promise<boolean> => {
    return SentinelDesktopService.isInProgress;
  },
);

// below 2 functions handle openning and selecting a new directory, using electron's dialog.showOpenDialog
// used in afterorg.tsx to select folder to get images from and folder to download images to

ipcMain.handle(
  'DEPRECATED/dialog:openDirectoryInput',
  async (): Promise<string> => {
    invariant(mainWindow, 'Main BrowserWindow must exist');
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
    });
    if (canceled) {
      return 'cancelled'; // returns cancelled if folder finding is cancelled
    }
    return filePaths[0]; // returns filepath of folder
  },
);

ipcMain.handle('DEPRECATED/dialog:openDirectoryOutput', async () => {
  invariant(mainWindow, 'Main BrowserWindow must exist');
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
  });
  if (canceled) {
    return 'cancelled'; // returns that it is cancelled if you cancel request
  }
  return filePaths[0]; // return filepath of folder
});

// used in setup.tsx to open up link to docker desktop
ipcMain.on('open/window', async (e, url) => {
  e.preventDefault();
  shell.openExternal(url);
});

// used in afterorg.tsx to write the user inputs to a json file
// writes data of the user values sent by afterorg.tsx to right to inputData.json
ipcMain.on('write/user-inputs-json', async (event, data) => {
  fs.writeFile(
    path.join(__dirname, '../py/inputData.json'),
    data,
    (err: any) => {
      if (!err) {
        console.log('File written');
      } else {
        console.log(err);
      }
    },
  );
});

// read Models.json, which is a json of models populated by runCli.py
// for the inputed organization, used by afterorg.tsx
// reads models from Models.json
function readModels(): Promise<any> {
  return new Promise((resolve, reject) => {
    fs.readFile(
      path.join(__dirname, '../py/Models.json'),
      'utf-8',
      (error: any, data: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(data);
        }
      },
    );
  });
}

ipcMain.handle('DEPRECATED/read/models-file', async () => {
  try {
    const data = await readModels();
    console.log(`handle: ${data}`); // Testing
    return data;
  } catch (error) {
    console.log('handle error', error); // Testing
    return 'Error Loading Log File';
  }
});

// runs runOrg.py with py-shell
// check python-shell documentary
ipcMain.handle('DEPRECATED/run/find-org-models', async (_, args) => {
  const result = await new Promise((resolve, reject) => {
    const pyshell = new PythonShell('./src/py/runOrg.py');
    pyshell.send(JSON.stringify({ org: `${args}` }));
    let error = '';
    pyshell.on('stderr', function (stderr: any) {
      console.log(stderr);
    });
    pyshell.on('error', function (err: any) {
      if (err) {
        error = err;
        resolve(`error ${err}`);
      }
      console.log(err);
    });
    pyshell.on('message', function (message: any) {
      resolve(error + message);
      console.log(message);
    });

    pyshell.end(function (err: any, code: any, signal: any) {
      if (err) {
        reject(err);
      }
      console.log(`The exit code was: ${code}`);
      console.log(`The exit signal was: ${signal}`);
      console.log('finished');
      resolve('finished');
    });
  });

  return result;
});

// runs runCli2.py with inputed data
// with model
ipcMain.handle('DREPCATED/run/model', async () => {
  const result = await new Promise((resolve, reject) => {
    const pyshell = new PythonShell('./src/py/runCli2.py', { mode: 'text' });
    let error = '';
    pyshell.on('stderr', function (stderr: any) {
      console.log(stderr);
    });
    pyshell.on('error', function (err: any) {
      if (err) {
        error = err;
        resolve(`error${err}`);
      }
      console.log(err);
    });
    pyshell.on('message', function (message: any) {
      resolve(error + message);
      console.log(message);
    });

    pyshell.end(function (err: any, code: any, signal: any) {
      if (err) {
        reject(err);
      }
      console.log(`The exit code was: ${code}`);
      console.log(`The exit signal was: ${signal}`);
      console.log('finished');
      resolve('finished');
    });
  });

  return result;
});

// runs countFiles.py
ipcMain.handle('DEPRECATED/count/files', async (arg) => {
  const result = await new Promise((resolve, reject) => {
    const pyshell = new PythonShell('./src/py/countFiles.py', { mode: 'text' });
    pyshell.send(String(arg));

    pyshell.on('message', function (message: any) {
      resolve(message);
      console.log(message);
    });
    pyshell.on('stderr', function (stderr: any) {
      console.log(stderr);
    });
    pyshell.on('error', function (err: any) {
      if (err) {
        resolve(`error: ${err}`);
      }
      console.log(err);
    });

    pyshell.end(function (err: any, code: any, signal: any) {
      if (err) {
        reject(err);
      }
      console.log(`The exit code was: ${code}`);
      console.log(`The exit signal was: ${signal}`);
      console.log('finished');
    });
  });

  return result;
});

// file for loading update
/* function openUpdate() {
  return new Promise((resolve, reject) => {
      fs.readFile(path.join(__dirname, '../py/progress.csv'), "utf-8", (error: any, data: any) => {
          if (error) {
              console.log('reject: ' + error); // Testing
              reject(error);
          } else {
              console.log('resolve: ' + data); // Testing
              resolve(data)
          }
      });
  });
}
ipcMain.handle('read/update', async (event, message) => {
return await openUpdate()
    .then((data) => {
        console.log('handle: ' + data); // Testing
        return data;
    })
    .catch((error) => {
        console.log('handle error: ' + error); // Testing
        return 'Error Loading Log File';
    })
}); */

if (process.env.NODE_ENV === 'production') {
  // eslint-disable-next-line
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  // eslint-disable-next-line
  require('electron-debug')();
}

const installExtensions = async (): Promise<any> => {
  // eslint-disable-next-line
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

/*
// TODO: uncomment this block and encapsulate it in an endpoint when we are
// ready to test the dependency installation

const pyshellreqs = new PythonShell('./src/py/reqs.py');
// python reqs using reqs.py
pyshellreqs.on('message', function (message: any) {
  console.log(message);
});
pyshellreqs.end(function (err: any) {
  if (err) {
    throw err;
  }
  console.log('requirements installed');
});
*/

async function createWindow(): Promise<void> {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1424,
    height: 954,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      scrollBounce: true,
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
      webSecurity: false, // this is needed for loading images with 'file://' protocol
    },
  });

  mainWindow.loadURL(resolveHtmlPath.fn('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = undefined;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
}

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

async function setupApp(): Promise<void> {
  // eslint-disable-next-line promise/always-return
  await app.whenReady().then(() => {
    // Out-of-box file:// protocol gets "Not allowed to load local resource" error
    // https://www.electronjs.org/docs/latest/api/protocol#protocolregisterfileprotocolscheme-handler
    protocol.registerFileProtocol('localfile', (request, callback) => {
      try {
        const filePath = urllib.fileURLToPath(
          `file://${request.url.slice('localfile://'.length)}`,
        );
        // eslint-disable-next-line promise/no-callback-in-promise
        callback(filePath);
      } catch (error) {
        // TODO: handle error
        console.error(error);
      }
    });
  });
  createWindow();
  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === undefined) {
      createWindow();
    }
  });
}

setupApp();
