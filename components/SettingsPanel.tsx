
import React, { useState, useEffect } from 'react';
import { Settings } from '../types';
import { Cog6ToothIcon } from './icons';

interface SettingsPanelProps {
  settings: Settings;
  onSave: (newSettings: Settings) => void;
  isMonitoring: boolean;
}

const isValidGuid = (guid: string): boolean => {
    const guidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    return guidRegex.test(guid);
};

const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onSave, isMonitoring }) => {
  const [localSettings, setLocalSettings] = useState<Settings>(settings);
  const [isSaved, setIsSaved] = useState(false);
  const [errors, setErrors] = useState<{ highPerformanceGuid?: string; balancedGuid?: string }>({});

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const validateGuid = (name: string, value: string) => {
    if (!isValidGuid(value)) {
        setErrors(prev => ({ ...prev, [name]: 'Invalid GUID format.' }));
    } else {
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[name as keyof typeof errors];
            return newErrors;
        });
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalSettings(prev => ({ ...prev, [name]: name.includes('Guid') ? value : Number(value) }));
    setIsSaved(false);
    if (name === 'highPerformanceGuid' || name === 'balancedGuid') {
      validateGuid(name, value);
    }
  };

  const handleSave = () => {
    // Final validation before saving
    validateGuid('highPerformanceGuid', localSettings.highPerformanceGuid);
    validateGuid('balancedGuid', localSettings.balancedGuid);

    if (!isValidGuid(localSettings.highPerformanceGuid) || !isValidGuid(localSettings.balancedGuid)) {
        return;
    }

    onSave(localSettings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const hasErrors = Object.keys(errors).length > 0;

  const InputField: React.FC<{
    label: string;
    name: keyof Settings;
    type: string;
    unit?: string;
    value: string | number;
    disabled?: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
  }> = ({ label, name, type, unit, value, disabled, onChange, error}) => (
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
          className={`w-full bg-gray-900 border rounded-md py-2 px-3 focus:ring-2 transition disabled:opacity-50 ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-600 focus:ring-indigo-500 focus:border-indigo-500'}`}
        />
        {unit && <span className="absolute inset-y-0 right-3 flex items-center text-gray-400">{unit}</span>}
      </div>
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
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
            <InputField label="High Performance GUID" name="highPerformanceGuid" type="text" value={localSettings.highPerformanceGuid} onChange={handleChange} disabled={isMonitoring} error={errors.highPerformanceGuid} />
        </div>
        <div className="md:col-span-2">
            <InputField label="Balanced GUID" name="balancedGuid" type="text" value={localSettings.balancedGuid} onChange={handleChange} disabled={isMonitoring} error={errors.balancedGuid} />
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={isMonitoring || hasErrors}
          className={`px-6 py-2 rounded-md font-semibold text-white transition ${isMonitoring || hasErrors ? 'bg-gray-600 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500'} ${isSaved ? '!bg-green-600' : ''}`}
        >
          {isSaved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default SettingsPanel;
