
import React, { useState, useEffect } from 'react';
import { Settings } from '../types';
import { Cog6ToothIcon } from './icons';

interface SettingsPanelProps {
  settings: Settings;
  onSave: (newSettings: Settings) => void;
  isMonitoring: boolean;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onSave, isMonitoring }) => {
  const [localSettings, setLocalSettings] = useState<Settings>(settings);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalSettings(prev => ({ ...prev, [name]: name.includes('Guid') ? value : Number(value) }));
    setIsSaved(false);
  };

  const handleSave = () => {
    onSave(localSettings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const InputField: React.FC<{
    label: string;
    name: keyof Settings;
    type: string;
    unit?: string;
    value: string | number;
    disabled?: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }> = ({ label, name, type, unit, value, disabled, onChange}) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
      <div className="relative">
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition disabled:opacity-50"
        />
        {unit && <span className="absolute inset-y-0 right-3 flex items-center text-gray-400">{unit}</span>}
      </div>
    </div>
  );

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-700">
      <h2 className="text-xl font-bold text-gray-200 mb-6 flex items-center">
        <Cog6ToothIcon className="w-6 h-6 mr-3 text-indigo-400"/>
        Configuration
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <InputField label="High CPU Threshold" name="cpuThreshold" type="number" unit="%" value={localSettings.cpuThreshold} onChange={handleChange} disabled={isMonitoring} />
        <InputField label="Low CPU Threshold" name="lowCpuThreshold" type="number" unit="%" value={localSettings.lowCpuThreshold} onChange={handleChange} disabled={isMonitoring} />
        <InputField label="Monitor Interval" name="monitorInterval" type="number" unit="sec" value={localSettings.monitorInterval} onChange={handleChange} disabled={isMonitoring} />
        <div></div> {/* Spacer */}
        <div className="md:col-span-2">
            <InputField label="High Performance GUID" name="highPerformanceGuid" type="text" value={localSettings.highPerformanceGuid} onChange={handleChange} disabled={isMonitoring} />
        </div>
        <div className="md:col-span-2">
            <InputField label="Balanced GUID" name="balancedGuid" type="text" value={localSettings.balancedGuid} onChange={handleChange} disabled={isMonitoring} />
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={isMonitoring}
          className={`px-6 py-2 rounded-md font-semibold text-white transition ${isMonitoring ? 'bg-gray-600 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500'} ${isSaved ? '!bg-green-600' : ''}`}
        >
          {isSaved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default SettingsPanel;
