import { contextBridge, ipcRenderer } from 'electron';
import * as RunModelOptions from '../models/RunModelOptions';

export type Channels = ['ipc-example', 'mainChannel'];

/**
 * This object is the bridge API so that the SentinelDesktopService can be
 * called in the Electron frontend. This object should share the exact same API
 * as the SentinelDesktopService interface.
 *
 * The Electron frontend will call these functions, which will invoke an ipcMain
 * event. The ipcMain event will then call the SentinelDesktopService class.
 *
 * Think of the ipcMain events as REST endpoints. This bridge API is what allows
 * the frontend to call the necessary endpoints, which will then call the
 * SentinelDesktopService.
 */
const SentinelDesktopServiceBridge = {
  getAllLogRecords: () => ipcRenderer.invoke('api/logs/getAll'),
  getAllCXLModelResults: async (modelName?: string) =>
    ipcRenderer.invoke('api/cxl-model-results/getAll', modelName),
  getEnv: (envKey: string) => ipcRenderer.invoke('api/getEnv', envKey),
  getFilesInDir: async (dirPath: string, recursive?: boolean) =>
    ipcRenderer.invoke('api/files/getDir', dirPath, recursive),
  getModelOutputs: async (modelId: string) =>
    ipcRenderer.invoke('api/files/getModelOutputs', modelId),
  findImage: async () => ipcRenderer.invoke('api/docker/findImage'),
  pullImage: async () => ipcRenderer.invoke('api/docker/pullImage'),
  getContainers: async () => ipcRenderer.invoke('api/docker/getContainers'),
  getLogContents: async (modelRunId: number) =>
    ipcRenderer.invoke('api/logs/getContents', modelRunId),
  getVersion: async () => ipcRenderer.invoke('api/docker/getVersion'),
  startModel: async (options: RunModelOptions.T) =>
    ipcRenderer.invoke('api/docker/start', options),
  cleanup: async () => ipcRenderer.invoke('api/docker/cleanup'),
  getCurrentModelRunProgress: async () =>
    ipcRenderer.invoke('api/docker/getCurrentModelRunProgress'),
  getIsModelRunInProgress: async () =>
    ipcRenderer.invoke('api/docker/getIsModelRunInProgress'),
  selectInputFolder: async () =>
    ipcRenderer.invoke('dialog:openDirectoryInput'), // allows to select directory for input folder of user's images
  selectOutputFolder: async () =>
    ipcRenderer.invoke('dialog:openDirectoryOutput'), // allows to select directory for output folder of the model results of user's images
  openFile: async (filePath: string) =>
    ipcRenderer.invoke('openFile', filePath), // allows to select directory for output folder of the model results of user's images
  updateModelRun: async (modelId: string, outputDirectory: string) =>
    ipcRenderer.invoke(
      'api/model-runs/updateModelRun',
      modelId,
      outputDirectory,
    ),

  // Legacy functions.
  // TODO: These should be either refactored or removed.
  findOrgModels: async (arg: any) =>
    ipcRenderer.invoke('DEPRECATED/run/find-org-models', arg), // runs python shell with inputted org
  runModel: async (arg?: any) => ipcRenderer.invoke('run/model', arg), // runs all user inputs and outputs results of user inputted model
  writeUserInputJson: async (arg: any) =>
    ipcRenderer.send('DEPRECATED/write/user-inputs-json', arg), // writes file of user input data from afterorg.tsx
  readUpdate: async () => ipcRenderer.invoke('DEPRECATED/read/update-file'), // read update.json file
  readModels: async () => ipcRenderer.invoke('DEPRECATED/read/models-file'), // read Models populated by runOrg.py for the inputed organization
  openWindow: async (arg: any) =>
    ipcRenderer.send('DEPRECATED/open/window', arg), // open new window of docker.desktop
  countFiles: async (arg: any) =>
    ipcRenderer.invoke('DEPRECATED/count/files', arg), // count the total number of local files
};

// Expose the bridge API to the renderer
contextBridge.exposeInMainWorld(
  'SentinelDesktopService',
  SentinelDesktopServiceBridge,
);
