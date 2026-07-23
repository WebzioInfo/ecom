import React, { useEffect, useState } from 'react';
import { Server, Activity, Database, CloudRain, Clock, Zap } from 'lucide-react';
import { systemApi } from '../api/system.api';

export default function SystemHealth() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    systemApi.getMetrics().then(setData).catch(console.error);
    const interval = setInterval(() => {
      systemApi.getMetrics().then(setData).catch(console.error);
    }, 5000); // Polling every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const metrics = [
    { label: 'API Uptime', value: data ? `${(data.uptime / 3600).toFixed(2)}h` : '...', status: data?.status || 'Unknown', icon: Server, color: 'emerald' },
    { label: 'Database Health', value: data?.dbLatency || '...', status: 'Healthy', icon: Database, color: 'indigo' },
    { label: 'Background Queues', value: `${data?.backgroundQueues || 0} pending`, status: 'Clear', icon: Clock, color: 'blue' },
    { label: 'Active WebSockets', value: data?.activeWebSockets || 0, status: 'Stable', icon: Zap, color: 'amber' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Activity className="w-6 h-6 text-emerald-400" />
          System Health
        </h1>
        <p className="text-sm text-slate-400 mt-1">Real-time monitoring of platform infrastructure.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <div key={metric.label} className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 backdrop-blur-sm relative overflow-hidden">
            <div className={`absolute -right-4 -top-4 w-16 h-16 bg-${metric.color}-500/10 rounded-full blur-2xl`}></div>
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-2.5 rounded-lg bg-${metric.color}-500/20 text-${metric.color}-400`}>
                <metric.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-slate-300">{metric.label}</h3>
            </div>
            <div className="text-2xl font-bold text-slate-100 mb-1">{metric.value}</div>
            <div className="text-sm flex items-center gap-1.5 text-emerald-400">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              {metric.status}
            </div>
          </div>
        ))}
      </div>
      
      {/* Additional Memory/CPU info could go here */}
      {data && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 backdrop-blur-sm mt-6">
          <h3 className="text-lg font-bold text-white mb-4">Node Server Telemetry</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-400">
            <div>
              <span className="block text-slate-500">Free Mem</span>
              <span className="text-white font-medium">{(data.memory.free / 1024 / 1024 / 1024).toFixed(2)} GB</span>
            </div>
            <div>
              <span className="block text-slate-500">Total Mem</span>
              <span className="text-white font-medium">{(data.memory.total / 1024 / 1024 / 1024).toFixed(2)} GB</span>
            </div>
            <div>
              <span className="block text-slate-500">Process Heap Total</span>
              <span className="text-white font-medium">{(data.memory.process.heapTotal / 1024 / 1024).toFixed(2)} MB</span>
            </div>
            <div>
              <span className="block text-slate-500">CPU Cores</span>
              <span className="text-white font-medium">{data.cpu.length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
