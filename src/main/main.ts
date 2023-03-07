/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import fs from 'fs';
import { PythonShell } from 'python-shell';
import invariant from 'invariant';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | undefined;

// below 2 functions handle openning and selecting a new directory, using electron's dialog.showOpenDialog
// used in afterorg.tsx to select folder to get images from and folder to download images to

ipcMain.handle('dialog:openDirectoryInput', async (): Promise<string> => {
  invariant(mainWindow, 'Main BrowserWindow must exist');
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
  });
  if (canceled) {
    return 'cancelled'; // returns cancelled if folder finding is cancelled
  }
  return filePaths[0]; // returns filepath of folder
});

ipcMain.handle('dialog:openDirectoryOutput', async () => {
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

// read log file
// resolve with data, logs.tsx displays the data returned by below function
// ipcMain uses below function to return data to logs
function openLogs(): Promise<any> {
  return new Promise((resolve, reject) => {
    fs.readFile(
      path.join(__dirname, '../py/logfile.csv'),
      'utf-8',
      (error: any, data: any) => {
        if (error) {
          console.log(`reject: ${error}`); // Testing
          reject(error);
        } else {
          console.log(`resolve: ${data}`); // Testing
          resolve(data);
        }
      },
    );
  });
}

ipcMain.handle('read/log-file', async (): Promise<any> => {
  console.log('here we are!!!');
  try {
    const data = await openLogs();
    console.log(`handle: ${data}`); // Testing
    return data;
  } catch (error) {
    console.log('handle error', error);
    return 'Error Loading Log File';
  }
});

// read Results.json, which has been populated by RunCli2.py
// has the number of objects detected, number of total images, and number of empty images
// used by results.tsx that displays results
function readResults(): Promise<any> {
  return new Promise((resolve, reject) => {
    fs.readFile(
      path.join(__dirname, '../py/Results.json'),
      'utf-8',
      (error: any, data: any) => {
        if (error) {
          console.log(`reject: ${error}`); // Testing
          reject(error);
        } else {
          console.log(`resolve: ${data}`); // Testing
          resolve(data);
        }
      },
    );
  });
}

ipcMain.handle('read/results-file', async () => {
  try {
    const data = await readResults();
    console.log(`handle: ${data}`); // Testing
    return data;
  } catch (error) {
    console.log('handle error', error); // Testing
    return 'Error Loading Log File';
  }
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

ipcMain.handle('read/models-file', async () => {
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
ipcMain.handle('run/find-org-models', async (_, args) => {
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
ipcMain.handle('run/model', async () => {
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
ipcMain.handle('count/files', async (arg) => {
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
  await app.whenReady();
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
