import React, { useEffect, useState } from 'react';
import { auditLogsApi, AuditLogItem } from '../api/audit-logs.api';
import { useTenantStore } from '../store/useTenantStore';
import { ShieldCheck, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AuditLogsPage() {
  const { activeStore } = useTenantStore();
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!activeStore?._id) return;
    setLoading(true);
    try {
      const data = await auditLogsApi.getByStore(activeStore._id, 50);
      setLogs(data);
    } catch (err) {
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeStore]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Audit Logs & Compliance</h1>
          <p className="text-xs text-slate-400">Activity Trail for <span className="text-indigo-400">{activeStore?.name}</span></p>
        </div>
        <button onClick={loadData} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl overflow-hidden">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-800/50 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="p-3.5">Action</th>
              <th className="p-3.5">Entity</th>
              <th className="p-3.5">Performed By</th>
              <th className="p-3.5">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-slate-500">No activity logs recorded for this store yet.</td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log._id} className="hover:bg-slate-800/40">
                  <td className="p-3.5 font-semibold text-indigo-400">{log.action}</td>
                  <td className="p-3.5 text-slate-300">{log.entity}</td>
                  <td className="p-3.5 text-slate-400">{log.userId?.name || 'System'} ({log.userId?.email || 'API'})</td>
                  <td className="p-3.5 text-slate-500 text-[11px]">{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
