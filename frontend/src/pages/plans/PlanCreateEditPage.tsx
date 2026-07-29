import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Shield, ArrowLeft, Save, Loader2, Layers, CheckSquare, Sparkles, ToggleLeft, ToggleRight } from 'lucide-react';
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
    monthlyPrice: 49,
    yearlyPrice: 490,
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
      inventoryModule: true,
      reportsModule: true,
      automationModule: false,
      brandingModule: true,
      exportsModule: true,
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
            monthlyPrice: data.monthlyPrice || 49,
            yearlyPrice: data.yearlyPrice || 490,
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
              inventoryModule: Boolean((data.features as any)?.inventoryModule ?? true),
              reportsModule: Boolean((data.features as any)?.reportsModule ?? true),
              automationModule: Boolean((data.features as any)?.automationModule ?? false),
              brandingModule: Boolean((data.features as any)?.brandingModule ?? true),
              exportsModule: Boolean((data.features as any)?.exportsModule ?? true),
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

  const handleFeatureToggle = (key: string) => {
    setFormData((prev) => ({
      ...prev,
      features: { ...prev.features, [key]: !(prev.features as any)[key] },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEditMode && id) {
        await plansApi.update(id, formData);
        toast.success('Subscription plan updated successfully');
      } else {
        await plansApi.create(formData);
        toast.success('New subscription plan created successfully');
      }
      navigate('/admin/plans');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save plan');
    } fontId: '';
    setSaving(false);
  };

  if (loading) return <div className="text-slate-400 p-8 text-sm">Loading plan configuration editor...</div>;

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1200px] mx-auto text-slate-900 bg-slate-50/60 min-h-screen">
      {/* ─── HEADER ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/plans')}
            className="p-2.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className="w-6 h-6 text-purple-600" />
              {isEditMode ? 'Edit Plan Configuration' : 'Create Subscription Plan'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Set pricing, resource limits, and module permission feature flags.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 text-xs">
        {/* ─── GENERAL INFO & PRICING ──────────────────────────────────────── */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" /> General Details & Pricing Tiers
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Plan Name *</label>
              <input
                required
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Enterprise Tier"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Plan Code (Unique Identifier) *</label>
              <input
                required
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                disabled={isEditMode}
                placeholder="enterprise-tier"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:outline-none focus:border-purple-500 disabled:opacity-50"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Plan Description</label>
              <textarea
                required
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={2}
                placeholder="Detailed description shown on public pricing pages..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-purple-500 resize-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Monthly Price ($ USD)</label>
              <input
                required
                type="number"
                min="0"
                name="monthlyPrice"
                value={formData.monthlyPrice}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Yearly Price ($ USD)</label>
              <input
                required
                type="number"
                min="0"
                name="yearlyPrice"
                value={formData.yearlyPrice}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Free Trial Days</label>
              <input
                required
                type="number"
                min="0"
                name="trialDays"
                value={formData.trialDays}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Plan Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-purple-500"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </div>
          </div>
        </div>

        {/* ─── RESOURCE LIMITS & QUOTAS ────────────────────────────────────── */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-emerald-600" /> Allocated Quotas & Store Limits
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.keys(formData.limits).map((key) => (
              <div key={key}>
                <label className="block font-bold text-slate-700 mb-1 capitalize">
                  {key.replace(/max/g, '').replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <input
                  required
                  type="number"
                  min="0"
                  name={key}
                  value={(formData.limits as any)[key]}
                  onChange={handleLimitChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:outline-none focus:border-purple-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* ─── FEATURE FLAGS TOGGLES ───────────────────────────────────────── */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-600" /> Module Permission Feature Flags
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.keys(formData.features).map((key) => {
              const enabled = (formData.features as any)[key];
              return (
                <div
                  key={key}
                  onClick={() => handleFeatureToggle(key)}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    enabled ? 'bg-purple-50/60 border-purple-200 text-purple-900' : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                >
                  <span className="font-bold capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className={`w-8 h-4 rounded-full transition-colors relative ${enabled ? 'bg-purple-600' : 'bg-slate-300'}`}>
                    <span className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-all ${enabled ? 'right-0.5' : 'left-0.5'}`} />
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── FORM ACTIONS ────────────────────────────────────────────────── */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200/80">
          <button
            type="button"
            onClick={() => navigate('/admin/plans')}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs transition-all"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isEditMode ? 'Save Plan Configuration' : 'Create Subscription Plan'}
          </button>
        </div>
      </form>
    </div>
  );
}
