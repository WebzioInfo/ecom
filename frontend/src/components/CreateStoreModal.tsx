import React, { useState } from 'react';
import {
  X,
  Store as StoreIcon,
  User,
  CreditCard,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { storesApi, ProvisionStorePayload } from '../api/stores.api';

interface CreateStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  plans: any[];
}

export default function CreateStoreModal({
  isOpen,
  onClose,
  onSuccess,
  plans,
}: CreateStoreModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [provisionProgress, setProvisionProgress] = useState<number>(0);
  const [provisionStepLabel, setProvisionStepLabel] = useState<string>('');

  const [formData, setFormData] = useState<ProvisionStorePayload>({
    name: '',
    slug: '',
    ownerName: '',
    adminEmail: '',
    adminPassword: '',
    businessName: '',
    businessType: 'Retail Commerce',
    planId: 'starter',
    phone: '',
    country: 'USA',
    city: 'San Francisco',
    address: '742 Evergreen Terrace',
    timezone: 'UTC-8 (PST)',
    currency: 'USD',
    trialDays: 14,
  });

  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validateStep = (currentStep: number): boolean => {
    const errs: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.name.trim()) errs.name = 'Store name is required';
      if (!formData.slug.trim()) {
        errs.slug = 'Store slug is required';
      } else if (!/^[a-z0-9-]+$/.test(formData.slug.trim())) {
        errs.slug = 'Slug must contain only lowercase letters, numbers, and hyphens';
      }
    }

    if (currentStep === 2) {
      if (!formData.ownerName.trim()) errs.ownerName = 'Owner name is required';
      if (!formData.adminEmail.trim()) {
        errs.adminEmail = 'Admin email is required';
      } else if (!/^\S+@\S+\.\S+$/.test(formData.adminEmail.trim())) {
        errs.adminEmail = 'Please enter a valid email address';
      }
      if (!formData.adminPassword) {
        errs.adminPassword = 'Password is required';
      } else if (formData.adminPassword.length < 8) {
        errs.adminPassword = 'Password must be at least 8 characters long';
      }
      if (formData.adminPassword !== confirmPassword) {
        errs.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    const parsedValue = name === 'trialDays' ? (value === '' ? 0 : Number(value)) : value;

    setFormData((prev) => {
      const next = { ...prev, [name]: parsedValue };
      if (name === 'name' && !prev.slug) {
        next.slug = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');
        next.businessName = value;
      }
      return next;
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handlePrevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(1) || !validateStep(2)) return;

    setLoading(true);
    setProvisionProgress(15);
    setProvisionStepLabel('Initializing store schema...');

    try {
      const steps = [
        { pct: 35, label: 'Allocating schema & DDL migrations...' },
        { pct: 65, label: 'Provisioning admin account & role permissions...' },
        { pct: 85, label: 'Generating API key pairs...' },
      ];

      for (const s of steps) {
        await new Promise((r) => setTimeout(r, 200));
        setProvisionProgress(s.pct);
        setProvisionStepLabel(s.label);
      }

      const result = await storesApi.provisionStore(formData);
      setProvisionProgress(100);
      setProvisionStepLabel('Store created successfully!');

      toast.success(result.message || 'New Store Created Successfully!');
      setTimeout(() => {
        onSuccess();
        onClose();
        setStep(1);
        setProvisionProgress(0);
      }, 400);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to create store';
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-slate-200/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-xl flex flex-col max-h-[90vh] text-slate-900 font-sans">
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-semibold text-sm">
              <StoreIcon className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 tracking-tight">Provision Merchant Store</h2>
              <p className="text-xs text-slate-500 font-normal">
                Setup new isolated tenant schema and store owner access.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 bg-slate-100/80 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* STEP PROGRESS INDICATOR */}
        <div className="grid grid-cols-4 border-b border-slate-100 bg-slate-50/80 text-xs font-medium">
          {[
            { stepNum: 1, label: '1. Profile', icon: StoreIcon },
            { stepNum: 2, label: '2. Owner', icon: User },
            { stepNum: 3, label: '3. Plan', icon: CreditCard },
            { stepNum: 4, label: '4. Review', icon: CheckCircle },
          ].map((item) => {
            const Icon = item.icon;
            const active = step === item.stepNum;
            const completed = step > item.stepNum;

            return (
              <button
                key={item.stepNum}
                type="button"
                onClick={() => {
                  if (item.stepNum < step || validateStep(step)) setStep(item.stepNum);
                }}
                className={`py-2.5 flex items-center justify-center gap-2 border-r last:border-r-0 border-slate-200/60 transition-all ${
                  active
                    ? 'text-blue-600 bg-white font-semibold border-b-2 border-b-blue-600'
                    : completed
                    ? 'text-slate-700 font-medium'
                    : 'text-slate-400 font-normal'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* FORM CONTENT */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* STEP 1: STORE BUSINESS DETAILS */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-sm font-semibold text-slate-900">Step 1: Store Business Details</h3>
                <p className="text-slate-500 font-normal">Define the store name, domain slug, and business type.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Store Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Apex Commerce"
                    className={`w-full bg-slate-50 border ${
                      errors.name ? 'border-rose-400' : 'border-slate-200/90'
                    } rounded-lg px-3.5 py-2 text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all`}
                    required
                  />
                  {errors.name && <p className="text-[11px] text-rose-500 mt-1 font-normal">{errors.name}</p>}
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Subdomain Slug *</label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    placeholder="apex-commerce"
                    className={`w-full bg-slate-50 border ${
                      errors.slug ? 'border-rose-400' : 'border-slate-200/90'
                    } rounded-lg px-3.5 py-2 text-slate-900 font-mono focus:outline-none focus:border-blue-500 focus:bg-white transition-all`}
                    required
                  />
                  {errors.slug ? (
                    <p className="text-[11px] text-rose-500 mt-1 font-normal">{errors.slug}</p>
                  ) : (
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">Isolated schema: tenant_{formData.slug || 'slug'}</p>
                  )}
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Business Name</label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName || ''}
                    onChange={handleChange}
                    placeholder="Legal Entity Name"
                    className="w-full bg-slate-50 border border-slate-200/90 rounded-lg px-3.5 py-2 text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Business Industry / Type</label>
                  <input
                    type="text"
                    name="businessType"
                    value={formData.businessType || ''}
                    onChange={handleChange}
                    placeholder="e.g. Fashion, Electronics, Retail"
                    className="w-full bg-slate-50 border border-slate-200/90 rounded-lg px-3.5 py-2 text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: OWNER CREDENTIALS */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-sm font-semibold text-slate-900">Step 2: Owner Credentials & Access</h3>
                <p className="text-slate-500 font-normal">Provision initial store administrator login credentials.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Owner Full Name *</label>
                  <input
                    type="text"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleChange}
                    placeholder="Marcus Sterling"
                    className={`w-full bg-slate-50 border ${
                      errors.ownerName ? 'border-rose-400' : 'border-slate-200/90'
                    } rounded-lg px-3.5 py-2 text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all`}
                    required
                  />
                  {errors.ownerName && <p className="text-[11px] text-rose-500 mt-1 font-normal">{errors.ownerName}</p>}
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Admin Email Address *</label>
                  <input
                    type="email"
                    name="adminEmail"
                    value={formData.adminEmail}
                    onChange={handleChange}
                    placeholder="admin@apexcommerce.com"
                    className={`w-full bg-slate-50 border ${
                      errors.adminEmail ? 'border-rose-400' : 'border-slate-200/90'
                    } rounded-lg px-3.5 py-2 text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all`}
                    required
                  />
                  {errors.adminEmail && <p className="text-[11px] text-rose-500 mt-1 font-normal">{errors.adminEmail}</p>}
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Initial Password * (Min 8 chars)</label>
                  <input
                    type="password"
                    name="adminPassword"
                    value={formData.adminPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full bg-slate-50 border ${
                      errors.adminPassword ? 'border-rose-400' : 'border-slate-200/90'
                    } rounded-lg px-3.5 py-2 text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all`}
                    required
                  />
                  {errors.adminPassword && <p className="text-[11px] text-rose-500 mt-1 font-normal">{errors.adminPassword}</p>}
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Confirm Password *</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full bg-slate-50 border ${
                      errors.confirmPassword ? 'border-rose-400' : 'border-slate-200/90'
                    } rounded-lg px-3.5 py-2 text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all`}
                    required
                  />
                  {errors.confirmPassword && <p className="text-[11px] text-rose-500 mt-1 font-normal">{errors.confirmPassword}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-medium text-slate-700 mb-1">Contact Phone (Optional)</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleChange}
                    placeholder="+1 (555) 019-2834"
                    className="w-full bg-slate-50 border border-slate-200/90 rounded-lg px-3.5 py-2 text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: LOCATION & SAAS PLAN */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-sm font-semibold text-slate-900">Step 3: Location & SaaS Plan</h3>
                <p className="text-slate-500 font-normal">Assign pricing plan tier, currency, and address defaults.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">SaaS Plan Tier</label>
                  <select
                    name="planId"
                    value={formData.planId}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200/90 rounded-lg px-3.5 py-2 text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  >
                    {plans.map((p) => (
                      <option key={p.id || p._id || p.code} value={p.code || p.id}>
                        {p.name} (${p.monthlyPrice}/mo)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Trial Period (Days)</label>
                  <input
                    type="number"
                    min="0"
                    name="trialDays"
                    value={formData.trialDays || 14}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200/90 rounded-lg px-3.5 py-2 text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Default Currency</label>
                  <select
                    name="currency"
                    value={formData.currency || 'USD'}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200/90 rounded-lg px-3.5 py-2 text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CAD">CAD ($)</option>
                    <option value="AUD">AUD ($)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Timezone</label>
                  <select
                    name="timezone"
                    value={formData.timezone || 'UTC-8 (PST)'}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200/90 rounded-lg px-3.5 py-2 text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  >
                    <option value="UTC-8 (PST)">UTC-8 (PST)</option>
                    <option value="UTC-5 (EST)">UTC-5 (EST)</option>
                    <option value="UTC+0 (GMT)">UTC+0 (GMT)</option>
                    <option value="UTC+1 (CET)">UTC+1 (CET)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country || ''}
                    onChange={handleChange}
                    placeholder="e.g. USA"
                    className="w-full bg-slate-50 border border-slate-200/90 rounded-lg px-3.5 py-2 text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city || ''}
                    onChange={handleChange}
                    placeholder="e.g. San Francisco"
                    className="w-full bg-slate-50 border border-slate-200/90 rounded-lg px-3.5 py-2 text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-medium text-slate-700 mb-1">Physical Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address || ''}
                    onChange={handleChange}
                    placeholder="e.g. 742 Evergreen Terrace"
                    className="w-full bg-slate-50 border border-slate-200/90 rounded-lg px-3.5 py-2 text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & PROVISION */}
          {step === 4 && (
            <div className="space-y-4 animate-fade-in">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-sm font-semibold text-slate-900">Step 4: Review & Provision</h3>
                <p className="text-slate-500 font-normal">Review store configuration details before final provision.</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-normal block">Store Name</span>
                    <span className="font-semibold text-slate-900">{formData.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-normal block">Subdomain</span>
                    <span className="font-mono font-semibold text-blue-600">{formData.slug}.saasplatform.com</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-normal block">Owner Name</span>
                    <span className="font-semibold text-slate-900">{formData.ownerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-normal block">Admin Email</span>
                    <span className="font-semibold text-slate-700">{formData.adminEmail}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-normal block">SaaS Plan Tier</span>
                    <span className="font-semibold text-slate-900 capitalize">{formData.planId} Tier</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-normal block">Trial Period</span>
                    <span className="font-semibold text-slate-700">{formData.trialDays} Days Free Trial</span>
                  </div>
                </div>
              </div>

              {/* LIVE PROVISIONING PROGRESS BAR */}
              {loading && (
                <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 space-y-2">
                  <div className="flex items-center justify-between text-xs font-medium text-blue-900">
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" /> {provisionStepLabel}
                    </span>
                    <span className="font-mono">{provisionProgress}%</span>
                  </div>
                  <div className="w-full bg-blue-200/60 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full transition-all duration-200"
                      style={{ width: `${provisionProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* FOOTER ACTIONS */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-medium rounded-lg transition-colors text-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="flex items-center gap-2 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg shadow-xs transition-all text-xs"
              >
                Continue <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg shadow-xs transition-all text-xs"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                Provision Store
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
