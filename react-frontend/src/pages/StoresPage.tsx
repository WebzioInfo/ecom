import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storesApi, Store } from '../api/stores.api';
import { plansApi, Plan } from '../api/plans.api';
import { useAuthStore } from '../store/useAuthStore';
import { Plus, Search, CheckCircle, Store as StoreIcon, ShieldAlert, ArrowRight, Eye, MoreVertical } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function StoresPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stores, setStores] = useState<Store[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [storesRes, plansData] = await Promise.all([
        storesApi.getAll({ search, status: selectedStatus, limit: 50 }),
        plansApi.getAll()
      ]);
      setStores(storesRes.data);
      setPlans(plansData);
      if (plansData.length > 0 && !selectedPlanId) setSelectedPlanId(plansData[0]._id);
    } catch (err: any) {
      toast.error('Failed to load stores data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, selectedStatus]);

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await storesApi.create({
        name,
        slug: slug.toLowerCase().replace(/\s+/g, '-'),
        subscription: { planId: selectedPlanId, status: 'TRIAL' },
        ownerId: user?.id || '',
      });
      toast.success('Store provisioned successfully!');
      setShowModal(false);
      setName('');
      setSlug('');
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create store');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* TITLE & ACTIONS */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <StoreIcon className="w-6 h-6 text-emerald-400" />
            Client Store Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">Provision, manage, and monitor all platform tenants.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold text-white shadow-md shadow-emerald-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          Create New Store
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search stores by name or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-800/60 border border-slate-700/60 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2 bg-slate-800/60 border border-slate-700/60 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition w-full sm:w-48"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* STORES TABLE */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase bg-slate-800/80 text-slate-400 border-b border-slate-700">
              <tr>
                <th className="px-6 py-4 font-semibold">Store</th>
                <th className="px-6 py-4 font-semibold">Owner</th>
                <th className="px-6 py-4 font-semibold">Plan & Usage</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading stores...</td></tr>
              ) : stores.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No stores found.</td></tr>
              ) : (
                stores.map((st) => (
                  <tr key={st._id} className="hover:bg-slate-800/30 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                          {st.name[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-200">{st.name}</div>
                          <div className="text-xs text-slate-500">{st.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-300">{st.ownerId?.name || 'Unknown'}</div>
                      <div className="text-xs text-slate-500">{st.ownerId?.email || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs space-y-1">
                        <div>Plan: <span className="font-semibold text-indigo-400">{plans.find(p => p._id === st.subscription?.planId)?.name || 'Custom'}</span></div>
                        <div>Storage: <span className="text-slate-200">{st.storageUsedMB || 0} MB</span></div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                        st.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                        st.status === 'suspended' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 
                        'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {st.status === 'active' ? <CheckCircle className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                        {st.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => navigate(`/super-admin/stores/${st._id}`)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg text-xs font-semibold transition"
                      >
                        <Eye className="w-3 h-3" />
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE STORE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-bold text-white">Provision New Client Store</h2>
            <form onSubmit={handleCreateStore} className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 block mb-1">Store Name</label>
                <input required type="text" value={name} onChange={(e) => { setName(e.target.value); setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')); }} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:border-emerald-500" />
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-1">Store Slug (Identifier)</label>
                <input required type="text" value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:border-emerald-500" />
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-1">Subscription Plan</label>
                <select value={selectedPlanId} onChange={(e) => setSelectedPlanId(e.target.value)} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:border-emerald-500">
                  {plans.map(p => (
                    <option key={p._id} value={p._id}>{p.name} (${p.monthlyPrice}/mo)</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-500">Provision Store</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
