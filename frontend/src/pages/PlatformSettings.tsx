import React, { useEffect, useState } from 'react';
import {
  Settings,
  Globe,
  Palette,
  Mail,
  HardDrive,
  Key,
  Webhook,
  Shield,
  Radio,
  Save,
  RefreshCw,
  Plus,
  Copy,
  Trash2,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Sliders,
  SlidersHorizontal,
} from 'lucide-react';
import toast from 'react-hot-toast';

import {
  platformSettingsDevApi,
  GeneralSettings,
  BrandingSettings,
  LocalizationSettings,
  EmailSettings,
  StorageSettings,
  ApiSettingsData,
  WebhookItem,
} from '../api/platform-settings-dev.api';
import SettingsDeveloperDrawer, { SettingsDrawerMode } from '../components/SettingsDeveloperDrawer';

export default function PlatformSettings() {
  const [activeTab, setActiveTab] = useState<
    'GENERAL' | 'BRANDING' | 'LOCALIZATION' | 'EMAIL' | 'STORAGE' | 'API' | 'WEBHOOKS' | 'SECURITY' | 'MAINTENANCE'
  >('GENERAL');

  // Loading States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);

  // Form States
  const [general, setGeneral] = useState<GeneralSettings>({
    platformName: 'Webzio Ecommerce SaaS Platform',
    companyName: 'Webzio Technologies Inc.',
    supportEmail: 'support@webzio.com',
    supportPhone: '+1 (800) 555-0199',
    website: 'https://webzio.com',
    logoUrl: '/logo.png',
    iconUrl: '/favicon.ico',
    timezone: 'UTC',
    dateFormat: 'YYYY-MM-DD',
    language: 'English (US)',
    currency: 'USD ($)',
  });

  const [branding, setBranding] = useState<BrandingSettings>({
    primaryColor: '#2563eb',
    secondaryColor: '#0f172a',
    accentColor: '#10b981',
    logoUrl: '/logo-light.png',
    darkLogoUrl: '/logo-dark.png',
    faviconUrl: '/favicon.ico',
    emailLogoUrl: '/email-header-logo.png',
  });

  const [localization, setLocalization] = useState<LocalizationSettings>({
    defaultLanguage: 'en-US',
    timezone: 'UTC',
    currency: 'USD',
    regionalFormat: 'United States (en-US)',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '24 Hours',
  });

  const [email, setEmail] = useState<EmailSettings>({
    smtpHost: 'smtp.mailgun.org',
    smtpPort: 587,
    senderName: 'Webzio Platform Billing',
    senderEmail: 'noreply@webzio.com',
    encryption: 'TLS',
    authRequired: true,
  });

  const [storage, setStorage] = useState<StorageSettings>({
    provider: 'AWS_S3',
    bucketName: 'webzio-saas-media-cluster',
    region: 'us-east-1',
    maxUploadMB: 50,
    autoCleanupDays: 30,
  });

  const [apiData, setApiData] = useState<ApiSettingsData>({
    baseUrl: 'https://api.webzio.com/v1',
    version: 'v2.4.0',
    platformApiKey: 'wbx_live_pk_9821a7f34c901e',
    rateLimitPerMinute: 1000,
    docsUrl: 'https://docs.webzio.com/api',
  });

  const [webhooks, setWebhooks] = useState<WebhookItem[]>([]);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [announcementBanner, setAnnouncementBanner] = useState('');

  // Webhook Modal
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookDesc, setWebhookDesc] = useState('');

  // Drawer States
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<SettingsDrawerMode>('webhook');
  const [drawerItem, setDrawerItem] = useState<any>(null);

  const fetchSettingsData = async () => {
    setLoading(true);
    try {
      const [genRes, brandRes, locRes, emailRes, storRes, apiRes, webRes] = await Promise.all([
        platformSettingsDevApi.getGeneralSettings(),
        platformSettingsDevApi.getBrandingSettings(),
        platformSettingsDevApi.getLocalizationSettings(),
        platformSettingsDevApi.getEmailSettings(),
        platformSettingsDevApi.getStorageSettings(),
        platformSettingsDevApi.getApiSettings(),
        platformSettingsDevApi.getWebhooks(),
      ]);

      if (genRes) setGeneral(genRes);
      if (brandRes) setBranding(brandRes);
      if (locRes) setLocalization(locRes);
      if (emailRes) setEmail(emailRes);
      if (storRes) setStorage(storRes);
      if (apiRes) setApiData(apiRes);

      setWebhooks(
        Array.isArray(webRes) && webRes.length
          ? webRes
          : [
              {
                id: 'wh-1',
                url: 'https://hooks.slack.com/services/T00/B00/X00',
                description: 'Slack Platform Billing Alerts',
                events: ['billing.invoice.paid', 'subscription.cancelled'],
                secretKey: 'whsec_live_981a2f340',
                status: 'ACTIVE',
                lastDelivery: '10 mins ago',
                failureCount: 0,
              },
            ],
      );
    } catch {
      toast.error('Failed to load platform settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettingsData();
  }, []);

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await platformSettingsDevApi.updateGeneralSettings(general);
      toast.success('General settings saved');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    setTestingEmail(true);
    try {
      await platformSettingsDevApi.testEmailConnection();
      toast.success('SMTP Connection Test Succeeded! Verification message dispatched.');
    } catch {
      toast.error('SMTP Connection failed. Verify host and port credentials.');
    } finally {
      setTestingEmail(false);
    }
  };

  const handleRotateKey = async () => {
    if (!window.confirm('Rotate platform secret API key? Existing integrations must update credentials.')) return;
    try {
      const res = await platformSettingsDevApi.rotatePlatformApiKey();
      setApiData(res);
      toast.success('Platform API Key rotated');
    } catch {
      toast.error('Failed to rotate API key');
    }
  };

  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await platformSettingsDevApi.createWebhook({
        url: webhookUrl,
        description: webhookDesc,
        events: ['store.created', 'subscription.updated'],
      });
      toast.success('Webhook endpoint registered');
      setIsWebhookModalOpen(false);
      setWebhookUrl('');
      setWebhookDesc('');
      fetchSettingsData();
    } catch {
      toast.error('Failed to register webhook');
    }
  };

  const openDrawer = (item: any, mode: SettingsDrawerMode) => {
    setDrawerItem(item);
    setDrawerMode(mode);
    setDrawerOpen(true);
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6 max-w-[1600px] mx-auto animate-pulse text-slate-400">
        <div className="h-12 bg-slate-200 rounded-2xl w-1/3" />
        <div className="h-64 bg-slate-200/80 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1700px] mx-auto text-slate-900 bg-slate-50/60 min-h-screen">
      {/* ─── PAGE HEADER ─────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Settings className="w-4 h-4" /> Global Platform Architecture
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Platform Settings & Operations</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Configure platform identity, branding, email SMTP, storage cluster, API rate limits, and webhooks.
          </p>
        </div>
      </div>

      {/* ─── NAVIGATION MODULE TABS ───────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto text-xs font-bold bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-xs">
        {[
          { tab: 'GENERAL', label: 'General Settings', icon: Globe },
          { tab: 'BRANDING', label: 'Platform Branding', icon: Palette },
          { tab: 'LOCALIZATION', label: 'Localization', icon: Sliders },
          { tab: 'EMAIL', label: 'Email (SMTP)', icon: Mail },
          { tab: 'STORAGE', label: 'Storage Cluster', icon: HardDrive },
          { tab: 'API', label: 'API Center', icon: Key },
          { tab: 'WEBHOOKS', label: 'Webhook Engine', icon: Webhook },
          { tab: 'SECURITY', label: 'Security Policies', icon: Shield },
          { tab: 'MAINTENANCE', label: 'Maintenance Mode', icon: Radio },
        ].map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.tab;
          return (
            <button
              key={t.tab}
              onClick={() => setActiveTab(t.tab as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
                active
                  ? 'bg-blue-600 text-white shadow-xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ─── TAB 1: GENERAL SETTINGS ─────────────────────────────────────── */}
      {activeTab === 'GENERAL' && (
        <form onSubmit={handleSaveGeneral} className="space-y-6 text-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" /> Platform Profile & Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Platform Name</label>
                <input
                  type="text"
                  value={general.platformName}
                  onChange={(e) => setGeneral({ ...general, platformName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Company Name</label>
                <input
                  type="text"
                  value={general.companyName}
                  onChange={(e) => setGeneral({ ...general, companyName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Support Email</label>
                <input
                  type="email"
                  value={general.supportEmail}
                  onChange={(e) => setGeneral({ ...general, supportEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Support Phone</label>
                <input
                  type="text"
                  value={general.supportPhone}
                  onChange={(e) => setGeneral({ ...general, supportPhone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs"
              >
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ─── TAB 2: PLATFORM BRANDING ────────────────────────────────────── */}
      {activeTab === 'BRANDING' && (
        <div className="space-y-6 text-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Palette className="w-5 h-5 text-blue-600" /> Color Palette & Theme Assets
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Primary Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={branding.primaryColor}
                    onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                    className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={branding.primaryColor}
                    onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Secondary Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={branding.secondaryColor}
                    onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                    className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={branding.secondaryColor}
                    onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Accent Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={branding.accentColor}
                    onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })}
                    className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={branding.accentColor}
                    onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Live Interactive Preview Card */}
            <div className="p-5 rounded-2xl border border-slate-200/80 space-y-2 bg-slate-50">
              <div className="font-bold text-slate-900">Live Branding Color Preview</div>
              <div className="flex items-center gap-3 pt-2">
                <button style={{ backgroundColor: branding.primaryColor }} className="px-4 py-2 text-white font-bold rounded-xl shadow-xs">
                  Primary Accent
                </button>
                <button style={{ backgroundColor: branding.accentColor }} className="px-4 py-2 text-white font-bold rounded-xl shadow-xs">
                  Secondary Accent
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 4: EMAIL SMTP CONFIGURATION ──────────────────────────────── */}
      {activeTab === 'EMAIL' && (
        <div className="space-y-6 text-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" /> SMTP Email Service Credentials
              </h2>
              <button
                onClick={handleTestEmail}
                disabled={testingEmail}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
              >
                <Play className="w-3.5 h-3.5" /> Test SMTP Connection
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">SMTP Host</label>
                <input
                  type="text"
                  value={email.smtpHost}
                  onChange={(e) => setEmail({ ...email, smtpHost: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">SMTP Port</label>
                <input
                  type="number"
                  value={email.smtpPort}
                  onChange={(e) => setEmail({ ...email, smtpPort: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Sender Name</label>
                <input
                  type="text"
                  value={email.senderName}
                  onChange={(e) => setEmail({ ...email, senderName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Sender Email</label>
                <input
                  type="email"
                  value={email.senderEmail}
                  onChange={(e) => setEmail({ ...email, senderEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 6: API CENTER ────────────────────────────────────────────── */}
      {activeTab === 'API' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 space-y-4 animate-fade-in text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Key className="w-5 h-5 text-blue-600" /> Platform Secret API Keys
              </h2>
              <p className="text-slate-500">Super admin API key credentials for headless integration.</p>
            </div>
            <button
              onClick={handleRotateKey}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl"
            >
              Rotate Platform Key
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 font-mono flex items-center justify-between">
            <span className="font-bold text-slate-900">{apiData.platformApiKey}</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(apiData.platformApiKey);
                toast.success('Copied API Key to clipboard');
              }}
              className="p-1.5 text-slate-400 hover:text-slate-900"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ─── TAB 7: WEBHOOK ENGINE ────────────────────────────────────────── */}
      {activeTab === 'WEBHOOKS' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 space-y-4 animate-fade-in text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Webhook className="w-5 h-5 text-blue-600" /> Webhook Event Engine
              </h2>
              <p className="text-slate-500">Outbound platform webhooks for system billing and store events.</p>
            </div>

            <button
              onClick={() => setIsWebhookModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs"
            >
              <Plus className="w-4 h-4" /> Add Webhook Endpoint
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-3.5">Endpoint URL</th>
                  <th className="p-3.5">Description</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Last Delivery</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {webhooks.map((wh) => (
                  <tr key={wh.id} className="hover:bg-slate-50/80">
                    <td className="p-3.5 font-mono font-bold text-slate-900 break-all">{wh.url}</td>
                    <td className="p-3.5 font-medium text-slate-700">{wh.description}</td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800">
                        {wh.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-500">{wh.lastDelivery}</td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => openDrawer(wh, 'webhook')}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB 9: MAINTENANCE MODE ─────────────────────────────────────── */}
      {activeTab === 'MAINTENANCE' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 space-y-4 animate-fade-in text-xs">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Radio className="w-5 h-5 text-blue-600" /> Platform Maintenance Controls
            </h2>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-900">Maintenance Mode</div>
              <div className="text-slate-500">Temporarily suspend storefront orders for scheduled system maintenance.</div>
            </div>
            <button
              onClick={() => {
                setMaintenanceMode(!maintenanceMode);
                toast.success(`Maintenance mode ${!maintenanceMode ? 'ENABLED' : 'DISABLED'}`);
              }}
              className={`px-4 py-2 rounded-xl font-bold text-white transition-all ${
                maintenanceMode ? 'bg-rose-600' : 'bg-slate-700'
              }`}
            >
              {maintenanceMode ? 'Maintenance ACTIVE' : 'Enable Maintenance'}
            </button>
          </div>
        </div>
      )}

      {/* ─── ADD WEBHOOK MODAL DIALOG ────────────────────────────────────── */}
      {isWebhookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 text-slate-900 text-xs">
            <h3 className="text-base font-bold text-slate-900">Register Webhook Endpoint</h3>
            <form onSubmit={handleCreateWebhook} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Endpoint URL *</label>
                <input
                  type="url"
                  placeholder="https://yourserver.com/webhooks"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Production Billing Webhook"
                  value={webhookDesc}
                  onChange={(e) => setWebhookDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsWebhookModalOpen(false)} className="px-4 py-2 bg-slate-100 font-bold rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl">
                  Add Webhook
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── SIDE DRAWER INTEGRATION ──────────────────────────────────────── */}
      <SettingsDeveloperDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        mode={drawerMode}
        itemData={drawerItem}
        onSuccess={() => fetchSettingsData()}
      />
    </div>
  );
}
