
import React from 'react';
import { PowerPlan } from '../types';
import { CpuChipIcon, BoltIcon } from './icons';

interface StatusDisplayProps {
  isMonitoring: boolean;
  cpuUsage: number;
  currentPlan: PowerPlan;
}

const planConfig = {
  [PowerPlan.HighPerformance]: {
    label: 'High Performance',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30'
  },
  [PowerPlan.Balanced]: {
    label: 'Balanced',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30'
  },
  [PowerPlan.Unknown]: {
    label: 'Unknown',
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/30'
  }
};

const StatusDisplay: React.FC<StatusDisplayProps> = ({ isMonitoring, cpuUsage, currentPlan }) => {
  const config = planConfig[currentPlan];

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-700">
      <h2 className="text-xl font-bold text-gray-200 mb-6 flex items-center">
        <CpuChipIcon className="w-6 h-6 mr-3 text-cyan-400" />
        Live Status
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Monitoring Status Card */}
        <div className="bg-gray-700/50 rounded-lg p-4 flex flex-col items-center justify-center text-center">
          <span className="text-sm font-medium text-gray-400">STATUS</span>
          <div className={`text-2xl font-bold flex items-center mt-2 ${isMonitoring ? 'text-green-400' : 'text-yellow-400'}`}>
            <span className={`w-3 h-3 rounded-full mr-2 ${isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></span>
            {isMonitoring ? 'Monitoring' : 'Idle'}
          </div>
        </div>

        {/* CPU Usage Card */}
        <div className="bg-gray-700/50 rounded-lg p-4 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div 
                className="absolute bottom-0 left-0 top-0 bg-cyan-500/20 transition-all duration-500 ease-out" 
                style={{ width: `${cpuUsage}%` }}
            ></div>
            <span className="text-sm font-medium text-gray-400 z-10">CPU USAGE</span>
            <span className="text-4xl font-bold text-cyan-300 z-10 mt-1">{cpuUsage}<span className="text-2xl">%</span></span>
        </div>

        {/* Power Plan Card */}
        <div className={`rounded-lg p-4 flex flex-col items-center justify-center text-center border ${config.bgColor} ${config.borderColor}`}>
          <span className="text-sm font-medium text-gray-400">ACTIVE PLAN</span>
          <div className={`text-2xl font-bold flex items-center mt-2 ${config.color}`}>
            <BoltIcon className="w-5 h-5 mr-2" />
            {config.label}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusDisplay;
