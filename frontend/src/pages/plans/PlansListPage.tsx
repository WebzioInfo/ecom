import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Edit2,
  Trash2,
  Copy,
  Search,
  CheckCircle,
  Users,
  Layers,
  Sparkles,
  Filter,
  Check,
  Building,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { plansApi, Plan, getPlanId } from '../../api/plans.api';

export default function PlansListPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlans();
  }, [statusFilter]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const queryStatus = statusFilter === 'ALL' ? undefined : statusFilter;
      const data = await plansApi.getAll(queryStatus);
      setPlans(data || []);
    } catch {
      toast.error('Failed to load subscription plans');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await plansApi.setStatus(id, newStatus);
      toast.success(`Plan status changed to ${newStatus}`);
      fetchPlans();
    } catch {
      toast.error('Failed to update plan status');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await plansApi.duplicate(id);
      toast.success('Plan duplicated successfully');
      fetchPlans();
    } catch {
      toast.error('Failed to duplicate plan');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Archive this subscription plan tier?')) return;
    try {
      await plansApi.delete(id);
      toast.success('Plan archived successfully');
      fetchPlans();
    } catch {
      toast.error('Failed to archive plan');
    }
  };

  const filteredPlans = plans.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1700px] mx-auto text-slate-900 bg-slate-50/60 min-h-screen">
      {/* ─── PAGE HEADER ─────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 text-purple-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" /> Global Monetization & Tiers
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">SaaS Subscription Plans</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Configure pricing tiers, resource quotas, feature access flags, and store limits.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => fetchPlans()}
            className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-xs transition-all"
          >
            <RefreshCw className="w-4 h-4 text-purple-600" /> Refresh
          </button>

          <button
            onClick={() => navigate('/admin/plans/new')}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" /> Create New Plan
          </button>
        </div>
      </div>

      {/* ─── FILTER & TOOLBAR ────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-card flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search plans by name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          {(['ALL', 'ACTIVE', 'INACTIVE', 'ARCHIVED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === status
                  ? 'bg-white text-purple-600 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* ─── PLANS ENTERPRISE TABLE ───────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-4">Plan & Code</th>
                <th className="p-4">Pricing & Cycle</th>
                <th className="p-4">Resource Quotas</th>
                <th className="p-4">Subscribers</th>
                <th className="p-4">Status & Badges</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="p-4">
                      <div className="h-10 bg-slate-100 rounded-xl" />
                    </td>
                  </tr>
                ))
              ) : filteredPlans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400">
                    <Layers className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    No subscription plans found.
                  </td>
                </tr>
              ) : (
                filteredPlans.map((plan) => {
                  const pId = getPlanId(plan);
                  const isActive = plan.status === 'ACTIVE';

                  return (
                    <tr key={pId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center font-bold text-sm shrink-0">
                            <Layers className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-2">
                              {plan.name}
                              {plan.popularBadge && (
                                <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  Popular
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">{plan.code}</div>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-extrabold text-slate-900 text-sm">
                          ${plan.monthlyPrice} <span className="text-xs text-slate-400 font-normal">/ mo</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          ${plan.yearlyPrice} / yr &bull; {plan.trialDays} Days Trial
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-semibold text-slate-800">
                          {plan.limits?.maxProducts || 100} Products &bull; {plan.limits?.maxOrders || 1000} Orders
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {plan.limits?.maxStorageMB || 500} MB Storage &bull; {plan.limits?.maxStaff || 2} Staff Seats
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900">
                          <Users className="w-4 h-4 text-purple-600" />
                          <span>{plan.subscriberCount || 0} Stores</span>
                        </div>
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {plan.status}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleDuplicate(pId)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                            title="Duplicate Plan"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/admin/plans/${pId}/edit`)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-purple-50 text-purple-600 transition-colors"
                            title="Edit Plan"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(pId)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-rose-600 transition-colors"
                            title="Archive Plan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
