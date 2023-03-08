import { contextBridge, ipcRenderer } from 'electron';

export type Channels = ['ipc-example', 'mainChannel'];

// window api, can access to all rendered frontend
const SentinelDesktopService = {
  findOrgModels: async (arg: any) =>
    ipcRenderer.invoke('run/find-org-models', arg), // runs python shell with inputted org
  runModel: async (arg?: any) => ipcRenderer.invoke('run/model', arg), // runs all user inputs and outputs results of user inputted model
  writeUserInputJson: async (arg: any) =>
    ipcRenderer.send('write/user-inputs-json', arg), // writes file of user input data from afterorg.tsx
  selectInputFolder: async () =>
    ipcRenderer.invoke('dialog:openDirectoryInput'), // allows to select directory for input folder of user's images
  selectOutputFolder: async () =>
    ipcRenderer.invoke('dialog:openDirectoryOutput'), // allows to select directory for output folder of the model results of user's images
  readLogFile: async () => ipcRenderer.invoke('read/log-file'), // read local logFile inside the app
  readUpdate: async () => ipcRenderer.invoke('read/update-file'), // read update.json file
  readResults: async () => ipcRenderer.invoke('read/results-file'), // read Results.json which has the number of objects, empty images, and the total images that the model was run over
  readModels: async () => ipcRenderer.invoke('read/models-file'), // read Models populated by runOrg.py for the inputed organization
  openWindow: async (arg: any) => ipcRenderer.send('open/window', arg), // open new window of docker.desktop
  countFiles: async (arg: any) => ipcRenderer.invoke('count/files', arg), // count the total number of local files
};

// exposes window api to renderer
contextBridge.exposeInMainWorld(
  'SentinelDesktopService',
  SentinelDesktopService,
);
