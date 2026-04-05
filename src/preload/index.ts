import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  versions: process.versions,
});
