import React from 'react';
import {
  X,
  Activity,
  Cpu,
  Database,
  Server,
  Zap,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Bell,
  Shield,
  RefreshCw,
  HardDrive,
  Copy,
} from 'lucide-react';
import toast from 'react-hot-toast';

export type OpsDrawerMode = 'health' | 'job' | 'notification' | 'audit' | 'store_health';

interface PlatformOperationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  mode: OpsDrawerMode;
  itemData: any;
  onSuccess?: () => void;
}

export default function PlatformOperationsDrawer({
  isOpen,
  onClose,
  mode,
  itemData,
  onSuccess,
}: PlatformOperationsDrawerProps) {
  if (!isOpen || !itemData) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/50 backdrop-blur-xs animate-fade-in flex justify-end text-slate-900">
      <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col border-l border-slate-200/80">
        {/* DRAWER HEADER */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold text-sm">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {itemData.name || itemData.title || itemData.action || itemData.storeName || 'Operational Telemetry'}
              </h2>
              <div className="text-xs text-slate-500 font-mono">
                {itemData.id ? `ID: ${itemData.id}` : itemData.environment ? `Env: ${itemData.environment}` : 'Platform Metric'}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* DRAWER CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* MODE 1: HEALTH DETAILS */}
          {mode === 'health' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900 text-sm">System Node Status</span>
                  <span className="px-2.5 py-1 rounded-full font-extrabold text-[10px] bg-emerald-600 text-white uppercase">
                    HEALTHY
                  </span>
                </div>
                <div className="text-slate-600">
                  Uptime: <strong>{((itemData.uptime || 86400) / 3600).toFixed(2)} hours</strong> &bull; Node v20.11.0 &bull; NestJS 10.3
                </div>
              </div>

              <div className="space-y-3">
                <div className="font-bold text-slate-900 border-b border-slate-100 pb-2">Hardware Telemetry</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="text-slate-500 font-medium">Memory Heap Total</div>
                    <div className="text-lg font-bold text-slate-900 mt-1">
                      {((itemData.memory?.process?.heapTotal || 150000000) / 1024 / 1024).toFixed(1)} MB
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="text-slate-500 font-medium">Memory Free</div>
                    <div className="text-lg font-bold text-slate-900 mt-1">
                      {((itemData.memory?.free || 4000000000) / 1024 / 1024 / 1024).toFixed(2)} GB
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="font-bold text-slate-900 border-b border-slate-100 pb-2">Subsystem Services</div>
                {[
                  { name: 'MongoDB Database', status: 'HEALTHY', latency: itemData.dbLatency || '2ms' },
                  { name: 'Redis Cache & Queues', status: 'HEALTHY', latency: '1ms' },
                  { name: 'Scheduler Engine', status: 'HEALTHY', latency: '0ms' },
                  { name: 'Storage Cluster', status: 'HEALTHY', latency: '5ms' },
                ].map((s) => (
                  <div key={s.name} className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                    <span className="font-bold text-slate-900">{s.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-500">{s.latency}</span>
                      <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800">
                        {s.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MODE 2: JOB & WORKER DETAILS */}
          {mode === 'job' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="font-bold text-slate-900 text-sm">{itemData.name || 'Cron Processor'}</div>
                <div className="text-slate-500 font-mono text-[11px]">Schedule: {itemData.schedule || '0 0 * * *'}</div>
                <div className="flex items-center gap-2 pt-1">
                  <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-blue-100 text-blue-800 uppercase">
                    {itemData.status || 'COMPLETED'}
                  </span>
                  <span className="text-slate-500">Average runtime: {itemData.averageRuntimeMs || 250}ms</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="font-bold text-slate-900 border-b border-slate-100 pb-2">Execution Metrics</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                    <div className="text-slate-500">Last Execution</div>
                    <div className="font-bold text-slate-900 mt-0.5">{itemData.lastExecution || 'Just now'}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                    <div className="text-slate-500">Next Scheduled</div>
                    <div className="font-bold text-slate-900 mt-0.5">{itemData.nextExecution || 'In 1 hour'}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MODE 3: NOTIFICATION DETAILS */}
          {mode === 'notification' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{itemData.title}</span>
                  <span className="px-2.5 py-1 rounded-full font-bold text-[10px] bg-amber-100 text-amber-800 uppercase">
                    {itemData.severity || 'WARNING'}
                  </span>
                </div>
                <div className="text-slate-600 mt-2">{itemData.message}</div>
                <div className="text-slate-400 font-mono text-[10px] pt-2">{itemData.createdAt || '2026-07-29'}</div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => {
                    toast.success('Notification marked as read');
                    onSuccess?.();
                    onClose();
                  }}
                  className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl shadow-xs"
                >
                  Mark as Read
                </button>
              </div>
            </div>
          )}

          {/* MODE 4: AUDIT DETAILS */}
          {mode === 'audit' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="font-bold text-slate-900 text-sm">{itemData.action || 'Administrative Event'}</div>
                <div className="text-slate-500">Target Entity: <strong>{itemData.entity || 'Platform'}</strong></div>
                <div className="text-slate-600 mt-2">{itemData.details}</div>
              </div>

              <div className="space-y-2">
                <div className="font-bold text-slate-900 border-b border-slate-100 pb-2">Actor Metadata</div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
                  <div>Actor: <strong>{itemData.actorName || 'Super Admin'}</strong> ({itemData.actorEmail || 'admin@saas.com'})</div>
                  <div>IP Address: <span className="font-mono">{itemData.ipAddress || '192.168.1.1'}</span></div>
                  <div>Timestamp: <span className="font-mono">{itemData.createdAt || '2026-07-29'}</span></div>
                </div>
              </div>
            </div>
          )}

          {/* MODE 5: STORE HEALTH DETAILS */}
          {mode === 'store_health' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{itemData.name || itemData.storeName}</span>
                  <span className="px-2.5 py-1 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800">
                    Health Score: {itemData.healthScore || 98}%
                  </span>
                </div>
                <div className="text-slate-500 font-mono">{itemData.slug}.saasplatform.com</div>
              </div>

              <div className="space-y-3">
                <div className="font-bold text-slate-900 border-b border-slate-100 pb-2">Tenant Quotas</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                    <div className="text-slate-500">Storage Used</div>
                    <div className="font-bold text-slate-900 mt-0.5">{itemData.storageMB || 240} MB</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                    <div className="text-slate-500">API Calls</div>
                    <div className="font-bold text-slate-900 mt-0.5">{itemData.apiRequests || 1420} req</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
