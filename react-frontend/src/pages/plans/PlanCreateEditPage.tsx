import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Shield, ArrowLeft, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { plansApi, Plan } from '../../api/plans.api';

export default function PlanCreateEditPage() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    monthlyPrice: 0,
    yearlyPrice: 0,
    currency: 'USD',
    trialDays: 0,
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' | 'ARCHIVED',
    popularBadge: false,
    recommendedBadge: false,
    limits: {
      maxProducts: 100,
      maxCategories: 10,
      maxOrders: 1000,
      maxCustomers: 1000,
      maxStaff: 2,
      maxWarehouses: 1,
      maxStorageMB: 500,
      maxApiRequestsPerMonth: 10000,
      maxIntegrations: 2,
    },
    features: {
      customDomain: false,
      apiAccess: false,
      webhooks: false,
      advancedAnalytics: false,
      customReports: false,
      coupons: false,
      productReviews: false,
      advancedInventory: false,
      multiWarehouse: false,
      marketingTools: false,
      advancedShipping: false,
      multiplePaymentGateways: false,
      staffManagement: false,
      auditLogs: false,
      aiFeatures: false,
    },
    displayOrder: 0,
  });

  useEffect(() => {
    if (isEditMode && id) {
      plansApi.getOne(id).then(data => {
        setFormData({
          name: data.name,
          code: data.code,
          description: data.description,
          monthlyPrice: data.monthlyPrice,
          yearlyPrice: data.yearlyPrice,
          currency: data.currency,
          trialDays: data.trialDays,
          status: data.status,
          popularBadge: data.popularBadge,
          recommendedBadge: data.recommendedBadge,
          limits: data.limits,
          features: data.features,
          displayOrder: data.displayOrder,
        });
        setLoading(false);
      }).catch(() => {
        toast.error('Failed to load plan');
        navigate('/super-admin/plans');
      });
    }
  }, [id, isEditMode, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    let finalValue: any = value;
    if (type === 'number') finalValue = Number(value);
    if (type === 'checkbox') finalValue = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      limits: { ...prev.limits, [name]: Number(value) }
    }));
  };

  const handleFeatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      features: { ...prev.features, [name]: checked }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEditMode && id) {
        await plansApi.update(id, formData);
        toast.success('Plan updated successfully');
      } else {
        await plansApi.create(formData);
        toast.success('Plan created successfully');
      }
      navigate('/super-admin/plans');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save plan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-white p-6">Loading...</div>;

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-12">
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/super-admin/plans')}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Shield className="w-6 h-6 text-emerald-400" />
            {isEditMode ? 'Edit Subscription Plan' : 'Create Subscription Plan'}
          </h1>
          <p className="text-sm text-slate-400 mt-1">Configure pricing, limits, and feature toggles.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* GENERAL INFO */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-200 border-b border-slate-800 pb-2">General Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Plan Name</label>
              <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Plan Code (Unique)</label>
              <input required type="text" name="code" value={formData.code} onChange={handleChange} disabled={isEditMode} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-emerald-500 disabled:opacity-50" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
              <textarea required name="description" value={formData.description} onChange={handleChange} rows={2} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Monthly Price (USD)</label>
              <input required type="number" min="0" name="monthlyPrice" value={formData.monthlyPrice} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Yearly Price (USD)</label>
              <input required type="number" min="0" name="yearlyPrice" value={formData.yearlyPrice} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-emerald-500" />
            </div>
          </div>
          <div className="flex gap-6 pt-2">
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input type="checkbox" name="popularBadge" checked={formData.popularBadge} onChange={handleChange} className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500" />
              Show "Popular" Badge
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input type="checkbox" name="recommendedBadge" checked={formData.recommendedBadge} onChange={handleChange} className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500" />
              Show "Recommended" Badge
            </label>
          </div>
        </div>

        {/* LIMITS */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-200 border-b border-slate-800 pb-2">Resource Limits</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.keys(formData.limits).map((key) => (
              <div key={key}>
                <label className="block text-sm font-medium text-slate-400 mb-1 capitalize">{key.replace(/max/g, '').replace(/([A-Z])/g, ' $1').trim()}</label>
                <input required type="number" min="0" name={key} value={(formData.limits as any)[key]} onChange={handleLimitChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-emerald-500" />
              </div>
            ))}
          </div>
        </div>

        {/* FEATURES */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-200 border-b border-slate-800 pb-2">Feature Toggles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-6">
            {Object.keys(formData.features).map((key) => (
              <label key={key} className="flex items-center gap-3 text-sm text-slate-300 hover:text-white cursor-pointer transition">
                <input 
                  type="checkbox" 
                  name={key} 
                  checked={(formData.features as any)[key]} 
                  onChange={handleFeatureChange} 
                  className="w-4 h-4 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-800" 
                />
                <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
              </label>
            ))}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-4 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={() => navigate('/super-admin/plans')}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium rounded-lg transition"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isEditMode ? 'Save Changes' : 'Create Plan'}
          </button>
        </div>

      </form>
    </div>
  );
}
