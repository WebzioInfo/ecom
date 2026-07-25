import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Edit2,
  Trash2,
  Shield,
  Copy,
  Search,
  CheckCircle,
  Users,
  Layers,
  Sparkles,
  ArrowRight,
  Filter,
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
    } catch (err) {
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
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await plansApi.duplicate(id);
      toast.success('Plan duplicated successfully!');
      fetchPlans();
    } catch (err) {
      toast.error('Failed to duplicate plan');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Archive this subscription plan?')) return;
    try {
      await plansApi.delete(id);
      toast.success('Plan archived successfully');
      fetchPlans();
    } catch (err) {
      toast.error('Failed to delete plan');
    }
  };

  const filteredPlans = plans.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" /> Global Monetization & Tiers
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            SaaS Subscription Plans
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Configure pricing tiers, resource quotas, feature access, and tenant subscription limits.
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/plans/new')}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          Create New Plan
        </button>
      </div>

      {/* FILTER & TOOLBAR */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-900/80 p-4 border border-slate-800 rounded-2xl">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search plans by name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500 ml-2" />
          {(['ALL', 'ACTIVE', 'INACTIVE', 'ARCHIVED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl uppercase transition-colors ${
                statusFilter === status
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* PLANS TABLE */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Plan & Code</th>
                <th className="p-4">Pricing & Cycle</th>
                <th className="p-4">Resource Limits</th>
                <th className="p-4">Active Subscribers</th>
                <th className="p-4">Status & Badges</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Loading subscription plans...
                  </td>
                </tr>
              ) : filteredPlans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No subscription plans found.
                  </td>
                </tr>
              ) : (
                filteredPlans.map((plan) => {
                  const pId = getPlanId(plan);
                  const isActive = plan.status === 'ACTIVE';

                  return (
                    <tr key={pId} className="hover:bg-slate-800/40 transition-colors">
                      {/* PLAN NAME & CODE */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-sm shrink-0">
                            <Layers className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm flex items-center gap-2">
                              {plan.name}
                              {plan.popularBadge && (
                                <span className="bg-purple-950 text-purple-400 border border-purple-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase">
                                  Popular
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">{plan.code}</div>
                          </div>
                        </div>
                      </td>

                      {/* PRICING */}
                      <td className="p-4">
                        <div className="font-bold text-emerald-400 text-sm">
                          ${plan.monthlyPrice} <span className="text-[10px] text-slate-400 font-normal">/ mo</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          ${plan.yearlyPrice} / yr &bull; {plan.trialDays} Days Trial
                        </div>
                      </td>

                      {/* LIMITS */}
                      <td className="p-4">
                        <div className="font-semibold text-slate-200">
                          {plan.limits?.maxProducts || 100} Products &bull; {plan.limits?.maxOrders || 1000} Orders
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {plan.limits?.maxStorageMB || 500} MB Storage &bull; {plan.limits?.maxStaff || 2} Staff
                        </div>
                      </td>

                      {/* SUBSCRIBERS */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-slate-200 font-bold">
                          <Users className="w-4 h-4 text-indigo-400" />
                          <span>{plan.subscriberCount || 0} Active Tenants</span>
                        </div>
                      </td>

                      {/* STATUS */}
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                            isActive
                              ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                              : plan.status === 'ARCHIVED'
                              ? 'bg-slate-800 text-slate-400 border-slate-700'
                              : 'bg-rose-950 text-rose-400 border-rose-800'
                          }`}
                        >
                          {plan.status}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDuplicate(pId)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                            title="Duplicate Plan"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/admin/plans/${pId}/edit`)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white transition-colors"
                            title="Edit Plan"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(pId, plan.status)}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              isActive
                                ? 'bg-rose-950/40 text-rose-400 border-rose-900/40 hover:bg-rose-900'
                                : 'bg-emerald-950/40 text-emerald-400 border-emerald-900/40 hover:bg-emerald-900'
                            }`}
                            title={isActive ? 'Deactivate Plan' : 'Activate Plan'}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(pId)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900 text-slate-400 hover:text-rose-300 transition-colors"
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
