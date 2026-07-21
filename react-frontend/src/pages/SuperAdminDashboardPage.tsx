import React, { useEffect, useState } from 'react';
import { storesApi } from '../api/stores.api';
import { auditLogsApi, AuditLogItem } from '../api/audit-logs.api';
import { Store, Server, Activity, Database, Key, Shield, ArrowUpRight, Plus, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SuperAdminDashboardPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    try {
      const [analytics, globalLogs] = await Promise.all([
        storesApi.getGlobalAnalytics(),
        auditLogsApi.getGlobal(10),
      ]);
      setMetrics(analytics);
      setLogs(globalLogs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Webzio Super Admin Command Center</h1>
          <p className="text-xs text-slate-400 mt-0.5">Global Multi-Tenant Infrastructure & Cluster Overview</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => navigate('/admin/stores')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            Provision Store
          </button>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Stores</span>
            <Store className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{metrics?.totalStores || 0}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-medium">
            {metrics?.activeStores || 0} Active / {metrics?.suspendedStores || 0} Suspended
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Products</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{(metrics?.totalProducts || 0).toLocaleString()}</div>
          <div className="text-[11px] text-emerald-400 mt-1 font-medium">Global Products</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Orders</span>
            <Server className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{(metrics?.totalOrders || 0).toLocaleString()}</div>
          <div className="text-[11px] text-blue-400 mt-1 font-medium">Global Orders</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">API Traffic</span>
            <Server className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{(metrics?.totalApiRequests || 0).toLocaleString()}</div>
          <div className="text-[11px] text-purple-400 mt-1 font-medium">Headless API Requests</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">System Health</span>
            <Shield className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400">{metrics?.systemHealth || 'Operational'}</div>
          <div className="text-[11px] text-slate-400 mt-1 font-medium">Latency &lt; 15ms</div>
        </div>
      </div>

      {/* SYSTEM AUDIT LOGS */}
      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80">
        <h3 className="text-sm font-bold text-slate-200 mb-4">Real-Time Cluster Event Trail</h3>
        <div className="space-y-3">
          {logs.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No system events logged yet.</p>
          ) : (
            logs.map((log) => (
              <div key={log._id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/40 text-xs border border-slate-800/60">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                  <div>
                    <span className="font-semibold text-slate-200">{log.action}</span>
                    <span className="text-slate-400 ml-2">on {log.entity}</span>
                    {log.storeId && (
                      <span className="ml-2 px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 text-[10px]">
                        Store: {log.storeId.name}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-slate-500 text-[11px]">
                  {new Date(log.createdAt).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
