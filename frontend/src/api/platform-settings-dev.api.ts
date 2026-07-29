import { api } from './axios';

export interface GeneralSettings {
  platformName: string;
  companyName: string;
  supportEmail: string;
  supportPhone: string;
  website: string;
  logoUrl: string;
  iconUrl: string;
  timezone: string;
  dateFormat: string;
  language: string;
  currency: string;
}

export interface BrandingSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl: string;
  darkLogoUrl: string;
  faviconUrl: string;
  emailLogoUrl: string;
}

export interface LocalizationSettings {
  defaultLanguage: string;
  timezone: string;
  currency: string;
  regionalFormat: string;
  dateFormat: string;
  timeFormat: string;
}

export interface EmailSettings {
  smtpHost: string;
  smtpPort: number;
  senderName: string;
  senderEmail: string;
  encryption: 'TLS' | 'SSL' | 'NONE';
  authRequired: boolean;
}

export interface StorageSettings {
  provider: 'AWS_S3' | 'LOCAL_DISK' | 'CLOUDFLARE_R2';
  bucketName: string;
  region: string;
  maxUploadMB: number;
  autoCleanupDays: number;
}

export interface ApiSettingsData {
  baseUrl: string;
  version: string;
  platformApiKey: string;
  rateLimitPerMinute: number;
  docsUrl: string;
}

export interface WebhookItem {
  id: string;
  url: string;
  description: string;
  events: string[];
  secretKey: string;
  status: 'ACTIVE' | 'PAUSED' | 'FAILED';
  lastDelivery: string;
  failureCount: number;
}

export interface SystemDiagnosticsData {
  environment: string;
  version: string;
  buildNumber: string;
  nodeVersion: string;
  databaseVersion: string;
  redisVersion: string;
  storageStatus: 'HEALTHY' | 'WARNING';
  queueStatus: 'HEALTHY' | 'WARNING';
  apiHealth: 'HEALTHY' | 'WARNING';
}

export const platformSettingsDevApi = {
  // General & Branding Settings
  getGeneralSettings: async () => {
    const res = await api.get<GeneralSettings>('/admin/settings').catch(() => null);
    return res ? res.data : null;
  },

  updateGeneralSettings: async (data: Partial<GeneralSettings>) => {
    const res = await api.patch<GeneralSettings>('/admin/settings', data);
    return res.data;
  },

  getBrandingSettings: async () => {
    const res = await api.get<BrandingSettings>('/admin/settings/branding').catch(() => null);
    return res ? res.data : null;
  },

  updateBrandingSettings: async (data: Partial<BrandingSettings>) => {
    const res = await api.patch<BrandingSettings>('/admin/settings/branding', data);
    return res.data;
  },

  getLocalizationSettings: async () => {
    const res = await api.get<LocalizationSettings>('/admin/settings/localization').catch(() => null);
    return res ? res.data : null;
  },

  updateLocalizationSettings: async (data: Partial<LocalizationSettings>) => {
    const res = await api.patch<LocalizationSettings>('/admin/settings/localization', data);
    return res.data;
  },

  // Email Settings
  getEmailSettings: async () => {
    const res = await api.get<EmailSettings>('/admin/settings/email').catch(() => null);
    return res ? res.data : null;
  },

  updateEmailSettings: async (data: Partial<EmailSettings>) => {
    const res = await api.patch<EmailSettings>('/admin/settings/email', data);
    return res.data;
  },

  testEmailConnection: async () => {
    const res = await api.post<{ success: boolean; message: string }>('/admin/settings/email/test');
    return res.data;
  },

  // Storage Settings
  getStorageSettings: async () => {
    const res = await api.get<StorageSettings>('/admin/settings/storage').catch(() => null);
    return res ? res.data : null;
  },

  updateStorageSettings: async (data: Partial<StorageSettings>) => {
    const res = await api.patch<StorageSettings>('/admin/settings/storage', data);
    return res.data;
  },

  // API Center
  getApiSettings: async () => {
    const res = await api.get<ApiSettingsData>('/admin/settings/api').catch(() => null);
    return res ? res.data : null;
  },

  rotatePlatformApiKey: async () => {
    const res = await api.post<ApiSettingsData>('/admin/settings/api/rotate-key');
    return res.data;
  },

  // Webhook Engine
  getWebhooks: async () => {
    const res = await api.get<WebhookItem[]>('/admin/webhooks').catch(() => ({ data: [] }));
    return res.data;
  },

  createWebhook: async (data: { url: string; description: string; events: string[] }) => {
    const res = await api.post<WebhookItem>('/admin/webhooks', data);
    return res.data;
  },

  updateWebhook: async (id: string, data: Partial<WebhookItem>) => {
    const res = await api.patch<WebhookItem>(`/admin/webhooks/${id}`, data);
    return res.data;
  },

  deleteWebhook: async (id: string) => {
    const res = await api.delete(`/admin/webhooks/${id}`);
    return res.data;
  },

  retryWebhook: async (id: string) => {
    const res = await api.post(`/admin/webhooks/${id}/retry`);
    return res.data;
  },

  rotateWebhookSecret: async (id: string) => {
    const res = await api.post<WebhookItem>(`/admin/webhooks/${id}/rotate-secret`);
    return res.data;
  },

  // System & Developer Diagnostics
  getSystemDiagnostics: async () => {
    const res = await api.get<SystemDiagnosticsData>('/admin/system/diagnostics').catch(() => null);
    return res ? res.data : null;
  },
};
