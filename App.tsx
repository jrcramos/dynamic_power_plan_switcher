import React, { useState, useCallback, useEffect } from 'react';
import { Settings } from './types';
import { usePowerMonitor } from './hooks/usePowerMonitor';
import StatusDisplay from './components/StatusDisplay';
import SettingsPanel from './components/SettingsPanel';
import LogViewer from './components/LogViewer';
import { InformationCircleIcon } from './components/icons';

const App: React.FC = () => {
  const [isElectron, setIsElectron] = useState(false);
  const [isWindows, setIsWindows] = useState(false);

  useEffect(() => {
    // Check if running in Electron
    if (typeof window !== 'undefined' && window.electronAPI) {
      setIsElectron(true);
      window.electronAPI.checkPlatform().then(({ isWindows }) => {
        setIsWindows(isWindows);
      });
    }
  }, []);

  const [settings, setSettings] = useState<Settings>({
    cpuThreshold: 50,
    lowCpuThreshold: 35,
    monitorInterval: 5,
    highPerformanceGuid: '8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c',
    balancedGuid: '381b4222-f694-41f0-9685-ff5bb260df2e',
  });

  const {
    isMonitoring,
    currentCpuUsage,
    currentPowerPlan,
    logs,
    startMonitoring,
    stopMonitoring,
    clearLogs
  } = usePowerMonitor(settings);

  const handleSaveSettings = useCallback((newSettings: Settings) => {
    setSettings(newSettings);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8 font-sans">
      <div 
        className="absolute inset-0 h-full w-full bg-transparent bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:36px_36px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)]">
      </div>
      <div className="container mx-auto max-w-7xl relative">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-500">
            Dynamic Power Plan Switcher
          </h1>
          <p className="text-gray-400 mt-2">
            {isElectron && isWindows 
              ? 'Automated power management based on CPU load' 
              : 'A desktop application for automated power management based on CPU load'}
          </p>
        </header>

        {!isElectron && (
          <div className="bg-yellow-900/30 border border-yellow-700 text-yellow-200 px-4 py-3 rounded-lg relative mb-8 flex items-start" role="alert">
            <InformationCircleIcon className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0"/>
            <div>
              <strong className="font-bold">Web Version Notice: </strong>
              <span className="block sm:inline">This is a web-based simulation. For full functionality with real system control, please use the desktop application.</span>
            </div>
          </div>
        )}

        {isElectron && !isWindows && (
          <div className="bg-yellow-900/30 border border-yellow-700 text-yellow-200 px-4 py-3 rounded-lg relative mb-8 flex items-start" role="alert">
            <InformationCircleIcon className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0"/>
            <div>
              <strong className="font-bold">Platform Notice: </strong>
              <span className="block sm:inline">Power plan switching is only supported on Windows. CPU monitoring will still work on this platform.</span>
            </div>
          </div>
        )}

        {isElectron && isWindows && (
          <div className="bg-blue-900/30 border border-blue-700 text-blue-200 px-4 py-3 rounded-lg relative mb-8 flex items-start" role="alert">
            <InformationCircleIcon className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0"/>
            <div>
              <strong className="font-bold">Administrator Mode: </strong>
              <span className="block sm:inline">For best results, run this application as Administrator to ensure power plan changes can be applied.</span>
            </div>
          </div>
        )}

        <main className="space-y-8">
          <StatusDisplay
            isMonitoring={isMonitoring}
            cpuUsage={currentCpuUsage}
            currentPlan={currentPowerPlan}
          />
          
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-900/80 backdrop-blur-sm border-t border-gray-700 z-10 md:static md:bg-transparent md:border-none md:p-0">
            <div className="container mx-auto max-w-7xl flex items-center justify-center">
              <button
                  onClick={isMonitoring ? stopMonitoring : startMonitoring}
                  className={`w-full md:w-auto text-lg font-bold py-3 px-12 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1
                  ${isMonitoring
                      ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-500/30'
                      : 'bg-green-600 hover:bg-green-500 text-white shadow-green-500/30'
                  }`}
              >
                  {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <SettingsPanel settings={settings} onSave={handleSaveSettings} isMonitoring={isMonitoring} />
            <LogViewer logs={logs} onClear={clearLogs} />
          </div>
        </main>
        
        <footer className="text-center mt-12 text-gray-500 text-sm">
            <p>{isElectron ? 'Desktop Application v1.0.0' : 'Web Version - For demonstration purposes'}</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
