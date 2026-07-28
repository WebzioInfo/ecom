import React, { useState, useEffect } from 'react';
import {
  X,
  Store as StoreIcon,
  CreditCard,
  MapPin,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Key,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { storesApi } from '../api/stores.api';

interface EditStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  storeId: string | null;
  plans: any[];
}

export default function EditStoreModal({
  isOpen,
  onClose,
  onSuccess,
  storeId,
  plans,
}: EditStoreModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [validationError, setValidationError] = useState<any>(null);
  const [fieldError, setFieldError] = useState<{ field: string; message: string } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    businessType: '',
    slug: '',
    code: '',
    website: '',
    logo: '',
    status: '',
    ownerName: '',
    phone: '',
    altPhone: '',
    adminEmail: '',
    country: '',
    state: '',
    city: '',
    address: '',
    postalCode: '',
    timezone: '',
    currency: '',
    language: '',
    gstNumber: '',
    taxNumber: '',
    planId: '',
    subscriptionType: '',
    trialDays: 0,
    subscriptionStatus: '',
  });

  useEffect(() => {
    if (isOpen && storeId) {
      loadStoreDetails();
      setStep(1);
    }
  }, [isOpen, storeId]);

  const loadStoreDetails = async () => {
    setFetching(true);
    try {
      const data = await storesApi.getFullDetails(storeId!);
      const { store, ownerDetails, adminAccount, subscription } = data;
      
      setFormData({
        name: store.name || '',
        businessName: store.businessName || '',
        businessType: store.businessType || '',
        slug: store.slug || '',
        code: store.code || '',
        website: store.website || '',
        logo: store.logo || '',
        status: store.status || '',
        ownerName: ownerDetails.name || '',
        phone: ownerDetails.phone || '',
        altPhone: ownerDetails.altPhone || '',
        adminEmail: adminAccount.adminLoginEmail || ownerDetails.email || '',
        country: store.country || '',
        state: store.state || '',
        city: store.city || '',
        address: store.address || '',
        postalCode: store.postalCode || '',
        timezone: store.timezone || '',
        currency: store.currency || '',
        language: store.language || '',
        gstNumber: store.gstNumber || '',
        taxNumber: store.taxNumber || '',
        planId: subscription.planName || '',
        subscriptionType: subscription.billingCycle || 'MONTHLY',
        trialDays: store.subscription?.trialDays || 0,
        subscriptionStatus: subscription.status || 'ACTIVE',
      });
    } catch (error) {
      toast.error('Failed to load store details');
      onClose();
    } finally {
      setFetching(false);
    }
  };

  if (!isOpen) return null;

  const getStepForField = (field: string): number => {
    if (['name', 'slug', 'businessName', 'businessType', 'code', 'website', 'status'].includes(field)) return 1;
    if (['country', 'state', 'city', 'postalCode', 'address', 'timezone', 'currency', 'gstNumber', 'taxNumber'].includes(field)) return 2;
    if (['ownerName', 'adminEmail', 'phone', 'altPhone'].includes(field)) return 3;
    if (['planId', 'subscriptionType', 'trialDays', 'subscriptionStatus'].includes(field)) return 4;
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    const parsedValue = name === 'trialDays' ? (value === '' ? 0 : Number(value)) : value;
    setFormData((prev) => ({ ...prev, [name]: parsedValue }));
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
      toast.error('Store name is required.');
      return false;
    }
    if (!formData.slug) {
      setFieldValidationError('slug', 'Please enter Store Slug');
      toast.error('Store slug is required.');
      return false;
    }
    if (!formData.adminEmail) {
      setFieldValidationError('adminEmail', 'Please enter Admin Email');
      toast.error('Admin email is required.');
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(formData.adminEmail)) {
      setFieldValidationError('adminEmail', 'Invalid email format');
      toast.error('Invalid email format.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !storeId) return;
    
    setLoading(true);
    setValidationError(null);
    setFieldError(null);
    try {
      const payload = {
        name: formData.name,
        slug: formData.slug,
        status: formData.status as any,
        adminEmail: formData.adminEmail,
        settings: {
          businessName: formData.businessName,
          businessType: formData.businessType,
          website: formData.website,
          logo: formData.logo,
          phone: formData.phone,
          altPhone: formData.altPhone,
          country: formData.country,
          state: formData.state,
          city: formData.city,
          address: formData.address,
          postalCode: formData.postalCode,
          timezone: formData.timezone,
          currency: formData.currency,
          language: formData.language,
          gstNumber: formData.gstNumber,
          taxNumber: formData.taxNumber,
        },
        subscription: {
          planId: formData.planId,
          billingCycle: formData.subscriptionType,
          trialDays: formData.trialDays,
          status: formData.subscriptionStatus,
        }
      };

      await storesApi.updateStore(storeId, payload);
      toast.success('Store updated successfully!');
      onSuccess();
      onClose();
    } catch (err: any) {
      const errorResponse = err.response?.data;
      const firstErrorObj = Array.isArray(errorResponse?.errors) && errorResponse.errors.length > 0 ? errorResponse.errors[0] : null;
      const errField = errorResponse?.field || firstErrorObj?.field;
      const msg = errorResponse?.message || firstErrorObj?.message || errorResponse?.error || err.message || 'Store Update Failed';

      toast.error(msg);
      setValidationError(errorResponse || { message: msg });

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
                Edit Store
              </h2>
              <p className="text-xs text-slate-400">
                Update store configuration and details safely.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (confirm('Are you sure you want to close? Unsaved changes will be lost.')) {
                onClose();
              }
            }}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {fetching ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-sm">Fetching store details...</p>
          </div>
        ) : (
          <>
            {/* STEP PROGRESS INDICATOR */}
            <div className="grid grid-cols-4 border-b border-slate-800 bg-slate-950/20 text-center text-xs font-semibold">
              {[
                { stepNum: 1, label: 'General', icon: StoreIcon },
                { stepNum: 2, label: 'Location & Tax', icon: MapPin },
                { stepNum: 3, label: 'Owner', icon: Key },
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
              {/* STEP 1: GENERAL */}
              {step === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2">
                    Step 1: General Information
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
                        className={`w-full bg-slate-950 border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none ${getFieldBorderClass('businessName')}`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Business Type
                      </label>
                      <input
                        type="text"
                        name="businessType"
                        value={formData.businessType}
                        onChange={handleChange}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Store Code (Read-Only)
                      </label>
                      <input
                        type="text"
                        value={formData.code}
                        readOnly
                        disabled
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed font-mono"
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
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Status
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="SUSPENDED">SUSPENDED</option>
                        <option value="PENDING">PENDING</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: LOCATION & TAX */}
              {step === 2 && (
                <div className="space-y-4 animate-fade-in">
                  <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2">
                    Step 2: Location, Currency & Tax
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

              {/* STEP 3: OWNER */}
              {step === 3 && (
                <div className="space-y-4 animate-fade-in">
                  <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2">
                    Step 3: Owner & Admin Credentials
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Owner Name
                      </label>
                      <input type="text"
                        name="ownerName"
                        value={formData.ownerName}
                        onChange={handleChange}
                        className={`w-full bg-slate-950 border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none ${getFieldBorderClass('ownerName')}`}
                      />
                      {renderFieldError('ownerName')}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Admin Login Email *
                      </label>
                      <input type="email"
                        name="adminEmail"
                        value={formData.adminEmail}
                        onChange={handleChange}
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
                        className={`w-full bg-slate-950 border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none ${getFieldBorderClass('phone')}`}
                      />
                      {renderFieldError('phone')}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Alternate Phone
                      </label>
                      <input
                        type="text"
                        name="altPhone"
                        value={formData.altPhone}
                        onChange={handleChange}
                        className={`w-full bg-slate-950 border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none ${getFieldBorderClass('altPhone')}`}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: SUBSCRIPTION */}
              {step === 4 && (
                <div className="space-y-4 animate-fade-in">
                  <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2">
                    Step 4: Subscription Info
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Plan Tier
                      </label>
                      <select
                        name="planId"
                        value={formData.planId}
                        onChange={handleChange}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-bold"
                      >
                        {plans.map((p) => (
                          <option key={p.id || p._id || p.code || p.name} value={p.code || p.id || p.name}>
                            {p.name}
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
                        <option value="MONTHLY">MONTHLY</option>
                        <option value="YEARLY">YEARLY</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Trial Days
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
                        Subscription Status
                      </label>
                      <select
                        name="subscriptionStatus"
                        value={formData.subscriptionStatus}
                        onChange={handleChange}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-bold"
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="TRIAL">TRIAL</option>
                        <option value="EXPIRED">EXPIRED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
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
                    Save Changes
                  </button>
                )}
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
