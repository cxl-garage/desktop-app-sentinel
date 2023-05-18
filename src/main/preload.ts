import { contextBridge, ipcRenderer } from 'electron';
import IRunModelOptions from '../models/IRunModelOptions';

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
  getAllLogRecords: async () => ipcRenderer.invoke('api/logs/getAll'),
  getAllCXLModelResults: async () =>
    ipcRenderer.invoke('api/cxl-model-results/getAll'),
  getFilesInDir: async (dirPath: string) =>
    ipcRenderer.invoke('api/files/getDir', dirPath),
  getImages: async () => ipcRenderer.invoke('api/docker/getImages'),
  getContainers: async () => ipcRenderer.invoke('api/docker/getContainers'),
  getVersion: async () => ipcRenderer.invoke('api/docker/getVersion'),
  startModel: async (options: IRunModelOptions) =>
    ipcRenderer.invoke('api/docker/start', options),
  cleanup: async () => ipcRenderer.invoke('api/docker/cleanup'),
  getModelNames: async () => ipcRenderer.invoke('api/docker/getModelNames'),

  // Legacy functions.
  // TODO: These should be either refactored or removed.
  findOrgModels: async (arg: any) =>
    ipcRenderer.invoke('DEPRECATED/run/find-org-models', arg), // runs python shell with inputted org
  runModel: async (arg?: any) => ipcRenderer.invoke('run/model', arg), // runs all user inputs and outputs results of user inputted model
  writeUserInputJson: async (arg: any) =>
    ipcRenderer.send('DEPRECATED/write/user-inputs-json', arg), // writes file of user input data from afterorg.tsx
  selectInputFolder: async () =>
    ipcRenderer.invoke('DEPRECATED/dialog:openDirectoryInput'), // allows to select directory for input folder of user's images
  selectOutputFolder: async () =>
    ipcRenderer.invoke('DEPRECATED/dialog:openDirectoryOutput'), // allows to select directory for output folder of the model results of user's images
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
