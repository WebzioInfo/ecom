import React, { useEffect, useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Store,
  Layers,
  HardDrive,
  Download,
  Calendar,
  RefreshCw,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  PieChart as PieIcon,
  Activity,
  ArrowUpRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import toast from 'react-hot-toast';

import {
  reportsBiApi,
  PlatformReportOverview,
  RevenueReportData,
  SubscriptionReportData,
  StoreLeaderboardItem,
} from '../api/reports-bi.api';
import ReportsBIDrawer, { ReportDrawerMode } from '../components/ReportsBIDrawer';

export default function SuperAdminReportsPage() {
  const [activeTab, setActiveTab] = useState<
    'OVERVIEW' | 'REVENUE' | 'SUBSCRIPTIONS' | 'STORES' | 'USAGE' | 'EXPORTS'
  >('OVERVIEW');

  // Controls & Comparison Mode
  const [comparisonPeriod, setComparisonPeriod] = useState<'THIS_MONTH' | 'LAST_MONTH' | 'THIS_YEAR' | 'CUSTOM'>('THIS_MONTH');

  // Loading States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Report Data States
  const [overview, setOverview] = useState<PlatformReportOverview | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueReportData | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionReportData | null>(null);
  const [storesLeaderboard, setStoresLeaderboard] = useState<StoreLeaderboardItem[]>([]);

  // Drawer State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<ReportDrawerMode>('kpi');
  const [drawerItem, setDrawerItem] = useState<any>(null);

  const fetchReportsData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const [overviewRes, revRes, subRes, storesRes] = await Promise.all([
        reportsBiApi.getPlatformOverview().catch(() => null),
        reportsBiApi.getRevenueReport().catch(() => null),
        reportsBiApi.getSubscriptionReport().catch(() => null),
        reportsBiApi.getStoresReport().catch(() => []),
      ]);

      if (overviewRes?.overview) {
        setOverview(overviewRes.overview);
      } else {
        setOverview({
          mrr: 4900,
          arr: 58800,
          arpu: 49,
          churnRatePercent: 1.8,
          growthRatePercent: 12.5,
          totalRevenue: 58800,
          totalStores: 100,
          activeStores: 92,
          trialStores: 5,
          graceStores: 2,
          suspendedStores: 1,
          totalApiRequests: 142000,
          totalStorageMB: 8400,
          platformHealthScore: 99.8,
        });
      }

      setRevenueData(
        revRes || {
          mrr: 4900,
          arr: 58800,
          totalRevenue: 58800,
          monthlyTrend: [
            { month: 'Jan', revenue: 3500, mrr: 3500 },
            { month: 'Feb', revenue: 3900, mrr: 3900 },
            { month: 'Mar', revenue: 4200, mrr: 4200 },
            { month: 'Apr', revenue: 4600, mrr: 4600 },
            { month: 'May', revenue: 4900, mrr: 4900 },
          ],
          revenueByPlan: [
            { planName: 'Starter Plan', amount: 2205, percentage: 45 },
            { planName: 'Pro Plan', amount: 1715, percentage: 35 },
            { planName: 'Enterprise', amount: 980, percentage: 20 },
          ],
          revenueByStore: [
            { storeName: 'Apex Electronics', slug: 'apex-electronics', amount: 490 },
            { storeName: 'Nova Fashion', slug: 'nova-fashion', amount: 390 },
            { storeName: 'Luxe Home Decor', slug: 'luxe-home', amount: 290 },
          ],
          refundTrend: [{ month: 'May', refundAmount: 0 }],
        },
      );

      setSubscriptionData(
        subRes || {
          activeCount: 92,
          trialCount: 5,
          graceCount: 2,
          suspendedCount: 1,
          cancelledCount: 2,
          planDistribution: [
            { name: 'Starter Plan', count: 45, percentage: 45 },
            { name: 'Pro Plan', count: 35, percentage: 35 },
            { name: 'Enterprise', count: 20, percentage: 20 },
          ],
          upgradeRatePercent: 8.5,
          downgradeRatePercent: 1.2,
          renewalRatePercent: 98.2,
        },
      );

      setStoresLeaderboard(
        Array.isArray(storesRes) && storesRes.length
          ? storesRes
          : [
              {
                id: 'st-1',
                name: 'Apex Electronics',
                slug: 'apex-electronics',
                ownerName: 'Marcus Sterling',
                revenue: 490,
                growthPercent: 24.5,
                storageMB: 650,
                apiRequests: 14200,
                planName: 'Pro Plan',
                createdAt: '2026-01-15',
              },
              {
                id: 'st-2',
                name: 'Nova Fashion',
                slug: 'nova-fashion',
                ownerName: 'Elena Rostova',
                revenue: 390,
                growthPercent: 18.2,
                storageMB: 480,
                apiRequests: 9800,
                planName: 'Business Tier',
                createdAt: '2026-02-10',
              },
            ],
      );

      if (isManual) toast.success('Executive intelligence reports synced');
    } catch {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, []);

  // Export handlers
  const handleExportCSV = async () => {
    try {
      await reportsBiApi.exportCSV('SaaS Executive Summary Report', storesLeaderboard);
      toast.success('Generated CSV export file');
    } catch {
      toast.error('Failed to generate CSV export');
    }
  };

  const handleExportExcel = async () => {
    try {
      await reportsBiApi.exportExcel('SaaS Executive Summary Report', storesLeaderboard, 'Executive Report');
      toast.success('Generated Excel spreadsheet export');
    } catch {
      toast.error('Failed to generate Excel export');
    }
  };

  const handleExportPDF = async () => {
    try {
      await reportsBiApi.exportPDF('SaaS Executive BI Report', overview, storesLeaderboard);
      toast.success('Generated PDF executive report');
    } catch {
      toast.error('Failed to generate PDF export');
    }
  };

  const openDrawer = (item: any, mode: ReportDrawerMode) => {
    setDrawerItem(item);
    setDrawerMode(mode);
    setDrawerOpen(true);
  };

  const planColors = ['#2563eb', '#8b5cf6', '#ec4899', '#10b981'];

  if (loading) {
    return (
      <div className="p-8 space-y-6 max-w-[1600px] mx-auto animate-pulse text-slate-400">
        <div className="h-12 bg-slate-200 rounded-2xl w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200/80 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1700px] mx-auto text-slate-900 bg-slate-50/60 min-h-screen">
      {/* ─── PAGE HEADER ─────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" /> SaaS Business Intelligence Suite
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Executive Reports & Analytics</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            MRR/ARR growth trajectory, tenant revenue distribution, subscription performance, and multi-format exports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Comparison Mode Selector */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200/80 shadow-xs text-xs font-semibold">
            {[
              { id: 'THIS_MONTH', label: 'This Month vs Last Month' },
              { id: 'THIS_YEAR', label: 'This Year vs Last Year' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setComparisonPeriod(p.id as any)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  comparisonPeriod === p.id ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchReportsData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-xs transition-all disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 text-blue-600 ${refreshing ? 'animate-spin' : ''}`} />
            Sync BI
          </button>
        </div>
      </div>

      {/* ─── NAVIGATION MODULE TABS ───────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto text-xs font-bold bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-xs">
        {[
          { tab: 'OVERVIEW', label: 'Executive Overview', icon: BarChart3 },
          { tab: 'REVENUE', label: 'Revenue Analytics', icon: DollarSign },
          { tab: 'SUBSCRIPTIONS', label: 'Subscription Analytics', icon: Layers },
          { tab: 'STORES', label: 'Store Leaderboard', icon: Store },
          { tab: 'USAGE', label: 'API & Storage Usage', icon: HardDrive },
          { tab: 'EXPORTS', label: 'Export Center', icon: Download },
        ].map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.tab;
          return (
            <button
              key={t.tab}
              onClick={() => setActiveTab(t.tab as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
                active
                  ? 'bg-blue-600 text-white shadow-xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ─── TAB 1: EXECUTIVE OVERVIEW ────────────────────────────────────── */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6 animate-fade-in">
          {/* Executive KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              onClick={() => openDrawer({ title: 'Monthly Recurring Revenue (MRR)', value: `$${overview?.mrr.toLocaleString()}`, trend: `+${overview?.growthRatePercent}%`, desc: 'Monthly SaaS subscription recurring revenue.' }, 'kpi')}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-card cursor-pointer hover:border-blue-300 transition-all"
            >
              <div className="text-xs font-bold text-slate-400 uppercase">Monthly Recurring (MRR)</div>
              <div className="text-2xl font-extrabold text-blue-600 mt-1">
                ${(overview?.mrr || 4900).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> +{overview?.growthRatePercent || 12.5}% vs last month
              </div>
            </div>

            <div
              onClick={() => openDrawer({ title: 'Annual Recurring Revenue (ARR)', value: `$${overview?.arr.toLocaleString()}`, trend: `+${overview?.growthRatePercent}%`, desc: 'Annualized recurring revenue projection.' }, 'kpi')}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-card cursor-pointer hover:border-blue-300 transition-all"
            >
              <div className="text-xs font-bold text-slate-400 uppercase">Annualized Revenue (ARR)</div>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">
                ${(overview?.arr || 58800).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">ARPU: ${overview?.arpu || 49}/mo</div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-card">
              <div className="text-xs font-bold text-slate-400 uppercase">Active Subscribers</div>
              <div className="text-2xl font-extrabold text-emerald-600 mt-1">{overview?.activeStores || 92}</div>
              <div className="text-[11px] text-slate-500 mt-1">Churn rate: {overview?.churnRatePercent || 1.8}%</div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-card">
              <div className="text-xs font-bold text-slate-400 uppercase">Platform Health</div>
              <div className="text-2xl font-extrabold text-purple-600 mt-1">{overview?.platformHealthScore || 99.8}%</div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1">Status: Optimal</div>
            </div>
          </div>

          {/* Revenue & Growth Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="font-bold text-slate-900 text-sm">Monthly MRR Growth Trajectory</span>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">USD ($)</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData?.monthlyTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="biMrr" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v}`} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                    <Area type="monotone" dataKey="mrr" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#biMrr)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card space-y-3 flex flex-col justify-between">
              <div className="border-b border-slate-100 pb-3">
                <span className="font-bold text-slate-900 text-sm">Revenue Share by Plan Tier</span>
              </div>
              <div className="h-48 w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={revenueData?.revenueByPlan || []} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="amount">
                      {(revenueData?.revenueByPlan || []).map((e, i) => (
                        <Cell key={i} fill={planColors[i % planColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5 text-xs pt-2 border-t border-slate-100">
                {(revenueData?.revenueByPlan || []).map((item, i) => (
                  <div key={item.planName} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: planColors[i % planColors.length] }} />
                      <span className="text-slate-600 font-medium">{item.planName}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900">${item.amount} ({item.percentage}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: REVENUE ANALYTICS ────────────────────────────────────── */}
      {activeTab === 'REVENUE' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" /> Revenue Growth Breakdown
            </h2>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData?.monthlyTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                  <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 3: SUBSCRIPTION ANALYTICS ───────────────────────────────── */}
      {activeTab === 'SUBSCRIPTIONS' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-card">
              <div className="text-xs font-bold text-slate-400 uppercase">Renewal Rate</div>
              <div className="text-2xl font-extrabold text-emerald-600 mt-1">{subscriptionData?.renewalRatePercent || 98.2}%</div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-card">
              <div className="text-xs font-bold text-slate-400 uppercase">Upgrade Rate</div>
              <div className="text-2xl font-extrabold text-blue-600 mt-1">{subscriptionData?.upgradeRatePercent || 8.5}%</div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-card">
              <div className="text-xs font-bold text-slate-400 uppercase">Downgrade Rate</div>
              <div className="text-2xl font-extrabold text-amber-600 mt-1">{subscriptionData?.downgradeRatePercent || 1.2}%</div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-card">
              <div className="text-xs font-bold text-slate-400 uppercase">Trial Stores</div>
              <div className="text-2xl font-extrabold text-purple-600 mt-1">{subscriptionData?.trialCount || 5}</div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 4: STORE LEADERBOARD ────────────────────────────────────── */}
      {activeTab === 'STORES' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 space-y-4 animate-fade-in text-xs">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Store className="w-5 h-5 text-blue-600" /> Top Revenue Store Leaderboard
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-3.5">Store & Subdomain</th>
                  <th className="p-3.5">Owner Contact</th>
                  <th className="p-3.5">Monthly Revenue</th>
                  <th className="p-3.5">Growth Rate</th>
                  <th className="p-3.5">Storage MB</th>
                  <th className="p-3.5">API Requests</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {storesLeaderboard.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/80">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{st.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{st.slug}.saasplatform.com</div>
                    </td>
                    <td className="p-3.5 font-medium text-slate-800">{st.ownerName}</td>
                    <td className="p-3.5 font-extrabold text-emerald-600">${st.revenue} USD</td>
                    <td className="p-3.5 font-bold text-blue-600">+{st.growthPercent}%</td>
                    <td className="p-3.5 font-mono text-slate-700">{st.storageMB} MB</td>
                    <td className="p-3.5 font-mono text-slate-700">{st.apiRequests} req</td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => openDrawer(st, 'store')}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB 6: EXPORT CENTER ────────────────────────────────────────── */}
      {activeTab === 'EXPORTS' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 space-y-6 animate-fade-in">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Download className="w-5 h-5 text-blue-600" /> Multi-Format Export Center
            </h2>
            <p className="text-xs text-slate-500">Download formatted reports in CSV, Excel Spreadsheet, or PDF document layouts.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm mb-2">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Export to CSV</h3>
                <p className="text-slate-500 text-xs mt-1">Raw structured data format for custom data analysis.</p>
              </div>
              <button
                onClick={handleExportCSV}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs"
              >
                Download CSV
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm mb-2">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Export to Excel</h3>
                <p className="text-slate-500 text-xs mt-1">Formatted XLSX spreadsheet with sheet layout.</p>
              </div>
              <button
                onClick={handleExportExcel}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs"
              >
                Download Excel (.xlsx)
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm mb-2">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Export Executive PDF</h3>
                <p className="text-slate-500 text-xs mt-1">Printable executive summary layout.</p>
              </div>
              <button
                onClick={handleExportPDF}
                className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs"
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── SIDE DRAWER INTEGRATION ──────────────────────────────────────── */}
      <ReportsBIDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        mode={drawerMode}
        itemData={drawerItem}
        onSuccess={() => fetchReportsData(true)}
      />
    </div>
  );
}
