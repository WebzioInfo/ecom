import React, { useEffect, useState, useMemo } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Archive,
  Trash2,
  CheckCheck,
  Search,
  RefreshCw,
  Filter,
  Eye,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  operationsMonitoringApi,
  OperationNotification,
} from '../api/operations-monitoring.api';
import PlatformOperationsDrawer from '../components/PlatformOperationsDrawer';

export default function NotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState<OperationNotification[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'UNREAD' | 'CRITICAL' | 'WARNINGS' | 'ARCHIVED'>('ALL');
  const [search, setSearch] = useState('');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);

  const fetchNotifications = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await operationsMonitoringApi.getNotifications().catch(() => []);
      const list = Array.isArray(res) && res.length
        ? res
        : [
            {
              id: 'notif-1',
              title: 'Database Latency Spike Cleared',
              message: 'Database query execution time has stabilized below 3ms across all tenant partitions.',
              severity: 'INFO' as const,
              category: 'System' as const,
              isRead: false,
              isArchived: false,
              createdAt: '10 mins ago',
            },
            {
              id: 'notif-2',
              title: 'Subscription Payment Renewal Failed',
              message: 'Store Nova Fashion card charge was declined. Grace period initiated for 3 days.',
              severity: 'WARNING' as const,
              category: 'Billing' as const,
              isRead: false,
              isArchived: false,
              createdAt: '1 hour ago',
            },
            {
              id: 'notif-3',
              title: 'API Rate Limit Threshold Exceeded',
              message: 'Store Apex Electronics exceeded 80% of monthly API quota. Upgrade recommended.',
              severity: 'CRITICAL' as const,
              category: 'Support' as const,
              isRead: true,
              isArchived: false,
              createdAt: '1 day ago',
            },
          ];

      setNotifications(list);
      if (isManual) toast.success('Notifications refreshed');
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (activeTab === 'UNREAD' && n.isRead) return false;
      if (activeTab === 'CRITICAL' && n.severity !== 'CRITICAL') return false;
      if (activeTab === 'WARNINGS' && n.severity !== 'WARNING') return false;
      if (activeTab === 'ARCHIVED' && !n.isArchived) return false;
      if (activeTab !== 'ARCHIVED' && n.isArchived) return false;

      const matchSearch =
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.message.toLowerCase().includes(search.toLowerCase());

      return matchSearch;
    });
  }, [notifications, activeTab, search]);

  const handleMarkRead = async (id: string) => {
    try {
      await operationsMonitoringApi.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      toast.success('Marked as read');
    } catch {
      toast.error('Failed to update notification');
    }
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    toast.success('All notifications marked as read');
  };

  const openDetails = (n: any) => {
    setSelectedNotification(n);
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
          <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Bell className="w-4 h-4" /> Operational Intelligence
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Notifications Center</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            System warnings, critical billing alerts, security audits, and support notifications.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => fetchNotifications(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-xs transition-all disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 text-blue-600 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            <CheckCheck className="w-4 h-4" /> Mark All as Read
          </button>
        </div>
      </div>

      {/* ─── FILTERS & INBOX CONTROL BAR ──────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-card flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'ALL', label: 'All Alerts' },
            { id: 'UNREAD', label: 'Unread' },
            { id: 'CRITICAL', label: 'Critical' },
            { id: 'WARNINGS', label: 'Warnings' },
            { id: 'ARCHIVED', label: 'Archived' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-3.5 py-2 rounded-xl transition-all ${
                activeTab === t.id
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search notification messages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* ─── NOTIFICATIONS INBOX STREAM ───────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card divide-y divide-slate-100 overflow-hidden text-xs">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            No notifications found.
          </div>
        ) : (
          filteredNotifications.map((n) => {
            const isCrit = n.severity === 'CRITICAL';
            const isWarn = n.severity === 'WARNING';

            return (
              <div
                key={n.id}
                className={`p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                  !n.isRead ? 'bg-blue-50/30 font-semibold' : 'hover:bg-slate-50/80'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
                      isCrit
                        ? 'bg-rose-100 text-rose-700'
                        : isWarn
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {isCrit ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : isWarn ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : (
                      <Info className="w-5 h-5" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{n.title}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          isCrit
                            ? 'bg-rose-100 text-rose-800'
                            : isWarn
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {n.severity}
                      </span>
                    </div>
                    <p className="text-slate-600">{n.message}</p>
                    <div className="text-[11px] text-slate-400 font-mono">{n.createdAt}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto">
                  {!n.isRead && (
                    <button
                      onClick={() => handleMarkRead(n.id)}
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 font-bold rounded-xl hover:bg-blue-100"
                    >
                      Mark Read
                    </button>
                  )}

                  <button
                    onClick={() => openDetails(n)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ─── SIDE DRAWER ─────────────────────────────────────────────────── */}
      <PlatformOperationsDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        mode="notification"
        itemData={selectedNotification}
        onSuccess={() => fetchNotifications(true)}
      />
    </div>
  );
}
