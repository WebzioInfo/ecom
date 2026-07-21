import React from 'react';
import { Server, Activity, Database, CloudRain, Clock, Zap } from 'lucide-react';

export default function SystemHealth() {
  const metrics = [
    { label: 'API Uptime', value: '99.99%', status: 'Operational', icon: Server, color: 'emerald' },
    { label: 'Database Health', value: '14ms latency', status: 'Healthy', icon: Database, color: 'indigo' },
    { label: 'Background Queues', value: '0 pending', status: 'Clear', icon: Clock, color: 'blue' },
    { label: 'Active WebSockets', value: '4,281', status: 'Stable', icon: Zap, color: 'amber' },
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
    </div>
  );
}
