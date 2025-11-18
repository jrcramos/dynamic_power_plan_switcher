
import React, { useRef, useEffect } from 'react';
import { LogEntry } from '../types';
import { DocumentTextIcon } from './icons';

interface LogViewerProps {
  logs: LogEntry[];
  onClear: () => void;
}

const logTypeClasses = {
  info: 'text-gray-400',
  success: 'text-green-400',
  warning: 'text-yellow-400',
};

const LogViewer: React.FC<LogViewerProps> = ({ logs, onClear }) => {
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = 0;
    }
  }, [logs]);

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-700 flex flex-col h-96">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-200 flex items-center">
            <DocumentTextIcon className="w-6 h-6 mr-3 text-gray-400"/>
            Event Log
        </h2>
        <button 
          onClick={onClear}
          className="text-sm text-gray-400 hover:text-white hover:bg-gray-700 px-3 py-1 rounded-md transition"
        >
          Clear Log
        </button>
      </div>
      <div ref={logContainerRef} className="flex-grow bg-gray-900 rounded-md p-4 overflow-y-auto font-mono text-sm space-y-1">
        {logs.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
                Log is empty. Start monitoring to see events.
            </div>
        ) : (
            logs.map((log) => (
            <div key={log.id} className="flex">
                <span className="text-gray-500 mr-4">{log.timestamp}</span>
                <span className={`${logTypeClasses[log.type]}`}>{log.message}</span>
            </div>
            ))
        )}
      </div>
    </div>
  );
};

export default LogViewer;
