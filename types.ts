
export enum PowerPlan {
  HighPerformance = 'High Performance',
  Balanced = 'Balanced',
  Unknown = 'Unknown',
}

export interface Settings {
  cpuThreshold: number;
  lowCpuThreshold: number;
  monitorInterval: number; // in seconds
  highPerformanceGuid: string;
  balancedGuid: string;
}

export interface LogEntry {
  id: number;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning';
}
