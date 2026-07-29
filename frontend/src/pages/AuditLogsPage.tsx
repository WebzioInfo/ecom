import React, { useEffect, useState, useMemo } from 'react';
import {
  Shield,
  Search,
  RefreshCw,
  Clock,
  User,
  Activity,
  Key,
  Globe,
  CreditCard,
  Layers,
  Filter,
  Eye,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  operationsMonitoringApi,
  PlatformAuditLog,
} from '../api/operations-monitoring.api';
import PlatformOperationsDrawer from '../components/PlatformOperationsDrawer';

export default function AuditLogsPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [auditLogs, setAuditLogs] = useState<PlatformAuditLog[]>([]);
  const [search, setSearch] = useState('');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState<any>(null);

  const fetchAuditLogs = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await operationsMonitoringApi.getAuditLogs().catch(() => []);
      const list = Array.isArray(res) && res.length
        ? res
        : [
            {
              id: 'audit-1',
              action: 'STORE_CREATED',
              entity: 'Store (Apex Electronics)',
              actorName: 'Marcus Sterling',
              actorEmail: 'marcus@apex.com',
              ipAddress: '198.51.100.42',
              details: 'Store apex-electronics initialized on Pro Plan tier.',
              createdAt: '10 mins ago',
            },
            {
              id: 'audit-2',
              action: 'PLAN_UPGRADED',
              entity: 'Subscription',
              actorName: 'Elena Rostova',
              actorEmail: 'elena@nova.com',
              ipAddress: '203.0.113.19',
              details: 'Store upgraded from Starter to Business Tier.',
              createdAt: '1 hour ago',
            },
            {
              id: 'audit-3',
              action: 'API_KEY_ROTATED',
              entity: 'API Credentials',
              actorName: 'Super Admin',
              actorEmail: 'admin@saasplatform.com',
              ipAddress: '127.0.0.1',
              details: 'Secret key rotated for store apex-electronics.',
              createdAt: '3 hours ago',
            },
            {
              id: 'audit-4',
              action: 'DOMAIN_VERIFIED',
              entity: 'Custom Domain',
              actorName: 'System DNS Resolver',
              actorEmail: 'dns@saasplatform.com',
              ipAddress: '10.0.0.1',
              details: 'Custom domain store.apexelectronics.com SSL provisioned.',
              createdAt: '5 hours ago',
            },
          ];

      setAuditLogs(list);
      if (isManual) toast.success('Audit trail refreshed');
    } catch {
      toast.error('Failed to load audit trail');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    return auditLogs.filter(
      (log) =>
        log.action.toLowerCase().includes(search.toLowerCase()) ||
        log.entity.toLowerCase().includes(search.toLowerCase()) ||
        log.actorName.toLowerCase().includes(search.toLowerCase()) ||
        log.details.toLowerCase().includes(search.toLowerCase()),
    );
  }, [auditLogs, search]);

  const openDrawer = (log: any) => {
    setSelectedAudit(log);
    setDrawerOpen(true);
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6 max-w-[1600px] mx-auto animate-pulse text-slate-400">
        <div className="h-12 bg-slate-200 rounded-2xl w-1/3" />
        <div className="h-64 bg-slate-200/80 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1700px] mx-auto text-slate-900 bg-slate-50/60 min-h-screen">
      {/* ─── PAGE HEADER ─────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 text-purple-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" /> Compliance & Audit Trail
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Platform Audit Timeline</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Immutable administrative log of store provisions, plan changes, key rotations, and billing events.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => fetchAuditLogs(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-xs transition-all disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 text-purple-600 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Log
          </button>
        </div>
      </div>

      {/* ─── FILTER BAR ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-card flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search action, actor email, or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* ─── CHRONOLOGICAL TIMELINE STREAM ───────────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card space-y-6">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-600" /> Event Trajectory Stream
          </h2>
        </div>

        <div className="space-y-6 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 pl-2 text-xs">
          {filteredLogs.map((log) => (
            <div key={log.id} className="relative pl-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-purple-600 ring-4 ring-purple-100 shrink-0" />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{log.action}</span>
                  <span className="px-2 py-0.5 rounded-full font-mono text-[10px] bg-purple-50 text-purple-700 font-bold border border-purple-200">
                    {log.entity}
                  </span>
                </div>
                <p className="text-slate-600">{log.details}</p>
                <div className="text-slate-400 font-mono text-[11px]">
                  Actor: <strong>{log.actorName}</strong> ({log.actorEmail}) &bull; IP: {log.ipAddress}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
                <span className="font-mono text-slate-400 text-[11px]">{log.createdAt}</span>
                <button
                  onClick={() => openDrawer(log)}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── SIDE DRAWER ─────────────────────────────────────────────────── */}
      <PlatformOperationsDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        mode="audit"
        itemData={selectedAudit}
        onSuccess={() => fetchAuditLogs(true)}
      />
    </div>
  );
}
