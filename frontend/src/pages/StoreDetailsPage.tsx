import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { storesApi, Store } from '../api/stores.api';
import { plansApi, Plan } from '../api/plans.api';
import { ArrowLeft, Store as StoreIcon, CreditCard, Activity, Users, Settings, Package, ShoppingCart, ShieldAlert } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function StoreDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [store, setStore] = useState<Store | null>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (id) loadData(id);
  }, [id]);

  const loadData = async (storeId: string) => {
    try {
      setLoading(true);
      const [details, plansData] = await Promise.all([
        storesApi.getFullDetails(storeId),
        plansApi.getAll()
      ]);
      setStore(details.store);
      setMetrics(details.metrics);
      setPlans(plansData);
    } catch (err) {
      toast.error('Failed to load store details');
      navigate('/super-admin/stores');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!store) return;
    try {
      if (store.status === 'active') {
        if (!window.confirm('Are you sure you want to suspend this store?')) return;
        await storesApi.suspend(store._id);
        toast.success('Store suspended');
      } else {
        await storesApi.activate(store._id);
        toast.success('Store activated');
      }
      loadData(store._id);
    } catch (err) {
      toast.error('Failed to change status');
    }
  };

  const handleChangePlan = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!store || !window.confirm('Change this store\'s plan?')) return;
    try {
      await storesApi.changePlan(store._id, e.target.value);
      toast.success('Subscription plan updated');
      loadData(store._id);
    } catch (err) {
      toast.error('Failed to change plan');
    }
  };

  if (loading) return <div className="p-6 text-slate-400">Loading store details...</div>;
  if (!store) return null;

  const currentPlanId = typeof store.subscription?.planId === 'object' 
    ? store.subscription?.planId?._id 
    : store.subscription?.planId;
  const currentPlan = plans.find(p => p._id === currentPlanId);

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto pb-12">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/super-admin/stores')}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <StoreIcon className="w-6 h-6 text-emerald-400" />
              {store.name}
            </h1>
            <p className="text-sm text-slate-400 mt-1">{store.slug} • Created {new Date(store.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleToggleStatus}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              store.status === 'active' 
                ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30' 
                : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30'
            }`}
          >
            {store.status === 'active' ? 'Suspend Store' : 'Activate Store'}
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {['overview', 'products', 'orders', 'staff', 'subscription', 'activity'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition ${
              activeTab === tab ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-sm mb-2">Total Revenue</div>
              <div className="text-3xl font-bold text-white">${metrics?.totalRevenue?.toLocaleString()}</div>
            </div>
            <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-sm mb-2">Products</div>
              <div className="text-3xl font-bold text-white">{store.productCount || 0}</div>
            </div>
            <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-sm mb-2">Orders</div>
              <div className="text-3xl font-bold text-white">{store.orderCount || 0}</div>
            </div>
            <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-sm mb-2">Storage Used</div>
              <div className="text-3xl font-bold text-white">{store.storageUsedMB || 0} MB</div>
            </div>
          </div>
          <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
            <h2 className="text-lg font-bold text-white mb-4">Owner Information</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-slate-400">Name:</span> <span className="text-slate-200">{store.ownerId?.name}</span></div>
              <div><span className="text-slate-400">Email:</span> <span className="text-slate-200">{store.ownerId?.email}</span></div>
              <div><span className="text-slate-400">Account Status:</span> <span className="text-slate-200">{store.ownerId?.status}</span></div>
              <div><span className="text-slate-400">Last Login:</span> <span className="text-slate-200">{store.ownerId?.lastLogin ? new Date(store.ownerId.lastLogin).toLocaleString() : 'Never'}</span></div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'subscription' && (
        <div className="space-y-6">
          <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-white">Current Plan: {currentPlan?.name || 'Custom / None'}</h2>
              <p className="text-slate-400 text-sm mt-1">Status: {store.subscription?.status}</p>
              {store.subscription?.renewalDate && (
                <p className="text-slate-400 text-sm">Renewal: {new Date(store.subscription.renewalDate).toLocaleDateString()}</p>
              )}
            </div>
            <div>
              <select
                value={currentPlanId || ''}
                onChange={handleChangePlan}
                className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:border-emerald-500"
              >
                <option value="">Select new plan</option>
                {plans.map(p => (
                  <option key={p._id} value={p._id}>{p.name} (${p.monthlyPrice})</option>
                ))}
              </select>
            </div>
          </div>

          {currentPlan && (
            <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
              <h2 className="text-lg font-bold text-white mb-4">Usage vs Limits</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Products</span>
                    <span className="text-slate-200">{store.productCount || 0} / {currentPlan.limits.maxProducts}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full" style={{ width: `${Math.min(100, ((store.productCount || 0) / currentPlan.limits.maxProducts) * 100)}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Storage</span>
                    <span className="text-slate-200">{store.storageUsedMB || 0} MB / {currentPlan.limits.maxStorageMB} MB</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full" style={{ width: `${Math.min(100, ((store.storageUsedMB || 0) / currentPlan.limits.maxStorageMB) * 100)}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Placeholders for other tabs for now, to be implemented as data allows */}
      {['products', 'orders', 'staff', 'activity'].includes(activeTab) && (
        <div className="bg-slate-900/50 p-12 rounded-xl border border-slate-800 text-center flex flex-col items-center justify-center">
          <Activity className="w-12 h-12 text-slate-600 mb-4" />
          <h2 className="text-xl font-bold text-slate-300 capitalize">{activeTab} Details</h2>
          <p className="text-slate-500 mt-2">This data is linked to the {activeTab} module and will populate once store data is generated.</p>
        </div>
      )}
    </div>
  );
}
