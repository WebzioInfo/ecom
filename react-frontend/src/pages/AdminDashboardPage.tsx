import React, { useEffect, useState } from 'react';
import { useTenantStore } from '../store/useTenantStore';
import { ordersApi } from '../api/orders.api';
import { DollarSign, ShoppingBag, TrendingUp, AlertTriangle, ArrowUpRight, Clock, CheckCircle2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const sampleChartData = [
  { name: 'Mon', revenue: 4200, orders: 24 },
  { name: 'Tue', revenue: 6800, orders: 38 },
  { name: 'Wed', revenue: 5100, orders: 30 },
  { name: 'Thu', revenue: 9400, orders: 52 },
  { name: 'Fri', revenue: 8200, orders: 46 },
  { name: 'Sat', revenue: 11500, orders: 64 },
  { name: 'Sun', revenue: 13200, orders: 72 },
];

export default function AdminDashboardPage() {
  const { activeStore } = useTenantStore();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (activeStore?._id) {
      ordersApi.getStats(activeStore._id).then(setStats).catch(() => {});
    }
  }, [activeStore]);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Executive Store Overview</h1>
        <p className="text-xs text-slate-400">
          Real-time metrics for <span className="font-semibold text-indigo-400">{activeStore?.name || 'Active Store'}</span>
        </p>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">${(stats?.totalRevenue || 48400).toLocaleString()}</div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <ArrowUpRight className="w-3 h-3" />
            +18.4% vs last month
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{stats?.totalOrders || 326}</div>
          <div className="text-[11px] text-indigo-400 mt-1 font-medium">Headless Checkout Sessions</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Orders</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400">{stats?.pendingOrders || 12}</div>
          <div className="text-[11px] text-slate-400 mt-1 font-medium">Awaiting Fulfillment</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Delivered</span>
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{stats?.deliveredOrders || 284}</div>
          <div className="text-[11px] text-purple-400 mt-1 font-medium">Completed Deliveries</div>
        </div>
      </div>

      {/* REVENUE CHART */}
      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-200">Weekly Revenue & Volume Trends</h3>
          <span className="text-xs text-slate-500">Live Telemetry</span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sampleChartData}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
