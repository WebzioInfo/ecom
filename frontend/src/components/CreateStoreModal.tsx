import React, { useState } from 'react';
import {
  X,
  Store as StoreIcon,
  User,
  CreditCard,
  MapPin,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Shield,
  Key,
  Globe,
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
  const [validationError, setValidationError] = useState<any>(null);
  const [fieldError, setFieldError] = useState<{ field: string; message: string } | null>(null);

  const getStepForField = (field: string): number => {
    if (['name', 'slug', 'businessName', 'businessType', 'code', 'website'].includes(field)) return 1;
    if (['country', 'state', 'city', 'postalCode', 'address', 'timezone', 'currency', 'gstNumber', 'taxNumber'].includes(field)) return 2;
    if (['ownerName', 'ownerEmail', 'adminEmail', 'phone', 'adminPassword', 'confirmPassword'].includes(field)) return 3;
    if (['planId', 'subscriptionType', 'trialDays', 'status'].includes(field)) return 4;
    return 1;
  };

  const setFieldValidationError = (field: string, message: string) => {
    setFieldError({ field, message });
    const targetStep = getStepForField(field);
    setStep(targetStep);
    setTimeout(() => {
      const el = document.querySelector<HTMLInputElement | HTMLSelectElement>(`[name="${field}"]`);
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const renderFieldError = (fieldName: string) => {
    if (fieldError?.field === fieldName) {
      return <p className="text-xs text-red-400 mt-1 font-medium">{fieldError.message}</p>;
    }
    return null;
  };

  const getFieldBorderClass = (fieldName: string) => {
    return fieldError?.field === fieldName ? 'border-red-500 ring-1 ring-red-500 bg-red-950/20' : 'border-slate-800 focus:border-indigo-500';
  };

  const [formData, setFormData] = useState<ProvisionStorePayload>({
    name: '',
    businessName: '',
    businessType: 'Retail Commerce',
    slug: '',
    code: '',
    logo: '',
    website: '',
    ownerName: '',
    ownerEmail: '',
    adminEmail: '',
    adminPassword: '',
    phone: '',
    altPhone: '',
    country: 'USA',
    state: 'California',
    district: 'West Coast',
    city: 'San Francisco',
    address: '742 Evergreen Terrace',
    postalCode: '94105',
    timezone: 'UTC-8 (PST)',
    currency: 'USD',
    language: 'en',
    gstNumber: '29ABCDE1234F1Z5',
    taxNumber: 'TAX-987654321',
    planId: 'basic',
    subscriptionType: 'MONTHLY',
    trialDays: 14,
    status: 'ACTIVE',
  });

  const [confirmPassword, setConfirmPassword] = useState('');

  if (!isOpen) return null;

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
        next.code = `STR-${next.slug.toUpperCase()}`;
        next.businessName = value;
      }
      if (name === 'ownerEmail' && !prev.adminEmail) {
        next.adminEmail = value;
      }
      return next;
    });
  };

  const handleNextStep = () => {
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const handlePrevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const validateForm = () => {
    setFieldError(null);
    setValidationError(null);
    if (!formData.name) {
      setFieldValidationError('name', 'Please enter Store Name');
      toast.error('Please enter Store Name (Step 1)');
      return false;
    }
    if (!formData.slug) {
      setFieldValidationError('slug', 'Please enter Store Slug');
      toast.error('Please enter Store Slug (Step 1)');
      return false;
    }
    if (!formData.city || !formData.country) {
      setFieldValidationError(!formData.city ? 'city' : 'country', 'Please enter City and Country');
      toast.error('Please enter City and Country (Step 2)');
      return false;
    }
    if (!formData.ownerName) {
      setFieldValidationError('ownerName', 'Please enter Owner Full Name');
      toast.error('Please enter Owner Full Name (Step 3)');
      return false;
    }
    if (!formData.ownerEmail) {
      setFieldValidationError('ownerEmail', 'Please enter Owner Email');
      toast.error('Please enter Owner Email (Step 3)');
      return false;
    }
    if (!formData.adminEmail) {
      setFieldValidationError('adminEmail', 'Please enter Admin Login Email');
      toast.error('Please enter Admin Login Email (Step 3)');
      return false;
    }
    if (!formData.adminPassword) {
      setFieldValidationError('adminPassword', 'Please enter Admin Initial Password');
      toast.error('Please enter Admin Initial Password (Step 3)');
      return false;
    }
    if (formData.adminPassword !== confirmPassword) {
      setFieldValidationError('confirmPassword', 'Passwords do not match');
      toast.error('Passwords do not match! (Step 3)');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    setValidationError(null);
    setFieldError(null);
    try {
      const result = await storesApi.provisionStore(formData);
      toast.success(result.message || 'Tenant Store Provisioned Successfully!');
      onSuccess();
      onClose();
    } catch (err: any) {
      const errorResponse = err.response?.data;
      const status = err.response?.status;
      const firstErrorObj = Array.isArray(errorResponse?.errors) && errorResponse.errors.length > 0 ? errorResponse.errors[0] : null;
      const errField = errorResponse?.field || firstErrorObj?.field;
      const msg = errorResponse?.message || firstErrorObj?.message || errorResponse?.error || err.message || 'Store Provisioning Failed';

      toast.error(msg);
      setValidationError(errorResponse || { message: msg, status });

      if (errField) {
        setFieldValidationError(errField, firstErrorObj?.message || msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <StoreIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Provision New SaaS Tenant Store
              </h2>
              <p className="text-xs text-slate-400">
                Automated multi-tenant setup & admin credentials generation.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP PROGRESS INDICATOR */}
        <div className="grid grid-cols-4 border-b border-slate-800 bg-slate-950/20 text-center text-xs font-semibold">
          {[
            { stepNum: 1, label: 'Store Profile', icon: StoreIcon },
            { stepNum: 2, label: 'Location & Tax', icon: MapPin },
            { stepNum: 3, label: 'Admin Credentials', icon: Key },
            { stepNum: 4, label: 'Subscription', icon: CreditCard },
          ].map((item) => {
            const Icon = item.icon;
            const active = step === item.stepNum;
            const completed = step > item.stepNum;

            return (
              <button
                key={item.stepNum}
                type="button"
                onClick={() => setStep(item.stepNum)}
                className={`py-3 flex items-center justify-center gap-2 border-r last:border-r-0 border-slate-800 transition-colors hover:bg-slate-800/50 cursor-pointer ${active
                    ? 'text-indigo-400 bg-indigo-950/30 border-b-2 border-b-indigo-500'
                    : completed
                      ? 'text-emerald-400'
                      : 'text-slate-500'
                  }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* FORM CONTENT */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* STEP 1: STORE PROFILE */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2">
                Step 1: Store & Business Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Store Name *
                  </label>
                  <input type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Apex Electronics"
                    className={`w-full bg-slate-950 border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none ${getFieldBorderClass('name')}`}
                  />
                  {renderFieldError('name')}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Store Slug (URL Identifier) *
                  </label>
                  <input type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    placeholder="apex-electronics"
                    className={`w-full bg-slate-950 border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none font-mono ${getFieldBorderClass('slug')}`}
                  />
                  {renderFieldError('slug')}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Legal Business Name
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    placeholder="Apex Technologies LLC"
                    className={`w-full bg-slate-950 border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none ${getFieldBorderClass('businessName')}`}
                  />
                  {renderFieldError('businessName')}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Business Type
                  </label>
                  <select
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Retail Commerce">Retail Commerce</option>
                    <option value="Wholesale B2B">Wholesale B2B</option>
                    <option value="Digital Services">Digital Services</option>
                    <option value="Fashion & Apparel">Fashion & Apparel</option>
                    <option value="Electronics & Tech">Electronics & Tech</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Store Code
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    placeholder="STR-APEX"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Website URL
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://apexelectronics.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: LOCATION & TAX */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2">
                Step 2: Location, Currency & Tax Registration
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">State / Province</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Postal Code</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Street Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Timezone</label>
                  <input
                    type="text"
                    name="timezone"
                    value={formData.timezone}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Currency</label>
                  <input
                    type="text"
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">GST Number</label>
                  <input
                    type="text"
                    name="gstNumber"
                    value={formData.gstNumber}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tax ID Number</label>
                  <input
                    type="text"
                    name="taxNumber"
                    value={formData.taxNumber}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: ADMIN CREDENTIALS */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2">
                Step 3: Store Owner & Admin Account Setup
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Owner Full Name *
                  </label>
                  <input type="text"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleChange}
                    placeholder="Marcus Sterling"
                    className={`w-full bg-slate-950 border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none ${getFieldBorderClass('ownerName')}`}
                  />
                  {renderFieldError('ownerName')}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Owner Personal Email *
                  </label>
                  <input type="email"
                    name="ownerEmail"
                    value={formData.ownerEmail}
                    onChange={handleChange}
                    placeholder="marcus@apexelectronics.com"
                    className={`w-full bg-slate-950 border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none ${getFieldBorderClass('ownerEmail')}`}
                  />
                  {renderFieldError('ownerEmail')}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Admin Portal Login Email *
                  </label>
                  <input type="email"
                    name="adminEmail"
                    value={formData.adminEmail}
                    onChange={handleChange}
                    placeholder="admin@apexelectronics.com"
                    className={`w-full bg-slate-950 border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none ${getFieldBorderClass('adminEmail')}`}
                  />
                  {renderFieldError('adminEmail')}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 234-5678"
                    className={`w-full bg-slate-950 border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none ${getFieldBorderClass('phone')}`}
                  />
                  {renderFieldError('phone')}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Admin Initial Password *
                  </label>
                  <input type="password"
                    name="adminPassword"
                    value={formData.adminPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full bg-slate-950 border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none ${getFieldBorderClass('adminPassword')}`}
                  />
                  {renderFieldError('adminPassword')}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Confirm Admin Password *
                  </label>
                  <input type="password"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full bg-slate-950 border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none ${getFieldBorderClass('confirmPassword')}`}
                  />
                  {renderFieldError('confirmPassword')}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: SUBSCRIPTION */}
          {step === 4 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2">
                Step 4: Subscription & Tier Selection
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Select SaaS Plan Tier
                  </label>
                  <select
                    name="planId"
                    value={formData.planId}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-bold"
                  >
                    {plans.map((p) => (
                      <option key={p.id || p._id || p.code} value={p.code || p.id}>
                        {p.name} (${p.monthlyPrice}/mo)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Billing Cycle
                  </label>
                  <select
                    name="subscriptionType"
                    value={formData.subscriptionType}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="MONTHLY">MONTHLY BILLING</option>
                    <option value="YEARLY">YEARLY BILLING (20% OFF)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Free Trial Days
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="trialDays"
                    value={formData.trialDays}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Store Initial Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-bold"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="PENDING">PENDING SETUP</option>
                  </select>
                </div>
              </div>

              {/* GENERATED URLS PREVIEW */}
              <div className="bg-slate-950/60 p-4 border border-slate-800 rounded-2xl space-y-2 mt-4">
                <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="w-4 h-4" /> Generated Tenant URLs Preview
                </div>
                <div className="text-xs text-slate-300 font-mono space-y-1">
                  <div>
                    <span className="text-slate-500">Storefront URL:</span> http://localhost:3000/store/
                    <span className="text-emerald-400 font-bold">{formData.slug || 'slug'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Admin Portal URL:</span> http://localhost:5173/admin?store=
                    <span className="text-indigo-400 font-bold">{formData.slug || 'slug'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FOOTER ACTIONS */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition-colors text-xs"
              >
                <ArrowLeft className="w-4 h-4" /> Previous Step
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition-all text-xs"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg shadow-emerald-600/20 transition-all text-xs"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Provision Tenant Store Now
              </button>
            )}
          </div>
        </form>

        {/* DEBUG PANEL */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 text-xs font-mono text-slate-400 max-h-48 overflow-y-auto">
          <div className="text-indigo-400 font-bold mb-2">Endpoint: POST {import.meta.env.VITE_API_URL || 'http://localhost:/api/v1'}/stores/provision</div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-slate-300 font-bold mb-1">Request Payload:</div>
              <pre>{JSON.stringify(formData, null, 2)}</pre>
            </div>
            {validationError && (
              <div>
                <div className="text-red-400 font-bold mb-1">Validation Errors:</div>
                <pre className="text-red-300">{JSON.stringify(validationError, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
