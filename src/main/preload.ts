import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

const { PythonShell } = require('python-shell');

const pyshellreqs = new PythonShell('./src/py/reqs.py');

export type Channels = ['ipc-example', 'mainChannel'];

//window api, can access to all rendered frontend
const WINDOW_API = {
  FindOrgModels: async (arg: any) => ipcRenderer.invoke('run/find-org-models', arg), //runs python shell with inputted org
  RunModel: async (arg: any) => ipcRenderer.invoke('run/model', arg), //runs all user inputs and outputs results of user inputted model
  WriteUserInputJson: async (arg: any)=> ipcRenderer.send('write/user-inputs-json', arg), //writes file of user input data from afterorg.tsx
  SelectInputFolder: async ()=> ipcRenderer.invoke('dialog:openDirectoryInput'), //allows to select directory for input folder of user's images
  SelectOutputFolder: async ()=> ipcRenderer.invoke('dialog:openDirectoryOutput'), //allows to select directory for output folder of the model results of user's images
  ReadLogFile: async () => ipcRenderer.invoke('read/log-file'), //read local logFile inside the app
  ReadUpdate: async () => ipcRenderer.invoke('read/update-file'), //read update.json file
  ReadResults: async () => ipcRenderer.invoke('read/results-file'), //read Results.json which has the number of objects, empty images, and the total images that the model was run over
  ReadModels: async () => ipcRenderer.invoke('read/models-file'), //read Models populated by runOrg.py for the inputed organization
  OpenWindow: async (arg: any)=> ipcRenderer.send('open/window', arg), //open new window of docker.desktop
  CountFiles: async (arg: any) => ipcRenderer.invoke('count/files', arg), //count the total number of local files
};

//exposes window api to renderer
contextBridge.exposeInMainWorld('electron', WINDOW_API);

//python reqs using reqs.py
pyshellreqs.on('message', function (message: any) {
  console.log(message);
});
pyshellreqs.end(function (err: any) {
  if (err) {
    throw err;
  }
  console.log('requirements installed');
});

