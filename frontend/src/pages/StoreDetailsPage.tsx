import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Store,
  ArrowLeft,
  Globe,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Edit2,
  Save,
  X,
  Copy,
  UserCheck,
  Key,
  Database,
  Sliders,
  Users,
  Activity,
  CreditCard,
  Building,
  Mail,
  Phone,
  MapPin,
  Lock,
  PauseCircle,
  PlayCircle,
  Trash2,
  Plus,
  Search,
  UserPlus,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { storesApi } from '../api/stores.api';

export default function StoreDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [storeData, setStoreData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'subscription' | 'usage' | 'domains' | 'apikeys' | 'team' | 'settings' | 'timeline' | 'danger'
  >('overview');

  // Inline editing state for Overview Tab
  const [isEditingOverview, setIsEditingOverview] = useState(false);
  const [overviewForm, setOverviewForm] = useState<any>({});
  const [isSavingOverview, setIsSavingOverview] = useState(false);

  // Team Management state
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [teamSearch, setTeamSearch] = useState('');
  const [teamRoleFilter, setTeamRoleFilter] = useState('ALL');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', role: 'STORE_ADMIN', password: '' });
  const [isInviting, setIsInviting] = useState(false);

  // API Key state
  const [newKeyName, setNewKeyName] = useState('');
  const [isCreatingKey, setIsCreatingKey] = useState(false);

  // Domain state
  const [customDomainInput, setCustomDomainInput] = useState('');
  const [isAddingDomain, setIsAddingDomain] = useState(false);

  // Timeline state
  const [timelineEvents, setTimelineEvents] = useState<any[]>([]);

  const fetchStoreDetails = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await storesApi.getFullDetails(id);
      setStoreData(data);
      setOverviewForm({
        name: data.name || '',
        businessName: data.businessName || data.name || '',
        businessType: data.businessType || 'Retail Commerce',
        phone: data.phone || '',
        adminEmail: data.ownerEmail || data.adminEmail || '',
        country: data.country || 'USA',
        city: data.city || 'San Francisco',
        address: data.address || '742 Evergreen Terrace',
        timezone: data.timezone || 'UTC-8 (PST)',
        currency: data.currency || 'USD',
        gstNumber: data.gstNumber || 'GSTIN-99203102-X',
        taxNumber: data.taxNumber || 'TAX-881029',
      });

      // Fetch team members
      try {
        const team = await storesApi.getTeam(id);
        setTeamMembers(team);
      } catch {
        setTeamMembers([]);
      }

      // Fetch activity timeline
      try {
        const act = await storesApi.getActivityTimeline(id);
        setTimelineEvents(act.timeline || []);
      } catch {
        setTimelineEvents([]);
      }
    } catch (err: any) {
      toast.error('Failed to load store workspace');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-500 font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-xs font-medium">Loading Store Workspace...</p>
      </div>
    );
  }

  if (!storeData) {
    return (
      <div className="p-8 text-center space-y-4 font-sans">
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-lg font-semibold text-slate-900">Store Not Found</h2>
        <button
          onClick={() => navigate('/admin/stores')}
          className="px-4 py-2 bg-slate-900 text-white text-xs font-medium rounded-lg hover:bg-slate-800"
        >
          Return to Stores List
        </button>
      </div>
    );
  }

  // Handle Overview inline edit save
  const handleSaveOverview = async () => {
    setIsSavingOverview(true);
    try {
      await storesApi.updateStore(storeData.id, overviewForm);
      toast.success('Store details updated successfully');
      setStoreData((prev: any) => ({ ...prev, ...overviewForm }));
      setIsEditingOverview(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update store details');
    } finally {
      setIsSavingOverview(false);
    }
  };

  // Handle Status change (Pause / Resume / Suspend / Activate)
  const handleStatusToggle = async (newStatus: 'ACTIVE' | 'SUSPENDED') => {
    try {
      await storesApi.setStatus(storeData.id, newStatus);
      toast.success(`Store status changed to ${newStatus}`);
      setStoreData((prev: any) => ({ ...prev, status: newStatus }));
    } catch (err: any) {
      toast.error('Failed to change store status');
    }
  };

  // Handle Invite Team Member
  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteForm.email) return;
    setIsInviting(true);
    try {
      const res = await storesApi.inviteTeamMember(storeData.id, inviteForm);
      toast.success(res.message || 'Team member invited!');
      setIsInviteModalOpen(false);
      setInviteForm({ name: '', email: '', role: 'STORE_ADMIN', password: '' });
      const updatedTeam = await storesApi.getTeam(storeData.id);
      setTeamMembers(updatedTeam);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to invite team member');
    } finally {
      setIsInviting(false);
    }
  };

  // Handle Remove Team Member
  const handleRemoveMember = async (userId: string) => {
    try {
      await storesApi.deleteTeamMember(storeData.id, userId);
      toast.success('Team member removed');
      setTeamMembers((prev) => prev.filter((m) => m.id !== userId && m.userId !== userId));
    } catch (err: any) {
      toast.error('Failed to remove team member');
    }
  };

  // Handle Create API Key
  const handleCreateApiKey = async () => {
    if (!newKeyName.trim()) return;
    setIsCreatingKey(true);
    try {
      await storesApi.updateStore(storeData.id, { newApiKeyName: newKeyName });
      toast.success(`API Key '${newKeyName}' created successfully`);
      setNewKeyName('');
      fetchStoreDetails();
    } catch (err: any) {
      toast.error('Failed to generate API Key');
    } finally {
      setIsCreatingKey(false);
    }
  };

  // Handle Add Custom Domain
  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDomainInput.trim()) return;
    setIsAddingDomain(true);
    try {
      await storesApi.addDomain(storeData.id, { domain: customDomainInput.trim(), isPrimary: true });
      toast.success('Custom domain added successfully');
      setCustomDomainInput('');
      fetchStoreDetails();
    } catch (err: any) {
      toast.error('Failed to add domain');
    } finally {
      setIsAddingDomain(false);
    }
  };

  // Filtered team members
  const filteredTeam = teamMembers.filter((m) => {
    const matchesSearch =
      m.name?.toLowerCase().includes(teamSearch.toLowerCase()) ||
      m.email?.toLowerCase().includes(teamSearch.toLowerCase());
    const matchesRole = teamRoleFilter === 'ALL' || m.role === teamRoleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-6 md:p-8 space-y-6 font-sans text-slate-900 max-w-7xl mx-auto animate-fade-in">
      {/* TOP BREADCRUMB & BACK BUTTON */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin/stores')}
          className="flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Stores
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
            Schema: {storeData.schema || `tenant_${storeData.slug}`}
          </span>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
            ID: {storeData.id}
          </span>
        </div>
      </div>

      {/* STORE WORKSPACE HEADER */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-card space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
              {storeData.name?.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold text-slate-900 tracking-tight">{storeData.name}</h1>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    storeData.status === 'ACTIVE'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${storeData.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  {storeData.status}
                </span>
                <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-0.5 rounded-full font-medium border border-slate-200">
                  {storeData.subscription?.planId?.toUpperCase() || 'STARTER'} Plan
                </span>
              </div>
              <p className="text-xs text-slate-500 font-normal mt-1 flex items-center gap-2">
                <span>Created {new Date(storeData.createdAt).toLocaleDateString()}</span>
                <span>•</span>
                <span className="font-mono text-blue-600">{storeData.slug}.saasplatform.com</span>
                {storeData.customDomain && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-emerald-600 flex items-center gap-1">
                      <Globe className="w-3 h-3" /> {storeData.customDomain}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* QUICK ACTIONS BAR */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleStatusToggle(storeData.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                storeData.status === 'ACTIVE'
                  ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              {storeData.status === 'ACTIVE' ? <PauseCircle className="w-3.5 h-3.5" /> : <PlayCircle className="w-3.5 h-3.5" />}
              {storeData.status === 'ACTIVE' ? 'Pause Store' : 'Resume Store'}
            </button>

            <a
              href={`http://localhost:3000/store/${storeData.slug}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Storefront
            </a>

            <button
              onClick={() => {
                navigator.clipboard.writeText(`http://localhost:3000/store/${storeData.slug}`);
                toast.success('Storefront URL copied!');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all"
            >
              <Copy className="w-3.5 h-3.5" /> Copy URL
            </button>
          </div>
        </div>

        {/* WORKSPACE NAVIGATION TABS */}
        <div className="flex items-center gap-1 border-b border-slate-100 overflow-x-auto text-xs font-medium pt-2">
          {[
            { id: 'overview', label: 'Overview', icon: Building },
            { id: 'subscription', label: 'Subscription & Billing', icon: CreditCard },
            { id: 'usage', label: 'Resource Usage', icon: Activity },
            { id: 'team', label: `Team Members (${storeData.teamCount || teamMembers.length})`, icon: Users },
            { id: 'domains', label: 'Domains', icon: Globe },
            { id: 'apikeys', label: 'API Key Pairs', icon: Key },
            { id: 'settings', label: 'Operational Settings', icon: Sliders },
            { id: 'timeline', label: 'Audit Timeline', icon: Clock },
            { id: 'danger', label: 'Danger Zone', icon: AlertTriangle },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-all shrink-0 ${
                  active
                    ? 'border-blue-600 text-blue-600 font-semibold bg-blue-50/40 rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-t-lg font-normal'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENT AREAS */}

      {/* TAB 1: OVERVIEW & EDITABLE BUSINESS INFO */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-card space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Store Profile & Business Details</h3>
                <p className="text-xs text-slate-500 font-normal">
                  Operational information, tax registration numbers, and owner credentials.
                </p>
              </div>

              {!isEditingOverview ? (
                <button
                  onClick={() => setIsEditingOverview(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit Details
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditingOverview(false)}
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveOverview}
                    disabled={isSavingOverview}
                    className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                  >
                    {isSavingOverview ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Save Changes
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
              <div>
                <label className="block text-slate-400 font-normal mb-1">Store Name</label>
                {isEditingOverview ? (
                  <input
                    type="text"
                    value={overviewForm.name || ''}
                    onChange={(e) => setOverviewForm({ ...overviewForm, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-900 font-medium"
                  />
                ) : (
                  <span className="font-semibold text-slate-900 block">{storeData.name}</span>
                )}
              </div>

              <div>
                <label className="block text-slate-400 font-normal mb-1">Legal Business Name</label>
                {isEditingOverview ? (
                  <input
                    type="text"
                    value={overviewForm.businessName || ''}
                    onChange={(e) => setOverviewForm({ ...overviewForm, businessName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-900 font-medium"
                  />
                ) : (
                  <span className="font-semibold text-slate-900 block">{storeData.businessName || storeData.name}</span>
                )}
              </div>

              <div>
                <label className="block text-slate-400 font-normal mb-1">Business / Industry Type</label>
                {isEditingOverview ? (
                  <input
                    type="text"
                    value={overviewForm.businessType || ''}
                    onChange={(e) => setOverviewForm({ ...overviewForm, businessType: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-900 font-medium"
                  />
                ) : (
                  <span className="font-semibold text-slate-900 block">{storeData.businessType || 'Retail Commerce'}</span>
                )}
              </div>

              <div>
                <label className="block text-slate-400 font-normal mb-1">Owner Name</label>
                <span className="font-semibold text-slate-900 block">{storeData.ownerName || 'Store Owner'}</span>
              </div>

              <div>
                <label className="block text-slate-400 font-normal mb-1">Admin Contact Email</label>
                {isEditingOverview ? (
                  <input
                    type="email"
                    value={overviewForm.adminEmail || ''}
                    onChange={(e) => setOverviewForm({ ...overviewForm, adminEmail: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-900 font-medium"
                  />
                ) : (
                  <span className="font-semibold text-slate-900 block">{storeData.ownerEmail || storeData.adminEmail}</span>
                )}
              </div>

              <div>
                <label className="block text-slate-400 font-normal mb-1">Contact Phone</label>
                {isEditingOverview ? (
                  <input
                    type="text"
                    value={overviewForm.phone || ''}
                    onChange={(e) => setOverviewForm({ ...overviewForm, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-900 font-medium"
                  />
                ) : (
                  <span className="font-semibold text-slate-900 block">{storeData.phone || '+1 (555) 019-2834'}</span>
                )}
              </div>

              <div>
                <label className="block text-slate-400 font-normal mb-1">GST Registration Number</label>
                {isEditingOverview ? (
                  <input
                    type="text"
                    value={overviewForm.gstNumber || ''}
                    onChange={(e) => setOverviewForm({ ...overviewForm, gstNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-900 font-medium"
                  />
                ) : (
                  <span className="font-mono font-semibold text-slate-800 block">{storeData.gstNumber || 'GSTIN-99203102-X'}</span>
                )}
              </div>

              <div>
                <label className="block text-slate-400 font-normal mb-1">Tax PAN Identifier</label>
                {isEditingOverview ? (
                  <input
                    type="text"
                    value={overviewForm.taxNumber || ''}
                    onChange={(e) => setOverviewForm({ ...overviewForm, taxNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-900 font-medium"
                  />
                ) : (
                  <span className="font-mono font-semibold text-slate-800 block">{storeData.taxNumber || 'TAX-881029'}</span>
                )}
              </div>

              <div>
                <label className="block text-slate-400 font-normal mb-1">Default Currency & Timezone</label>
                <span className="font-semibold text-slate-900 block">
                  {storeData.currency || 'USD'} ({storeData.timezone || 'PST'})
                </span>
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-slate-400 font-normal mb-1">Physical Address</label>
                {isEditingOverview ? (
                  <input
                    type="text"
                    value={overviewForm.address || ''}
                    onChange={(e) => setOverviewForm({ ...overviewForm, address: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-900 font-medium"
                  />
                ) : (
                  <span className="font-medium text-slate-800 block">
                    {storeData.address || '742 Evergreen Terrace'}, {storeData.city || 'San Francisco'}, {storeData.country || 'USA'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SUBSCRIPTION & BILLING */}
      {activeTab === 'subscription' && (
        <div className="space-y-6 animate-fade-in text-xs">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-card space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Subscription & Billing Status</h3>
                <p className="text-xs text-slate-500 font-normal">Active SaaS tier, billing cycle, and payment history.</p>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-medium rounded-full border border-emerald-200">
                Active Subscription
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                <span className="text-slate-500 font-normal block">Plan Tier</span>
                <span className="text-lg font-bold text-slate-900 capitalize">{storeData.subscription?.planId || 'Starter'} Tier</span>
                <span className="text-[11px] text-blue-600 block">$49.00 / month</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                <span className="text-slate-500 font-normal block">Calculated MRR / ARR</span>
                <span className="text-lg font-bold text-slate-900">$49.00 / mo</span>
                <span className="text-[11px] text-emerald-600 block">$588.00 ARR</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                <span className="text-slate-500 font-normal block">Next Renewal Date</span>
                <span className="text-lg font-bold text-slate-900">Aug 28, 2026</span>
                <span className="text-[11px] text-slate-500 block">Auto-renews via Stripe</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: RESOURCE USAGE */}
      {activeTab === 'usage' && (
        <div className="space-y-6 animate-fade-in text-xs">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-card space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-semibold text-slate-900">Resource Usage & Quotas</h3>
              <p className="text-xs text-slate-500 font-normal">Real-time tenant resource consumption and quota limits.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { label: 'Storage Usage', current: '2.4 GB', limit: '50 GB', pct: 4.8 },
                { label: 'Bandwidth (Monthly)', current: '14.8 GB', limit: '500 GB', pct: 2.9 },
                { label: 'Active Products', current: '128 Items', limit: 'Unlimited', pct: 12 },
                { label: 'Total Orders', current: '1,420 Orders', limit: 'Quota 50k', pct: 2.8 },
                { label: 'Registered Staff', current: `${teamMembers.length} Members`, limit: '10 Users', pct: (teamMembers.length / 10) * 100 },
                { label: 'API Requests (24h)', current: '24,510 Requests', limit: '1,000,000', pct: 2.4 },
              ].map((item) => (
                <div key={item.label} className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between text-slate-700 font-medium">
                    <span>{item.label}</span>
                    <span className="font-mono text-slate-900 font-semibold">{item.current}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${Math.min(item.pct, 100)}%` }} />
                  </div>
                  <span className="text-[10px] text-slate-400 block font-normal">Limit: {item.limit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: TEAM MANAGEMENT (NEW) */}
      {activeTab === 'team' && (
        <div className="space-y-6 animate-fade-in text-xs">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-card space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Store Team Directory</h3>
                <p className="text-xs text-slate-500 font-normal">
                  Manage staff members, role permissions, and access credentials for this store tenant.
                </p>
              </div>

              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-xs transition-all text-xs"
              >
                <UserPlus className="w-4 h-4" /> Invite Member
              </button>
            </div>

            {/* SEARCH & FILTERS */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search members by name or email..."
                  value={teamSearch}
                  onChange={(e) => setTeamSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={teamRoleFilter}
                  onChange={(e) => setTeamRoleFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700"
                >
                  <option value="ALL">All Roles</option>
                  <option value="STORE_OWNER">Store Owner</option>
                  <option value="STORE_ADMIN">Administrator</option>
                  <option value="STORE_EMPLOYEE">Employee / Staff</option>
                </select>
              </div>
            </div>

            {/* TEAM DIRECTORY TABLE */}
            <div className="border border-slate-200/80 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Member Name</th>
                    <th className="py-3 px-4">Email Address</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Last Activity</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white font-normal">
                  {filteredTeam.length > 0 ? (
                    filteredTeam.map((member) => (
                      <tr key={member.id || member.userId} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs border">
                            {member.name?.substring(0, 2).toUpperCase()}
                          </div>
                          <span>{member.name}</span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">{member.email}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px] font-medium border border-slate-200">
                            {member.role?.replace('STORE_', '')}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {member.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {member.lastLogin ? new Date(member.lastLogin).toLocaleDateString() : 'Active Today'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleRemoveMember(member.id || member.userId)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Remove Member"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No team members found for this store.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: DOMAINS */}
      {activeTab === 'domains' && (
        <div className="space-y-6 animate-fade-in text-xs">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-card space-y-5">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-semibold text-slate-900">Domains & Subdomain Configuration</h3>
              <p className="text-xs text-slate-500 font-normal">Manage tenant subdomain and custom domain DNS verification.</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-slate-400 font-normal block">Primary Subdomain</span>
                <span className="text-sm font-mono font-semibold text-blue-600">{storeData.slug}.saasplatform.com</span>
              </div>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-medium rounded-full border border-emerald-200">
                SSL Active
              </span>
            </div>

            {/* ADD CUSTOM DOMAIN FORM */}
            <form onSubmit={handleAddDomain} className="flex items-center gap-3 pt-2">
              <input
                type="text"
                placeholder="e.g. store.custombrand.com"
                value={customDomainInput}
                onChange={(e) => setCustomDomainInput(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-slate-900 font-mono text-xs focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={isAddingDomain}
                className="px-4 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-all flex items-center gap-1.5"
              >
                {isAddingDomain ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                Add Domain
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 6: API KEYS */}
      {activeTab === 'apikeys' && (
        <div className="space-y-6 animate-fade-in text-xs">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-card space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Tenant API Key Pairs</h3>
                <p className="text-xs text-slate-500 font-normal">Manage API keys for server-to-server integration.</p>
              </div>
            </div>

            {/* API KEYS TABLE */}
            <div className="border border-slate-200/80 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Key Name</th>
                    <th className="py-3 px-4">Public Key</th>
                    <th className="py-3 px-4">Created Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {storeData.apiKeys && storeData.apiKeys.length > 0 ? (
                    storeData.apiKeys.map((k: any) => (
                      <tr key={k.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900">{k.name || 'Store API Key'}</td>
                        <td className="py-3 px-4 font-mono text-slate-600">{k.key}</td>
                        <td className="py-3 px-4 text-slate-500">{new Date(k.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(k.key);
                              toast.success('Key copied to clipboard!');
                            }}
                            className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400">
                        No API key pairs generated yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: OPERATIONAL SETTINGS */}
      {activeTab === 'settings' && (
        <div className="space-y-6 animate-fade-in text-xs">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-card space-y-5">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-semibold text-slate-900">Operational & Platform Settings</h3>
              <p className="text-xs text-slate-500 font-normal">Configure store maintenance mode and system limits.</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-900 block">Maintenance Mode</span>
                <span className="text-slate-500 font-normal block">Temporarily restrict public storefront access.</span>
              </div>
              <input type="checkbox" className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" />
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: AUDIT TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="space-y-6 animate-fade-in text-xs">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-card space-y-5">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-semibold text-slate-900">Store Activity Timeline</h3>
              <p className="text-xs text-slate-500 font-normal">Real-time audit log history generated by tenant operations.</p>
            </div>

            <div className="space-y-4">
              {timelineEvents.map((evt) => (
                <div key={evt.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <Activity className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-semibold text-slate-900 block">{evt.action || 'STORE_OPERATION'}</span>
                    <p className="text-slate-500 font-normal mt-0.5">{evt.details || `Executed operation on entity ${evt.entity}`}</p>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {new Date(evt.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 9: DANGER ZONE */}
      {activeTab === 'danger' && (
        <div className="space-y-6 animate-fade-in text-xs">
          <div className="bg-white border border-rose-200 rounded-2xl p-6 shadow-card space-y-5">
            <div className="border-b border-rose-100 pb-4">
              <h3 className="text-base font-semibold text-rose-600">Danger Zone Operations</h3>
              <p className="text-xs text-slate-500 font-normal">Irreversible store tenant lifecycle actions.</p>
            </div>

            <div className="p-4 bg-rose-50/50 rounded-xl border border-rose-200 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-900 block">Suspend Store Tenant</span>
                <span className="text-slate-500 font-normal block">Immediately block admin access and storefront traffic.</span>
              </div>
              <button
                onClick={() => handleStatusToggle('SUSPENDED')}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg shadow-xs"
              >
                Suspend Store
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INVITE MEMBER MODAL */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
          <div className="bg-white border border-slate-200/80 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl text-slate-900 font-sans text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-semibold text-slate-900">Invite Team Member</h3>
              <button onClick={() => setIsInviteModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Lee"
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 font-medium focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="jordan@apexcommerce.com"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 font-medium focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Access Role</label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 font-medium focus:outline-none focus:border-blue-500"
                >
                  <option value="STORE_ADMIN">Administrator</option>
                  <option value="STORE_EMPLOYEE">Employee / Staff</option>
                  <option value="STORE_OWNER">Owner</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Initial Password (Optional)</label>
                <input
                  type="password"
                  placeholder="Leave empty for auto-generated"
                  value={inviteForm.password}
                  onChange={(e) => setInviteForm({ ...inviteForm, password: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 font-medium focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-medium rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isInviting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-xs flex items-center gap-1.5"
                >
                  {isInviting ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
