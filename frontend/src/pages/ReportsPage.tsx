import React, { useState, useEffect } from 'react';
import { reportsApi } from '../api/reports.api';
import { BarChart3, Download, TrendingUp, ShoppingBag, DollarSign, Package, Users, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportsApi.getSummary()
      .then((res) => setData(res))
      .catch(() => toast.error('Failed to load reports summary'))
      .finally(() => setLoading(false));
  }, []);

  const handleExport = (type: string) => {
    window.open(reportsApi.getExportUrl(type), '_blank');
    toast.success(`Exporting ${type} CSV report...`);
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-500">Loading reports engine...</div>;
  }

  const metrics = data?.metrics || {};

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-400" /> Business Reports & Analytics
          </h1>
          <p className="text-sm text-slate-400">Tenant revenue performance, order volume metrics, and CSV export center.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('orders')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Orders CSV
          </button>
          <button
            onClick={() => handleExport('products')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Products CSV
          </button>
          <button
            onClick={() => handleExport('customers')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Customers CSV
          </button>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">${metrics.totalRevenue?.toLocaleString() || '0'}</p>
          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +14.2% from last month
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">{metrics.totalOrders || 0}</p>
          <span className="text-[10px] text-slate-400">Average Value: ${metrics.avgOrderValue || 0}</span>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Active Products</span>
            <Package className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">{metrics.totalProducts || 0}</p>
          <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> {metrics.lowStockAlerts || 0} low stock items
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Registered Customers</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">{metrics.totalCustomers || 0}</p>
          <span className="text-[10px] text-slate-400">Tenant Customer Registry</span>
        </div>
      </div>

      {/* MONTHLY BREAKDOWN & TOP CATEGORIES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
          <h3 className="text-base font-bold text-white">Monthly Sales Breakdown</h3>
          <div className="space-y-3">
            {(data?.monthlySales || []).map((item: any, idx: number) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-300">{item.month}</span>
                  <span className="font-mono text-emerald-400">${item.revenue?.toLocaleString()} ({item.orders} orders)</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full"
                    style={{ width: `${Math.min(100, (item.revenue / (metrics.totalRevenue || 1)) * 300)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
          <h3 className="text-base font-bold text-white">Top Product Categories</h3>
          <div className="space-y-3">
            {(data?.topCategories || []).map((cat: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-xs font-semibold text-slate-200">{cat.name}</span>
                <span className="text-xs font-extrabold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  {cat.count} items
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
