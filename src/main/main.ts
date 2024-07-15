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
import {
  app,
  BrowserWindow,
  shell,
  ipcMain,
  dialog,
  protocol,
  MessageBoxOptions,
} from 'electron';
import log from 'electron-log';
import { autoUpdater, UpdateDownloadedEvent } from 'electron-updater';
import fs from 'fs';
import invariant from 'invariant';
import * as LogRecord from 'models/LogRecord';
import * as DockerVersion from 'models/DockerVersion';
import * as DockerImage from 'models/DockerImage';
import * as urllib from 'url';
// eslint-disable-next-line import/no-relative-packages
import { ModelRun } from '../generated/prisma/client';
import * as ModelRunProgress from '../models/ModelRunProgress';
import * as RunModelOptions from '../models/RunModelOptions';
import MenuBuilder from './menu';
import {
  DB_PATH,
  IS_APP_PACKAGED,
  resolveHtmlPath,
  runPrismaCommand,
} from './util';
import { SentinelDesktopService } from './SentinelDesktopService';

const AUTO_UPDATE_CHECK_INTERVAL = 30 * 1000; // check ever 30 seconds

let mainWindow: BrowserWindow | undefined;

log.initialize();

// This is an API call that should only be used internally for debugging.
// This is a helpful way to surface environment variables to the renderer
// to view them when the app is packaged.
ipcMain.handle('api/getEnv', (_, envKey: string): string | undefined => {
  if (envKey === 'cwd') {
    return __dirname;
  }
  return process.env[envKey];
});

ipcMain.handle('api/logs/getAll', async (): Promise<LogRecord.T[]> => {
  console.log('Calling api/logs/getAll');
  const logs = await SentinelDesktopService.getAllLogRecords();
  return logs;
});

ipcMain.handle(
  'api/logs/getContents',
  async (
    _event,
    modelRunId: number,
  ): Promise<LogRecord.LogMessage[] | null> => {
    console.log('Calling api/logs/getContents', { modelRunId });
    const logs = await SentinelDesktopService.getLogContents(modelRunId);
    return logs;
  },
);

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

ipcMain.handle(
  'api/model-runs/updateModelRun',
  async (
    _event,
    modelId: number,
    outputDirectory: string,
  ): Promise<ModelRun> => {
    console.log('api/model-runs/updateModelRun');
    const result = await SentinelDesktopService.updateModelRun(
      modelId,
      outputDirectory,
    );
    return result;
  },
);

ipcMain.handle(
  'api/docker/findImage',
  async (): Promise<DockerImage.T | null> => {
    console.log('Calling api/docker/findImage');
    const image = await SentinelDesktopService.findImage();
    console.log('Found image', image);
    return image;
  },
);

ipcMain.handle('api/docker/pullImage', async (): Promise<void> => {
  console.log('Calling api/docker/pullImage');
  return SentinelDesktopService.pullImage();
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
    const id = await SentinelDesktopService.startModel(options);
    return id;
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

ipcMain.handle(
  'api/docker/getIsModelDirectoryValid',
  async (_event, modelDirectory: string): Promise<boolean> => {
    return SentinelDesktopService.getIsModelDirectoryValid(modelDirectory);
  },
);

ipcMain.handle(
  'api/dialog/selectFolder',
  async (): Promise<string | undefined> => {
    invariant(mainWindow, 'Main BrowserWindow must exist');
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
    });
    if (canceled) {
      return undefined;
    }
    return filePaths[0]; // return filepath of folder
  },
);

ipcMain.handle('openFile', async (_event, filepath) => {
  _event.preventDefault();
  shell.openPath(filepath);
});

// used in setup.tsx to open up link to docker desktop
ipcMain.on('open/window', async (e, url) => {
  e.preventDefault();
  shell.openExternal(url);
});

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

function setupAutoUpdater(): void {
  autoUpdater.logger = log;
  const autoUpdateInterval = setInterval(() => {
    autoUpdater.checkForUpdates();
  }, AUTO_UPDATE_CHECK_INTERVAL);

  autoUpdater.on('update-downloaded', async (event: UpdateDownloadedEvent) => {
    // prevent the auto-update from firing multiple times if it
    // already found an update
    clearInterval(autoUpdateInterval);

    const releaseNotesText = Array.isArray(event.releaseNotes)
      ? event.releaseNotes
          .map((note) => `Version ${note.version}: ${note.note}`)
          .join('\n')
      : event.releaseNotes;

    // if windows, the `event` interface is difference so we can't use
    // `event.releaseName`
    const releaseName =
      (process.platform === 'win32' ? releaseNotesText : event.releaseName) ||
      'Update available';

    const dialogOpts: MessageBoxOptions = {
      type: 'info',
      buttons: ['Restart', 'Later'],
      title: 'Application Update',
      message: releaseName,
      detail:
        'A new version has been downloaded. Restart the application to apply the updates.',
    };

    const msgBoxReturnValue = await dialog.showMessageBox(dialogOpts);
    if (msgBoxReturnValue.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });

  autoUpdater.on('error', (message) => {
    console.error('There was a problem updating the application');
    console.error(message);
  });
}

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

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', async () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }

    // the app has just started up so let's make sure there are no modelRuns
    // that were left in IN_PROGRESS due to some bug or inconsistent state.
    // We switch them to UNKNOWN because we don't know what their true end
    // state would have been.
    await SentinelDesktopService.prisma.modelRun.updateMany({
      where: { status: 'IN_PROGRESS' },
      data: {
        status: 'UNKNOWN',
      },
    });
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
}

async function setupApp(): Promise<void> {
  setupAutoUpdater();

  app.on('window-all-closed', () => {
    // Respect the OSX convention of having the application in memory even
    // after all windows have been closed
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

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

  // set up the database if the app is packaged
  // This is written following the guidance from these resources:
  // - https://dev.to/awohletz/running-prisma-migrate-in-an-electron-app-1ehm
  // - https://github.com/awohletz/electron-prisma-trpc-example
  if (IS_APP_PACKAGED) {
    const dbExists = fs.existsSync(DB_PATH);
    console.log('Using db path', DB_PATH);
    if (!dbExists) {
      // prisma for whatever reason has trouble if the database file does
      // not exist yet. So just touch it here
      fs.closeSync(fs.openSync(DB_PATH, 'w'));

      // now perform the migration
      try {
        const schemaPath = path.join(
          process.resourcesPath,
          'prisma',
          'schema.prisma',
        );

        await runPrismaCommand({
          command: [
            'migrate',
            'dev',
            '--skip-generate',
            '--schema',
            schemaPath,
            '--name',
            'init',
          ],
          dbURL: `file:${DB_PATH}?connection_limit=1&socket_timeout=5`,
        });
      } catch (e) {
        console.error(e);
        process.exit(1);
      }
    }
  }

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
