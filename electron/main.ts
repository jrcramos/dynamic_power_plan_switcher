import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as os from 'os';
import * as fs from 'fs';

const execPromise = promisify(exec);

let mainWindow: BrowserWindow | null = null;
let monitoringInterval: NodeJS.Timeout | null = null;

// Setup logging
const logDir = path.join(app.getPath('userData'), 'logs');
const logFile = path.join(logDir, 'app.log');

// Ensure log directory exists
try {
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
} catch (error) {
  console.error('Failed to create log directory:', error);
}

// Logging function
function log(message: string, level: 'INFO' | 'ERROR' | 'WARN' = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}\n`;
  
  // Write to console
  console.log(logMessage.trim());
  
  // Write to file
  try {
    fs.appendFileSync(logFile, logMessage);
  } catch (error) {
    console.error('Failed to write to log file:', error);
  }
}

// Log application start
log(`Application starting - Version ${app.getVersion()}`);
log(`Platform: ${process.platform}`);
log(`Electron version: ${process.versions.electron}`);
log(`Node version: ${process.versions.node}`);
log(`Log file location: ${logFile}`);

// Function to get current CPU usage
function getCpuUsage(): Promise<number> {
  return new Promise((resolve) => {
    const cpus = os.cpus();
    const cpuCount = cpus.length;
    
    // Calculate CPU usage by measuring idle time
    const startMeasure = cpus.map(cpu => {
      let totalTick = 0;
      for (const type in cpu.times) {
        totalTick += cpu.times[type as keyof typeof cpu.times];
      }
      return { idle: cpu.times.idle, total: totalTick };
    });

    setTimeout(() => {
      const cpusEnd = os.cpus();
      const endMeasure = cpusEnd.map(cpu => {
        let totalTick = 0;
        for (const type in cpu.times) {
          totalTick += cpu.times[type as keyof typeof cpu.times];
        }
        return { idle: cpu.times.idle, total: totalTick };
      });

      let totalUsage = 0;
      for (let i = 0; i < cpuCount; i++) {
        const startTotal = startMeasure[i].total;
        const startIdle = startMeasure[i].idle;
        const endTotal = endMeasure[i].total;
        const endIdle = endMeasure[i].idle;

        const totalDiff = endTotal - startTotal;
        const idleDiff = endIdle - startIdle;

        const usage = 100 - (100 * idleDiff / totalDiff);
        totalUsage += usage;
      }

      const avgUsage = totalUsage / cpuCount;
      resolve(Math.round(avgUsage));
    }, 100);
  });
}

// Function to get current power plan (Windows only)
async function getCurrentPowerPlan(): Promise<string> {
  if (process.platform !== 'win32') {
    return 'Unsupported Platform';
  }

  try {
    const { stdout } = await execPromise('powercfg /getactivescheme');
    const match = stdout.match(/Power Scheme GUID:\s+[a-f0-9-]+\s+\((.+?)\)/i);
    const plan = match ? match[1] : 'Unknown';
    log(`Current power plan: ${plan}`);
    return plan;
  } catch (error) {
    log(`Error getting power plan: ${error}`, 'ERROR');
    return 'Unknown';
  }
}

// Function to set power plan (Windows only)
async function setPowerPlan(planGuid: string): Promise<boolean> {
  if (process.platform !== 'win32') {
    log('Cannot set power plan on non-Windows platform', 'WARN');
    return false;
  }

  try {
    log(`Setting power plan to GUID: ${planGuid}`);
    await execPromise(`powercfg /setactive ${planGuid}`);
    log('Power plan set successfully');
    return true;
  } catch (error) {
    log(`Error setting power plan: ${error}`, 'ERROR');
    return false;
  }
}

// Function to list available power plans (Windows only)
async function listPowerPlans(): Promise<Array<{ guid: string; name: string }>> {
  if (process.platform !== 'win32') {
    return [];
  }

  try {
    const { stdout } = await execPromise('powercfg /list');
    const plans: Array<{ guid: string; name: string }> = [];
    const lines = stdout.split('\n');
    
    for (const line of lines) {
      const match = line.match(/Power Scheme GUID:\s+([a-f0-9-]+)\s+\((.+?)\)/i);
      if (match) {
        plans.push({ guid: match[1], name: match[2] });
      }
    }
    
    log(`Found ${plans.length} power plans`);
    return plans;
  } catch (error) {
    log(`Error listing power plans: ${error}`, 'ERROR');
    return [];
  }
}

function createWindow() {
  log('Creating main window');
  
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
    title: 'Dynamic Power Plan Switcher',
    autoHideMenuBar: true,
  });

  // In development, load from Vite dev server
  // In production, load from built files
  if (process.env.NODE_ENV === 'development') {
    const devUrl = 'http://localhost:5173';
    log(`Loading dev server from ${devUrl}`);
    mainWindow.loadURL(devUrl);
    mainWindow.webContents.openDevTools();
  } else {
    const indexPath = path.join(__dirname, '../dist/index.html');
    log(`Loading production build from ${indexPath}`);
    mainWindow.loadFile(indexPath).catch(error => {
      log(`Error loading index.html: ${error}`, 'ERROR');
    });
  }

  // Log when page finishes loading
  mainWindow.webContents.on('did-finish-load', () => {
    log('Page finished loading');
  });

  // Log any page load errors
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    log(`Page failed to load: ${errorCode} - ${errorDescription}`, 'ERROR');
  });

  // Log console messages from the renderer
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    log(`Renderer console [${level}]: ${message} (${sourceId}:${line})`);
  });

  mainWindow.on('closed', () => {
    log('Main window closed');
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  log('App ready, creating window');
  createWindow();

  app.on('activate', () => {
    log('App activated');
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  log('All windows closed');
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
  }
  if (process.platform !== 'darwin') {
    log('Quitting app');
    app.quit();
  }
});

// IPC Handlers
ipcMain.handle('get-cpu-usage', async () => {
  return await getCpuUsage();
});

ipcMain.handle('get-current-power-plan', async () => {
  return await getCurrentPowerPlan();
});

ipcMain.handle('set-power-plan', async (_event, planGuid: string) => {
  return await setPowerPlan(planGuid);
});

ipcMain.handle('list-power-plans', async () => {
  return await listPowerPlans();
});

ipcMain.handle('check-platform', async () => {
  return {
    platform: process.platform,
    isWindows: process.platform === 'win32',
  };
});

ipcMain.handle('get-log-path', async () => {
  return logFile;
});

ipcMain.handle('open-log-folder', async () => {
  const { shell } = require('electron');
  shell.openPath(logDir);
});
