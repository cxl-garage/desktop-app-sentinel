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
  getIsModelDirectoryValid: async (modelDirectory: string) =>
    ipcRenderer.invoke('api/docker/getIsModelDirectoryValid', modelDirectory),
  selectFolder: async () => ipcRenderer.invoke('api/dialog/selectFolder'),
  openFile: async (filePath: string) =>
    ipcRenderer.invoke('openFile', filePath),
  updateModelRun: async (modelId: string, outputDirectory: string) =>
    ipcRenderer.invoke(
      'api/model-runs/updateModelRun',
      modelId,
      outputDirectory,
    ),
};

// Expose the bridge API to the renderer
contextBridge.exposeInMainWorld(
  'SentinelDesktopService',
  SentinelDesktopServiceBridge,
);
