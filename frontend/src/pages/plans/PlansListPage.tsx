import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Shield, MoreVertical, Search, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { plansApi, Plan } from '../../api/plans.api';

export default function PlansListPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const data = await plansApi.getAll();
      setPlans(data);
    } catch (err) {
      toast.error('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await plansApi.setStatus(id, newStatus);
      toast.success(`Plan marked as ${newStatus}`);
      fetchPlans();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this plan?')) return;
    try {
      await plansApi.delete(id);
      toast.success('Plan deleted successfully');
      fetchPlans();
    } catch (err) {
      toast.error('Failed to delete plan');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Shield className="w-6 h-6 text-emerald-400" />
            Subscription Plans
          </h1>
          <p className="text-sm text-slate-400 mt-1">Manage global billing tiers and tenant limits.</p>
        </div>
        <button
          onClick={() => navigate('/super-admin/plans/create')}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          Create New Plan
        </button>
      </div>

      {/* SEARCH/FILTER BAR */}
      <div className="flex items-center gap-4 bg-slate-900/50 p-4 border border-slate-800 rounded-xl backdrop-blur-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search plans by name or code..."
            className="w-full pl-9 pr-4 py-2 bg-slate-800/60 border border-slate-700/60 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:outline-none transition"
          />
        </div>
      </div>

      {/* PLANS TABLE */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase bg-slate-800/80 text-slate-400 border-b border-slate-700">
              <tr>
                <th className="px-6 py-4 font-semibold">Plan Name</th>
                <th className="px-6 py-4 font-semibold">Pricing</th>
                <th className="px-6 py-4 font-semibold">Key Limits</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading plans...</td>
                </tr>
              ) : plans.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No plans found. Create one above.</td>
                </tr>
              ) : (
                plans.map((plan) => (
                  <tr key={plan._id} className="hover:bg-slate-800/30 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-200">{plan.name}</span>
                        {plan.popularBadge && (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">
                            POPULAR
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">{plan.code}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-300">${plan.monthlyPrice}/mo</div>
                      <div className="text-xs text-slate-500">${plan.yearlyPrice}/yr</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs space-y-1">
                        <div>Products: <span className="text-slate-200">{plan.limits.maxProducts}</span></div>
                        <div>Storage: <span className="text-slate-200">{plan.limits.maxStorageMB} MB</span></div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                          plan.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}
                      >
                        <CheckCircle className="w-3 h-3" />
                        {plan.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleStatus(plan._id, plan.status)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-medium transition border border-slate-700"
                        >
                          {plan.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => navigate(`/super-admin/plans/${plan._id}/edit`)}
                          className="p-1.5 text-slate-400 hover:text-emerald-400 transition"
                          title="Edit Plan"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(plan._id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 transition"
                          title="Delete Plan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
