import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  getCpuUsage: () => ipcRenderer.invoke('get-cpu-usage'),
  getCurrentPowerPlan: () => ipcRenderer.invoke('get-current-power-plan'),
  setPowerPlan: (planGuid: string) => ipcRenderer.invoke('set-power-plan', planGuid),
  listPowerPlans: () => ipcRenderer.invoke('list-power-plans'),
  checkPlatform: () => ipcRenderer.invoke('check-platform'),
});
