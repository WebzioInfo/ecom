import React, { useEffect, useState } from 'react';
import { storesApi } from '../api/stores.api';
import { plansApi } from '../api/plans.api';
import { supportApi } from '../api/support.api';
import { Store, Layers, MessageSquare, ShieldCheck, Activity, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SuperAdminDashboardPage() {
  const navigate = useNavigate();
  const [storeCount, setStoreCount] = useState<number>(0);
  const [planCount, setPlanCount] = useState<number>(0);
  const [ticketCount, setTicketCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const [stores, plans, tickets] = await Promise.all([
          storesApi.getAll(),
          plansApi.getAll(),
          supportApi.getGlobalTickets(),
        ]);
        const storeList = Array.isArray(stores) ? stores : (stores as any).data || [];
        const planList = Array.isArray(plans) ? plans : (plans as any).data || [];
        setStoreCount(storeList.length);
        setPlanCount(planList.length);
        setTicketCount(tickets.length);
      } catch (err) {
        console.error('Failed to load Super Admin metrics', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadMetrics();
  }, []);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" /> Platform Control Center
          </div>
          <h1 className="text-2xl font-bold text-white">Super Admin Dashboard</h1>
          <p className="text-sm text-slate-400">Global SaaS ecosystem overview and platform management.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/stores')}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Manage Stores
          </button>
          <button
            onClick={() => navigate('/admin/plans')}
            className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium border border-slate-700 transition-colors"
          >
            SaaS Plans
          </button>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div 
          onClick={() => navigate('/admin/stores')}
          className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-indigo-950/60 border border-indigo-800/50 text-indigo-400 group-hover:scale-105 transition-transform">
              <Store className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/40">Active</span>
          </div>
          <div className="text-3xl font-extrabold text-white mb-1">{isLoading ? '...' : storeCount}</div>
          <div className="text-xs font-medium text-slate-400">Registered SaaS Stores</div>
        </div>

        <div 
          onClick={() => navigate('/admin/plans')}
          className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-800/50 text-purple-400 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-purple-400 bg-purple-950/50 px-2 py-0.5 rounded border border-purple-800/40">Public</span>
          </div>
          <div className="text-3xl font-extrabold text-white mb-1">{isLoading ? '...' : planCount}</div>
          <div className="text-xs font-medium text-slate-400">Active Subscription Plans</div>
        </div>

        <div 
          onClick={() => navigate('/admin/support')}
          className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-800/50 text-amber-400 group-hover:scale-105 transition-transform">
              <MessageSquare className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-amber-400 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-800/40">Live</span>
          </div>
          <div className="text-3xl font-extrabold text-white mb-1">{isLoading ? '...' : ticketCount}</div>
          <div className="text-xs font-medium text-slate-400">Support Conversations</div>
        </div>

        <div 
          onClick={() => navigate('/admin/system')}
          className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/40">Healthy</span>
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 mb-1">99.9%</div>
          <div className="text-xs font-medium text-slate-400">Platform Uptime</div>
        </div>
      </div>

      {/* QUICK ACTIONS & ARCHITECTURE Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" /> System Control Shortcuts
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/admin/stores')}
              className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500 text-left text-sm text-slate-300 font-medium transition-colors"
            >
              🏢 Provision / Manage Stores
            </button>
            <button
              onClick={() => navigate('/admin/plans')}
              className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500 text-left text-sm text-slate-300 font-medium transition-colors"
            >
              💳 Manage Pricing & Plans
            </button>
            <button
              onClick={() => navigate('/admin/support')}
              className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500 text-left text-sm text-slate-300 font-medium transition-colors"
            >
              💬 Global Support Tickets
            </button>
            <button
              onClick={() => navigate('/admin/system')}
              className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500 text-left text-sm text-slate-300 font-medium transition-colors"
            >
              ⚡ System Health & Monitoring
            </button>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" /> Platform Security & Scope Isolation
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            You are logged in with full <span className="text-indigo-400 font-bold">SUPER_ADMIN</span> privileges. 
            Your portal manages global platform operations (`/admin/*`). Tenant business data is strictly isolated within schema-per-tenant PostgreSQL database bounds.
          </p>
          <div className="pt-2 text-xs text-slate-500">
            Current Environment: <span className="text-slate-300 font-mono">Production (PostgreSQL 15 Multi-Tenant)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
