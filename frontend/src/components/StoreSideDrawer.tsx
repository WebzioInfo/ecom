import React, { useState, useEffect } from 'react';
import {
  X,
  Store as StoreIcon,
  Palette,
  Globe,
  Key,
  Settings,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Plus,
  Trash2,
  RotateCcw,
  Check,
  Shield,
  Clock,
  ExternalLink,
  Eye,
  Edit2,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { storesApi, Store } from '../api/stores.api';

export type DrawerMode = 'details' | 'edit' | 'branding' | 'domains' | 'apikeys' | 'settings';

interface StoreSideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  store: Store | null;
  mode: DrawerMode;
  onSuccess?: () => void;
}

export default function StoreSideDrawer({
  isOpen,
  onClose,
  store,
  mode: initialMode,
  onSuccess,
}: StoreSideDrawerProps) {
  const [activeMode, setActiveMode] = useState<DrawerMode>(initialMode);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [editName, setEditName] = useState('');
  const [editOwnerName, setEditOwnerName] = useState('');
  const [editOwnerEmail, setEditOwnerEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');

  // Branding states
  const [logoUrl, setLogoUrl] = useState('');
  const [faviconUrl, setFaviconUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#2563eb');
  const [secondaryColor, setSecondaryColor] = useState('#0f172a');

  // Domains states
  const [domains, setDomains] = useState<any[]>([]);
  const [newDomain, setNewDomain] = useState('');

  // API Keys states
  const [apiKeys, setApiKeys] = useState<any[]>([]);

  // Settings states
  const [currency, setCurrency] = useState('USD');
  const [timezone, setTimezone] = useState('UTC-8 (PST)');
  const [language, setLanguage] = useState('en');
  const [dateFormat, setDateFormat] = useState('YYYY-MM-DD');

  useEffect(() => {
    setActiveMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (store && isOpen) {
      setEditName(store.name || '');
      setEditOwnerName(store.owner?.name || store.ownerName || '');
      setEditOwnerEmail(store.owner?.email || store.ownerEmail || '');
      setEditPhone(store.phone || '');

      setLogoUrl(store.logo || '');
      setFaviconUrl(store.favicon || '');
      setPrimaryColor(store.primaryColor || '#2563eb');
      setSecondaryColor(store.secondaryColor || '#0f172a');

      setCurrency(store.currency || 'USD');
      setTimezone(store.timezone || 'UTC-8 (PST)');
      setLanguage(store.language || 'en');
      setDateFormat(store.dateFormat || 'YYYY-MM-DD');

      loadDrawerData(store.id || store.slug);
    }
  }, [store, isOpen, activeMode]);

  const loadDrawerData = async (storeId: string) => {
    setLoading(true);
    try {
      if (activeMode === 'domains') {
        const res = await storesApi.getDomains(storeId).catch(() => ({ domains: [] }));
        setDomains(res.domains || [
          { id: 'dom-1', domain: `${store?.slug}.saasplatform.com`, isPrimary: true, verificationStatus: 'VERIFIED', sslStatus: 'ACTIVE' },
        ]);
      } else if (activeMode === 'apikeys') {
        const res = await storesApi.getApiKeys(storeId).catch(() => ({ keys: [] }));
        setApiKeys(res.keys || [
          { id: 'key-1', name: 'Production Storefront Key', publicKey: `pk_live_${store?.slug}_98765`, secretKeyMasked: 'sk_live_••••••••••••3a1b', status: 'ACTIVE', created: '2026-07-29' },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !store) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard`);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await storesApi.updateStore(store.id || store.slug, {
        name: editName,
        ownerName: editOwnerName,
        ownerEmail: editOwnerEmail,
        phone: editPhone,
      });
      toast.success('Store information updated successfully');
      onSuccess?.();
      onClose();
    } catch {
      toast.error('Failed to update store details');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await storesApi.updateBranding(store.id || store.slug, {
        logo: logoUrl,
        favicon: faviconUrl,
        primaryColor,
        secondaryColor,
      });
      toast.success('Branding assets updated successfully');
      onSuccess?.();
    } catch {
      toast.error('Failed to update branding');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain) return;
    setSubmitting(true);
    try {
      await storesApi.addDomain(store.id || store.slug, newDomain);
      toast.success(`Registered custom domain ${newDomain}`);
      setNewDomain('');
      loadDrawerData(store.id || store.slug);
    } catch {
      toast.error('Failed to add custom domain');
    } fontId: '';
    setSubmitting(false);
  };

  const handleRotateKey = async () => {
    try {
      await storesApi.rotateApiKey(store.id || store.slug);
      toast.success('API key pair regenerated successfully');
      loadDrawerData(store.id || store.slug);
    } catch {
      toast.error('Failed to rotate API keys');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await storesApi.updateSettings(store.id || store.slug, {
        currency,
        timezone,
        language,
        dateFormat,
      });
      toast.success('Store general settings updated successfully');
      onSuccess?.();
    } catch {
      toast.error('Failed to update settings');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/50 backdrop-blur-xs animate-fade-in flex justify-end">
      <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col border-l border-slate-200/80">
        {/* DRAWER HEADER */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold text-sm">
              {store.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{store.name}</h2>
              <div className="text-xs text-slate-500 font-mono">store_slug: {store.slug}</div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* DRAWER NAVIGATION TABS */}
        <div className="flex items-center gap-1 p-2 bg-slate-100 border-b border-slate-200/60 overflow-x-auto text-xs font-semibold">
          {[
            { mode: 'details', label: 'Overview', icon: Eye },
            { mode: 'edit', label: 'Quick Edit', icon: Edit2 },
            { mode: 'branding', label: 'Branding', icon: Palette },
            { mode: 'domains', label: 'Domains', icon: Globe },
            { mode: 'apikeys', label: 'API Keys', icon: Key },
            { mode: 'settings', label: 'Settings', icon: Settings },
          ].map((item) => {
            const Icon = item.icon;
            const active = activeMode === item.mode;
            return (
              <button
                key={item.mode}
                onClick={() => setActiveMode(item.mode as DrawerMode)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                  active ? 'bg-white text-blue-600 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* DRAWER CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* MODE: DETAILS */}
          {activeMode === 'details' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Store Status & Health</div>
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> Active Store
                  </span>
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Store Health: 99.9%
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="text-slate-400 font-medium block">Owner</span>
                  <span className="font-bold text-slate-900">{store.owner?.name || store.ownerName || 'Marcus Sterling'}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="text-slate-400 font-medium block">Owner Email</span>
                  <span className="font-semibold text-slate-900">{store.owner?.email || store.ownerEmail || 'owner@store.com'}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="text-slate-400 font-medium block">Subscription Plan</span>
                  <span className="font-bold text-blue-600">{store.plan || 'Pro Plan'}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="text-slate-400 font-medium block">Billing Cycle</span>
                  <span className="font-semibold text-slate-900 uppercase">{store.billingCycle || 'Monthly'}</span>
                </div>
              </div>
            </div>
          )}

          {/* MODE: QUICK EDIT */}
          {activeMode === 'edit' && (
            <form onSubmit={handleSaveEdit} className="space-y-4 animate-fade-in text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Store Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Owner Name</label>
                <input
                  type="text"
                  value={editOwnerName}
                  onChange={(e) => setEditOwnerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Owner Email</label>
                <input
                  type="email"
                  value={editOwnerEmail}
                  onChange={(e) => setEditOwnerEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl shadow-sm">
                  {submitting ? 'Saving...' : 'Save Store Details'}
                </button>
              </div>
            </form>
          )}

          {/* MODE: BRANDING */}
          {activeMode === 'branding' && (
            <form onSubmit={handleSaveBranding} className="space-y-4 animate-fade-in text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Store Logo URL</label>
                <input
                  type="url"
                  placeholder="https://cdn.saas.com/logo.png"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Primary Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Secondary Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200"
                    />
                    <input
                      type="text"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* LIVE PREVIEW CARD */}
              <div className="p-4 rounded-2xl border border-slate-200 space-y-2 mt-4" style={{ backgroundColor: '#f8fafc' }}>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Live Preview Card</div>
                <div className="p-4 rounded-xl shadow-card bg-white flex items-center justify-between">
                  <span className="font-bold text-sm" style={{ color: secondaryColor }}>{store.name}</span>
                  <button className="px-3 py-1.5 rounded-lg text-white font-bold text-xs" style={{ backgroundColor: primaryColor }}>
                    Shop Now
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button type="submit" disabled={submitting} className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl">
                  Save Branding
                </button>
              </div>
            </form>
          )}

          {/* MODE: DOMAINS */}
          {activeMode === 'domains' && (
            <div className="space-y-4 animate-fade-in text-xs">
              <form onSubmit={handleAddDomain} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. store.custombrand.com"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none"
                />
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl flex items-center gap-1">
                  <Plus className="w-4 h-4" /> Add Domain
                </button>
              </form>

              <div className="space-y-2">
                {domains.map((d) => (
                  <div key={d.id || d.domain} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        {d.domain}
                        {d.isPrimary && <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 rounded-full">Primary</span>}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">SSL: {d.sslStatus || 'ACTIVE'}</div>
                    </div>
                    <span className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 rounded-full">
                      {d.verificationStatus || 'VERIFIED'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MODE: API KEYS */}
          {activeMode === 'apikeys' && (
            <div className="space-y-4 animate-fade-in text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">Active API Keys</span>
                <button onClick={handleRotateKey} className="px-3 py-1.5 bg-blue-50 text-blue-600 font-bold rounded-lg border border-blue-200 flex items-center gap-1">
                  <RotateCcw className="w-3.5 h-3.5" /> Rotate Keys
                </button>
              </div>

              <div className="space-y-3">
                {apiKeys.map((key) => (
                  <div key={key.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>{key.name}</span>
                      <span className="text-emerald-600 font-mono text-[11px]">ACTIVE</span>
                    </div>
                    <div className="flex items-center justify-between font-mono bg-white p-2 rounded-lg border border-slate-200 text-slate-600">
                      <span>{key.publicKey}</span>
                      <button onClick={() => handleCopy(key.publicKey, 'Public Key')} className="text-slate-400 hover:text-slate-700">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MODE: SETTINGS */}
          {activeMode === 'settings' && (
            <form onSubmit={handleSaveSettings} className="space-y-4 animate-fade-in text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CAD">CAD ($)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Timezone</label>
                  <input
                    type="text"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Language</label>
                  <input
                    type="text"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date Format</label>
                  <input
                    type="text"
                    value={dateFormat}
                    onChange={(e) => setDateFormat(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button type="submit" disabled={submitting} className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl">
                  Save General Settings
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
