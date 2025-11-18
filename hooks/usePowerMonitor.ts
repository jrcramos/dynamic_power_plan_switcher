import { useState, useEffect, useRef, useCallback } from 'react';
import { Settings, PowerPlan, LogEntry } from '../types';

type PowerMonitorHook = {
  isMonitoring: boolean;
  currentCpuUsage: number;
  currentPowerPlan: PowerPlan;
  logs: LogEntry[];
  startMonitoring: () => void;
  stopMonitoring: () => void;
  clearLogs: () => void;
};

const getTimestamp = () => new Date().toLocaleTimeString();

export const usePowerMonitor = (settings: Settings): PowerMonitorHook => {
  const [isMonitoring, setIsMonitoring] = useState<boolean>(false);
  const [currentCpuUsage, setCurrentCpuUsage] = useState<number>(0);
  const [currentPowerPlan, setCurrentPowerPlan] = useState<PowerPlan>(PowerPlan.Balanced);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const settingsRef = useRef(settings);
  const currentPowerPlanRef = useRef(currentPowerPlan);
  const lastCpuUsageRef = useRef(0);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    currentPowerPlanRef.current = currentPowerPlan;
  }, [currentPowerPlan]);

  const addLog = useCallback((message: string, type: LogEntry['type']) => {
    setLogs(prevLogs => {
      const newLog: LogEntry = {
        id: Date.now(),
        timestamp: getTimestamp(),
        message,
        type,
      };
      // Keep only the last 100 logs
      return [newLog, ...prevLogs].slice(0, 100);
    });
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const monitor = useCallback(async () => {
    const { cpuThreshold, lowCpuThreshold, highPerformanceGuid, balancedGuid } = settingsRef.current;

    // Check if running in Electron
    const isElectron = typeof window !== 'undefined' && window.electronAPI;
    
    let newCpuUsage: number;
    
    if (isElectron) {
      // Use real CPU monitoring
      try {
        newCpuUsage = await window.electronAPI.getCpuUsage();
      } catch (error) {
        console.error('Error getting CPU usage:', error);
        newCpuUsage = lastCpuUsageRef.current;
      }
    } else {
      // Fallback to simulation for web version
      const randomFactor = (Math.random() - 0.5) * 15;
      const baseUsage = lastCpuUsageRef.current;
      
      if (baseUsage > 70) {
        newCpuUsage = baseUsage + (Math.random() * 5 - 4);
      } else if (baseUsage < 20) {
        newCpuUsage = baseUsage + (Math.random() * 4 - 1);
      } else {
        newCpuUsage = baseUsage + randomFactor;
      }
      
      newCpuUsage = Math.max(0, Math.min(100, Math.round(newCpuUsage)));
    }
    
    lastCpuUsageRef.current = newCpuUsage;
    setCurrentCpuUsage(newCpuUsage);

    addLog(`CPU Usage: ${newCpuUsage}%`, 'info');

    if (newCpuUsage > cpuThreshold && currentPowerPlanRef.current !== PowerPlan.HighPerformance) {
      setCurrentPowerPlan(PowerPlan.HighPerformance);
      
      if (isElectron) {
        try {
          await window.electronAPI.setPowerPlan(highPerformanceGuid);
          addLog('Threshold exceeded. Switched to High Performance plan.', 'warning');
        } catch (error) {
          addLog('Failed to switch power plan. May require administrator privileges.', 'warning');
        }
      } else {
        addLog('Threshold exceeded. Switched to High Performance plan. (Simulated)', 'warning');
      }
    } else if (newCpuUsage < lowCpuThreshold && currentPowerPlanRef.current !== PowerPlan.Balanced) {
      setCurrentPowerPlan(PowerPlan.Balanced);
      
      if (isElectron) {
        try {
          await window.electronAPI.setPowerPlan(balancedGuid);
          addLog('CPU usage low. Switched to Balanced plan.', 'success');
        } catch (error) {
          addLog('Failed to switch power plan. May require administrator privileges.', 'success');
        }
      } else {
        addLog('CPU usage low. Switched to Balanced plan. (Simulated)', 'success');
      }
    }
  }, [addLog]);

  useEffect(() => {
    // FIX: Replaced NodeJS.Timeout with `number` for browser compatibility.
    // `setInterval` in the browser returns a `number`, not a NodeJS.Timeout object.
    let intervalId: number | null = null;
    if (isMonitoring) {
      intervalId = setInterval(monitor, settingsRef.current.monitorInterval * 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isMonitoring, monitor]);

  const startMonitoring = () => {
    addLog('Starting CPU monitoring...', 'info');
    setIsMonitoring(true);
    // run first check immediately
    monitor();
  };

  const stopMonitoring = () => {
    addLog('Stopped CPU monitoring.', 'info');
    setIsMonitoring(false);
  };

  return { isMonitoring, currentCpuUsage, currentPowerPlan, logs, startMonitoring, stopMonitoring, clearLogs };
};
