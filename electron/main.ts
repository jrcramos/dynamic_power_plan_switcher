import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as os from 'os';

const execPromise = promisify(exec);

let mainWindow: BrowserWindow | null = null;
let monitoringInterval: NodeJS.Timeout | null = null;

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
    return match ? match[1] : 'Unknown';
  } catch (error) {
    console.error('Error getting power plan:', error);
    return 'Unknown';
  }
}

// Function to set power plan (Windows only)
async function setPowerPlan(planGuid: string): Promise<boolean> {
  if (process.platform !== 'win32') {
    return false;
  }

  try {
    await execPromise(`powercfg /setactive ${planGuid}`);
    return true;
  } catch (error) {
    console.error('Error setting power plan:', error);
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
    
    return plans;
  } catch (error) {
    console.error('Error listing power plans:', error);
    return [];
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    title: 'Dynamic Power Plan Switcher',
    autoHideMenuBar: true,
  });

  // In development, load from Vite dev server
  // In production, load from built files
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
  }
  if (process.platform !== 'darwin') {
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
