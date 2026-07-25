import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Store as StoreIcon,
  ArrowLeft,
  Users,
  CreditCard,
  TrendingUp,
  Activity,
  Settings as SettingsIcon,
  MessageSquare,
  Shield,
  Clock,
  Database,
  Lock,
  RotateCcw,
  LogOut,
  FileText,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Copy,
  Key,
  Globe,
  DollarSign,
  UserCheck,
  Building,
  Mail,
  Phone,
  MapPin,
  Calendar,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { storesApi, getStoreId } from '../api/stores.api';
import { plansApi } from '../api/plans.api';
import { SupportChatEngine } from '../components/SupportChatEngine';

export default function StoreDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'owner' | 'admin' | 'subscription' | 'payments' | 'analytics' | 'users' | 'support' | 'activity' | 'settings'
  >('overview');

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');

  // Password Modals
  const [showChangePassModal, setShowChangePassModal] = useState(false);
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [tempPasswordModal, setTempPasswordModal] = useState<{ email: string; pass: string } | null>(null);

  useEffect(() => {
    if (id) fetchStoreFullDetails(id);
  }, [id]);

  const fetchStoreFullDetails = async (storeId: string) => {
    try {
      setLoading(true);
      const [fullDetails, availablePlans] = await Promise.all([
        storesApi.getFullDetails(storeId),
        plansApi.getAll(),
      ]);
      setData(fullDetails);
      setPlans(availablePlans || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load store tenant profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard!`);
  };

  const handleResetAdminPassword = async () => {
    if (!id) return;
    try {
      const res = await storesApi.resetAdminPassword(id);
      setTempPasswordModal({ email: res.adminEmail, pass: res.tempPassword });
      toast.success(res.message);
      fetchStoreFullDetails(id);
    } catch (err: any) {
      toast.error('Failed to reset admin password');
    }
  };

  const handleChangeAdminPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newAdminPassword) return;
    try {
      const res = await storesApi.changeAdminPassword(id, newAdminPassword);
      toast.success(res.message);
      setShowChangePassModal(false);
      setNewAdminPassword('');
      fetchStoreFullDetails(id);
    } catch (err: any) {
      toast.error('Failed to change admin password');
    }
  };

  const handleToggleAdminStatus = async () => {
    if (!id || !data) return;
    const currentActive = data.adminAccount?.status === 'ACTIVE';
    try {
      const res = await storesApi.setAdminStatus(id, !currentActive);
      toast.success(res.message);
      fetchStoreFullDetails(id);
    } catch (err: any) {
      toast.error('Failed to update admin status');
    }
  };

  const handleFlushCache = async () => {
    if (!id) return;
    try {
      const res = await storesApi.resetCache(id);
      toast.success(res.message);
    } catch (err) {
      toast.error('Failed to flush cache');
    }
  };

  const handleForceLogout = async () => {
    if (!id) return;
    try {
      const res = await storesApi.forceLogout(id);
      toast.success(res.message);
    } catch (err) {
      toast.error('Failed to force logout sessions');
    }
  };

  const handleRenewSub = async () => {
    if (!id) return;
    try {
      const res = await storesApi.renewSubscription(id);
      toast.success(res.message);
      fetchStoreFullDetails(id);
    } catch (err) {
      toast.error('Failed to renew subscription');
    }
  };

  const handleGenerateInvoice = async () => {
    if (!id) return;
    try {
      const res = await storesApi.generateInvoice(id);
      toast.success(`Generated Invoice #${res.invoiceNumber} for $${res.amount}`);
      fetchStoreFullDetails(id);
    } catch (err) {
      toast.error('Failed to generate invoice');
    }
  };

  const handlePlanChangeSubmit = async () => {
    if (!id || !selectedPlanId) return;
    try {
      await storesApi.changePlan(id, selectedPlanId);
      toast.success(`Plan updated to ${selectedPlanId}`);
      fetchStoreFullDetails(id);
    } catch (err) {
      toast.error('Failed to change plan');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-400 text-sm animate-fade-in">
        Loading 10-Tab Tenant Control Panel...
      </div>
    );
  }

  if (!data || !data.store) {
    return (
      <div className="p-8 text-center text-slate-400">
        Tenant Store profile not found.
      </div>
    );
  }

  const { store, ownerDetails, adminAccount, users, subscription, payments, analytics, activityLogs } = data;
  const urls = store.urls || {};

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/stores')}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                {store.name}
              </h1>
              <span
                className={`px-3 py-0.5 rounded-full text-xs font-extrabold uppercase border ${
                  store.status === 'SUSPENDED'
                    ? 'bg-rose-950 text-rose-400 border-rose-800'
                    : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                }`}
              >
                {store.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Slug: {store.slug} &bull; Identifier: {urls.identifier || store.id}
            </p>
          </div>
        </div>

        {/* QUICK LINK BUTTONS */}
        <div className="flex items-center gap-3">
          <a
            href={urls.storefrontUrl || `http://localhost:3000/store/${store.slug}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl text-xs font-semibold transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-emerald-400" /> Open Storefront
          </a>
          <a
            href={urls.adminUrl || `http://localhost:5173/admin?store=${store.slug}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 rounded-xl text-xs font-semibold transition-colors"
          >
            <Lock className="w-4 h-4" /> Open Admin Portal
          </a>
        </div>
      </div>

      {/* 10-TAB NAVIGATION BAR */}
      <div className="flex items-center gap-1 bg-slate-900/80 p-1.5 border border-slate-800 rounded-2xl overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview', icon: StoreIcon },
          { id: 'owner', label: 'Owner Info', icon: UserCheck },
          { id: 'admin', label: 'Admin Account', icon: Key },
          { id: 'subscription', label: 'Subscription', icon: CreditCard },
          { id: 'payments', label: 'Payments', icon: DollarSign },
          { id: 'analytics', label: 'Analytics', icon: TrendingUp },
          { id: 'users', label: 'Team Users', icon: Users },
          { id: 'support', label: 'Support Chat', icon: MessageSquare },
          { id: 'activity', label: 'Audit Logs', icon: Activity },
          { id: 'settings', label: 'Controls', icon: SettingsIcon },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          {/* STORE URL CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/60 p-5 border border-slate-800 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-emerald-400">Storefront URL</span>
                <button onClick={() => handleCopy(urls.storefrontUrl, 'Storefront URL')} className="p-1 hover:text-white">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="text-sm font-bold text-white font-mono truncate">{urls.storefrontUrl}</div>
              <a href={urls.storefrontUrl} target="_blank" rel="noreferrer" className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-semibold">
                Launch Storefront <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="bg-slate-900/60 p-5 border border-slate-800 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-indigo-400">Admin Portal URL</span>
                <button onClick={() => handleCopy(urls.adminUrl, 'Admin URL')} className="p-1 hover:text-white">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="text-sm font-bold text-white font-mono truncate">{urls.adminUrl}</div>
              <a href={urls.adminUrl} target="_blank" rel="noreferrer" className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-semibold">
                Launch Admin Portal <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="bg-slate-900/60 p-5 border border-slate-800 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-purple-400">API Endpoint</span>
                <button onClick={() => handleCopy(urls.apiUrl, 'API URL')} className="p-1 hover:text-white">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="text-sm font-bold text-white font-mono truncate">{urls.apiUrl}</div>
              <div className="text-xs text-slate-400 font-mono">Store Header: x-store-slug={store.slug}</div>
            </div>
          </div>

          {/* BUSINESS INFO & CAPACITY GAUGES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/60 p-6 border border-slate-800 rounded-2xl space-y-4">
              <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
                <Building className="w-4 h-4 text-indigo-400" /> Business Profile & Legal Registration
              </h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block">Legal Business Name</span>
                  <span className="font-semibold text-slate-200">{store.businessName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Business Type</span>
                  <span className="font-semibold text-slate-200">{store.businessType}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">GST Number</span>
                  <span className="font-semibold text-slate-200 font-mono">{store.gstNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Tax Number</span>
                  <span className="font-semibold text-slate-200 font-mono">{store.taxNumber}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block">Business Address</span>
                  <span className="font-semibold text-slate-200">{store.address}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/60 p-6 border border-slate-800 rounded-2xl space-y-4">
              <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" /> System Capacity & Resource Quotas
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1 font-semibold">
                    <span className="text-slate-400">Database Storage Used</span>
                    <span className="text-white">{store.storageUsedMB} MB / {store.storageLimitMB} MB</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(store.storageUsedMB / store.storageLimitMB) * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1 font-semibold">
                    <span className="text-slate-400">API Calls (Monthly Quota)</span>
                    <span className="text-white">{store.apiUsageCount} / {store.apiUsageLimit}</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${(store.apiUsageCount / store.apiUsageLimit) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: OWNER INFO */}
      {activeTab === 'owner' && (
        <div className="bg-slate-900/60 p-6 border border-slate-800 rounded-2xl space-y-6 animate-fade-in max-w-3xl">
          <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-indigo-400" /> Store Owner Contact Profile
          </h3>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block mb-1">Owner Full Name</span>
              <span className="font-bold text-white text-sm">{ownerDetails?.name}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Personal Email</span>
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-400" /> {ownerDetails?.email}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Primary Phone</span>
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" /> {ownerDetails?.phone}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Alternative Phone</span>
              <span className="font-semibold text-slate-200">{ownerDetails?.altPhone}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Country / State</span>
              <span className="font-semibold text-slate-200">{ownerDetails?.country}, {ownerDetails?.state}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">City</span>
              <span className="font-semibold text-slate-200">{ownerDetails?.city}</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ADMIN ACCOUNT MANAGEMENT */}
      {activeTab === 'admin' && (
        <div className="space-y-6 animate-fade-in max-w-4xl">
          <div className="bg-slate-900/60 p-6 border border-slate-800 rounded-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-indigo-400" /> Store Admin Credentials & Account Controls
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Manage administrative credentials, status, and security options.</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase border ${
                  adminAccount?.status === 'ACTIVE'
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                    : 'bg-rose-950 text-rose-400 border-rose-800'
                }`}
              >
                {adminAccount?.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block">Admin Login Email</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-bold text-white font-mono text-sm">{adminAccount?.adminLoginEmail}</span>
                  <button onClick={() => handleCopy(adminAccount?.adminLoginEmail, 'Admin Email')} className="p-1 text-slate-400 hover:text-white">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <span className="text-slate-500 block">Assigned Roles</span>
                <span className="font-bold text-indigo-400 text-xs mt-1 block">{adminAccount?.role}</span>
              </div>

              <div>
                <span className="text-slate-500 block">Last Active Login</span>
                <span className="font-semibold text-slate-200 mt-1 block">{adminAccount?.lastLogin}</span>
              </div>

              <div>
                <span className="text-slate-500 block">Password Last Changed</span>
                <span className="font-semibold text-slate-200 mt-1 block">{adminAccount?.passwordLastChanged}</span>
              </div>
            </div>

            {/* ADMIN ACTION BUTTONS */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={handleResetAdminPassword}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition-colors shadow-lg shadow-indigo-600/20"
              >
                <RotateCcw className="w-4 h-4" /> Generate Temp Password
              </button>

              <button
                onClick={() => setShowChangePassModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition-colors border border-slate-700"
              >
                <Lock className="w-4 h-4 text-indigo-400" /> Explicit Change Password
              </button>

              <button
                onClick={handleToggleAdminStatus}
                className={`flex items-center gap-2 px-4 py-2.5 font-semibold rounded-xl text-xs transition-colors border ${
                  adminAccount?.status === 'ACTIVE'
                    ? 'bg-rose-950/50 hover:bg-rose-900 text-rose-300 border-rose-800'
                    : 'bg-emerald-950/50 hover:bg-emerald-900 text-emerald-300 border-emerald-800'
                }`}
              >
                <Shield className="w-4 h-4" />
                {adminAccount?.status === 'ACTIVE' ? 'Suspend Admin Login' : 'Activate Admin Login'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SUBSCRIPTION */}
      {activeTab === 'subscription' && (
        <div className="bg-slate-900/60 p-6 border border-slate-800 rounded-2xl space-y-6 animate-fade-in max-w-4xl">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white">Active Subscription Tier</h3>
              <p className="text-xs text-slate-400 mt-0.5">Current plan quota and billing cycle details.</p>
            </div>
            <button onClick={handleRenewSub} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition-colors">
              Renew 30 Days
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block mb-1">Current Plan</span>
              <span className="font-bold text-white text-sm">{subscription?.planName}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Billing Cycle</span>
              <span className="font-semibold text-indigo-400">{subscription?.billingCycle}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Renewal Date</span>
              <span className="font-semibold text-slate-200">{subscription?.renewalDate}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Subscription Status</span>
              <span className="font-bold text-emerald-400 uppercase">{subscription?.status}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center gap-4">
            <select
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white"
            >
              <option value="">Select New Plan Tier</option>
              {plans.map((p) => (
                <option key={p.id || p._id || p.code} value={p.name}>
                  {p.name} (${p.monthlyPrice}/mo)
                </option>
              ))}
            </select>
            <button onClick={handlePlanChangeSubmit} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl">
              Apply Tier Change
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: PAYMENTS */}
      {activeTab === 'payments' && (
        <div className="bg-slate-900/60 p-6 border border-slate-800 rounded-2xl space-y-6 animate-fade-in">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white">SaaS Payment Ledger & Invoices</h3>
              <p className="text-xs text-slate-400 mt-0.5">Recorded subscription transaction receipts.</p>
            </div>
            <button onClick={handleGenerateInvoice} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl">
              Generate Invoice
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-bold uppercase border-b border-slate-800">
                <tr>
                  <th className="p-3">Invoice Number</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Plan</th>
                  <th className="p-3">Method</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {payments?.map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-mono font-bold text-white">{inv.invoiceNumber}</td>
                    <td className="p-3 text-slate-400">{inv.date}</td>
                    <td className="p-3 font-bold text-emerald-400">${inv.amount}</td>
                    <td className="p-3">{inv.plan}</td>
                    <td className="p-3 text-slate-400">{inv.method}</td>
                    <td className="p-3 font-bold text-emerald-400 uppercase">{inv.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="bg-slate-900/60 p-6 border border-slate-800 rounded-2xl space-y-6 animate-fade-in">
          <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">Store Financial & Sales Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-slate-500 text-xs font-semibold">Total Store Gross Sales</span>
              <div className="text-xl font-bold text-emerald-400 mt-1">${analytics?.totalRevenue}</div>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-slate-500 text-xs font-semibold">Total Orders Processed</span>
              <div className="text-xl font-bold text-white mt-1">{analytics?.totalOrders} orders</div>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-slate-500 text-xs font-semibold">Total Customers</span>
              <div className="text-xl font-bold text-indigo-400 mt-1">{analytics?.totalCustomers} customers</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: TEAM USERS */}
      {activeTab === 'users' && (
        <div className="bg-slate-900/60 p-6 border border-slate-800 rounded-2xl space-y-4 animate-fade-in">
          <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">Store Team Directory</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-bold uppercase border-b border-slate-800">
                <tr>
                  <th className="p-3">User Name & Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users?.map((u: any) => (
                  <tr key={u.id} className="hover:bg-slate-800/40">
                    <td className="p-3">
                      <div className="font-bold text-white">{u.name}</div>
                      <div className="text-slate-500">{u.email}</div>
                    </td>
                    <td className="p-3 font-bold text-indigo-400">{u.role}</td>
                    <td className="p-3 font-bold text-emerald-400">{u.status}</td>
                    <td className="p-3 text-slate-400">{u.lastActive}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 8: SUPPORT CHAT */}
      {activeTab === 'support' && (
        <div className="bg-slate-900/60 p-6 border border-slate-800 rounded-2xl space-y-4 animate-fade-in">
          <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-400" /> Direct 1-on-1 Support Thread with Store Owner
          </h3>
          <div className="min-h-[450px]">
            <SupportChatEngine ticket={null} isSuperAdmin={true} />
          </div>
        </div>
      )}

      {/* TAB 9: AUDIT LOGS */}
      {activeTab === 'activity' && (
        <div className="bg-slate-900/60 p-6 border border-slate-800 rounded-2xl space-y-4 animate-fade-in">
          <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">Audit Activity Timeline</h3>
          <div className="space-y-3 text-xs">
            {activityLogs?.map((log: any) => (
              <div key={log.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                <div>
                  <div className="font-bold text-white">{log.action}</div>
                  <div className="text-slate-400">{log.description}</div>
                </div>
                <div className="text-right text-slate-500 font-mono text-[11px]">{log.timestamp}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 10: SETTINGS / CONTROLS */}
      {activeTab === 'settings' && (
        <div className="bg-slate-900/60 p-6 border border-slate-800 rounded-2xl space-y-6 animate-fade-in max-w-3xl">
          <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 text-rose-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Administrative High-Privilege Controls
          </h3>

          <div className="flex flex-wrap gap-4">
            <button onClick={handleFlushCache} className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700">
              Flush Store Redis Cache
            </button>
            <button onClick={handleForceLogout} className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700">
              Force Logout All User Sessions
            </button>
          </div>
        </div>
      )}

      {/* EXPLICIT CHANGE PASSWORD MODAL */}
      {showChangePassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-400" /> Explicit Change Admin Password
            </h3>

            <form onSubmit={handleChangeAdminPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">New Password</label>
                <input
                  required
                  type="password"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  placeholder="Enter new strong password..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowChangePassModal(false)} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800 rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/20">
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TEMP PASSWORD SUCCESS MODAL */}
      {tempPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-emerald-400 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" /> Temporary Credentials Generated
            </h3>
            <p className="text-xs text-slate-300">Share these temporary login credentials with the Store Admin:</p>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono space-y-2">
              <div><span className="text-slate-500">Login Email:</span> <span className="text-white font-bold">{tempPasswordModal.email}</span></div>
              <div><span className="text-slate-500">Temp Password:</span> <span className="text-emerald-400 font-bold">{tempPasswordModal.pass}</span></div>
            </div>
            <div className="flex justify-end">
              <button onClick={() => setTempPasswordModal(null)} className="px-5 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-xl">
                Done & Copy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
