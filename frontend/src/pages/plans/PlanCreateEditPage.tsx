import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Shield, ArrowLeft, Save, Loader2, Layers, CheckSquare, Sparkles } from 'lucide-react';
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
    trialDays: 14,
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' | 'ARCHIVED',
    popularBadge: false,
    recommendedBadge: false,
    limits: {
      maxProducts: 100,
      maxCategories: 20,
      maxOrders: 1000,
      maxCustomers: 1000,
      maxStaff: 3,
      maxWarehouses: 1,
      maxStorageMB: 1000,
      maxApiRequestsPerMonth: 50000,
      maxIntegrations: 5,
    },
    features: {
      customDomain: true,
      apiAccess: true,
      webhooks: true,
      advancedAnalytics: false,
      customReports: false,
      coupons: true,
      productReviews: true,
      advancedInventory: false,
      multiWarehouse: false,
      marketingTools: true,
      advancedShipping: false,
      multiplePaymentGateways: true,
      staffManagement: true,
      auditLogs: false,
      aiFeatures: false,
    },
    displayOrder: 0,
  });

  useEffect(() => {
    if (isEditMode && id) {
      plansApi
        .getOne(id)
        .then((data) => {
          setFormData({
            name: data.name || '',
            code: data.code || '',
            description: data.description || '',
            monthlyPrice: data.monthlyPrice || 0,
            yearlyPrice: data.yearlyPrice || 0,
            currency: data.currency || 'USD',
            trialDays: data.trialDays ?? 14,
            status: data.status || 'ACTIVE',
            popularBadge: Boolean(data.popularBadge),
            recommendedBadge: Boolean(data.recommendedBadge),
            limits: {
              maxProducts: data.limits?.maxProducts ?? 100,
              maxCategories: data.limits?.maxCategories ?? 20,
              maxOrders: data.limits?.maxOrders ?? 1000,
              maxCustomers: data.limits?.maxCustomers ?? 1000,
              maxStaff: data.limits?.maxStaff ?? 3,
              maxWarehouses: data.limits?.maxWarehouses ?? 1,
              maxStorageMB: data.limits?.maxStorageMB ?? 1000,
              maxApiRequestsPerMonth: data.limits?.maxApiRequestsPerMonth ?? 50000,
              maxIntegrations: data.limits?.maxIntegrations ?? 5,
            },
            features: {
              customDomain: Boolean(data.features?.customDomain),
              apiAccess: Boolean(data.features?.apiAccess),
              webhooks: Boolean(data.features?.webhooks),
              advancedAnalytics: Boolean(data.features?.advancedAnalytics),
              customReports: Boolean(data.features?.customReports),
              coupons: Boolean(data.features?.coupons),
              productReviews: Boolean(data.features?.productReviews),
              advancedInventory: Boolean(data.features?.advancedInventory),
              multiWarehouse: Boolean(data.features?.multiWarehouse),
              marketingTools: Boolean(data.features?.marketingTools),
              advancedShipping: Boolean(data.features?.advancedShipping),
              multiplePaymentGateways: Boolean(data.features?.multiplePaymentGateways),
              staffManagement: Boolean(data.features?.staffManagement),
              auditLogs: Boolean(data.features?.auditLogs),
              aiFeatures: Boolean(data.features?.aiFeatures),
            },
            displayOrder: data.displayOrder || 0,
          });
          setLoading(false);
        })
        .catch(() => {
          toast.error('Failed to load plan details');
          navigate('/admin/plans');
        });
    }
  }, [id, isEditMode, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    let finalValue: any = value;
    if (type === 'number') finalValue = Number(value);
    if (type === 'checkbox') finalValue = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({ ...prev, [name]: finalValue }));
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      limits: { ...prev.limits, [name]: Number(value) },
    }));
  };

  const handleFeatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      features: { ...prev.features, [name]: checked },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEditMode && id) {
        await plansApi.update(id, formData);
        toast.success('SaaS Plan updated successfully!');
      } else {
        await plansApi.create(formData);
        toast.success('New SaaS Plan created successfully!');
      }
      navigate('/admin/plans');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save plan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-slate-400 p-8 text-sm">Loading plan configuration...</div>;

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-12">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/plans')}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <Layers className="w-6 h-6 text-indigo-400" />
              {isEditMode ? 'Edit Subscription Plan' : 'Create New Subscription Plan'}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Configure pricing, quota limits, and feature toggles for tenant stores.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* GENERAL & PRICING INFO */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" /> General Information & Pricing Tiers
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Plan Name</label>
              <input
                required
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Growth Pro Tier"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Plan Code (Unique Code)</label>
              <input
                required
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                disabled={isEditMode}
                placeholder="growth-pro"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50 font-mono"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Plan Description</label>
              <textarea
                required
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={2}
                placeholder="Detailed plan description shown on pricing page..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Monthly Price ($ USD)</label>
              <input
                required
                type="number"
                min="0"
                name="monthlyPrice"
                value={formData.monthlyPrice}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Yearly Price ($ USD)</label>
              <input
                required
                type="number"
                min="0"
                name="yearlyPrice"
                value={formData.yearlyPrice}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Trial Period Days</label>
              <input
                required
                type="number"
                min="0"
                name="trialDays"
                value={formData.trialDays}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Plan Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-bold"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 pt-3">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                name="popularBadge"
                checked={formData.popularBadge}
                onChange={handleChange}
                className="rounded border-slate-800 text-indigo-600 focus:ring-indigo-500"
              />
              Display "Popular" Badge
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                name="recommendedBadge"
                checked={formData.recommendedBadge}
                onChange={handleChange}
                className="rounded border-slate-800 text-indigo-600 focus:ring-indigo-500"
              />
              Display "Recommended" Badge
            </label>
          </div>
        </div>

        {/* RESOURCE LIMITS */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-emerald-400" /> Quotas & Resource Limitations
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.keys(formData.limits).map((key) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-slate-400 mb-1 capitalize">
                  {key.replace(/max/g, '').replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <input
                  required
                  type="number"
                  min="0"
                  name={key}
                  value={(formData.limits as any)[key]}
                  onChange={handleLimitChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* FEATURE TOGGLES */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-400" /> Feature Access Toggles
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-y-3 gap-x-6">
            {Object.keys(formData.features).map((key) => (
              <label
                key={key}
                className="flex items-center gap-3 text-xs text-slate-300 hover:text-white cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  name={key}
                  checked={(formData.features as any)[key]}
                  onChange={handleFeatureChange}
                  className="w-4 h-4 rounded border-slate-800 text-indigo-600 focus:ring-indigo-500 bg-slate-950"
                />
                <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
              </label>
            ))}
          </div>
        </div>

        {/* FORM ACTIONS */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={() => navigate('/admin/plans')}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold rounded-xl transition-colors text-sm border border-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition-all text-sm"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isEditMode ? 'Save Changes' : 'Create SaaS Plan'}
          </button>
        </div>
      </form>
    </div>
  );
}
