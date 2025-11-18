export interface ElectronAPI {
  getCpuUsage: () => Promise<number>;
  getCurrentPowerPlan: () => Promise<string>;
  setPowerPlan: (planGuid: string) => Promise<boolean>;
  listPowerPlans: () => Promise<Array<{ guid: string; name: string }>>;
  checkPlatform: () => Promise<{ platform: string; isWindows: boolean }>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
