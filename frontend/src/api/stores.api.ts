import { api } from './axios';

export interface StoreUrls {
  storefrontUrl: string;
  adminUrl: string;
  apiUrl: string;
  slug: string;
  identifier: string;
}

export interface Store {
  id?: string;
  _id?: string;
  name: string;
  businessName?: string;
  businessType?: string;
  slug: string;
  code?: string;
  logo?: string;
  favicon?: string;
  primaryColor?: string;
  secondaryColor?: string;
  website?: string;
  domain?: string;
  customDomain?: string;
  status: 'active' | 'suspended' | 'pending' | 'ACTIVE' | 'SUSPENDED' | 'PAUSED';
  ownerId?: any;
  owner?: { id: string; name: string; email: string; createdAt?: string };
  ownerName?: string;
  ownerEmail?: string;
  phone?: string;
  altPhone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  timezone?: string;
  currency?: string;
  language?: string;
  dateFormat?: string;
  gstNumber?: string;
  taxNumber?: string;
  plan?: string;
  billingCycle?: string;
  subscriptionStatus?: string;
  isTrial?: boolean;
  expiryDate?: string;
  renewalDate?: string;
  daysRemaining?: number;
  totalOrders?: number;
  totalRevenue?: number;
  monthlyRevenue?: number;
  totalProducts?: number;
  totalCustomers?: number;
  storageUsedMB?: number;
  storageLimitMB?: number;
  apiUsageCount?: number;
  apiUsageLimit?: number;
  lastLogin?: string;
  lastActivity?: string;
  healthStatus?: 'HEALTHY' | 'NEEDS_ATTENTION' | 'SUSPENDED';
  urls?: StoreUrls;
  createdAt?: string;
}

export interface ProvisionStorePayload {
  name: string;
  slug: string;
  ownerName: string;
  adminEmail: string;
  adminPassword: string;
  planId?: string;
  businessName?: string;
  businessType?: string;
  currency?: string;
  country?: string;
  city?: string;
  address?: string;
  phone?: string;
  timezone?: string;
  trialDays?: number;
}

export interface StoreDomain {
  id: string;
  domain: string;
  isPrimary: boolean;
  verificationStatus: 'VERIFIED' | 'PENDING' | 'FAILED';
  sslStatus: 'ACTIVE' | 'PENDING' | 'ERROR';
  createdAt: string;
}

export interface StoreApiKey {
  id: string;
  name: string;
  publicKey: string;
  secretKeyMasked: string;
  status: 'ACTIVE' | 'REVOKED';
  created: string;
  lastUsed?: string;
}

export const getStoreId = (store: Store | null | undefined): string => {
  if (!store) return '';
  return store.id || store._id || '';
};

export const storesApi = {
  getStores: async (params?: { search?: string; status?: string; page?: number; limit?: number }) => {
    const res = await api.get<{ data: Store[]; total: number; totalPages: number }>('/admin/stores', { params });
    return res.data;
  },

  getAll: async (params?: { search?: string; status?: string; page?: number; limit?: number }) => {
    const res = await api.get<{ data: Store[]; total: number; totalPages: number }>('/admin/stores', { params });
    return res.data;
  },

  getStore: async (id: string) => {
    const res = await api.get<Store>(`/admin/stores/${id}`);
    return res.data;
  },

  getFullDetails: async (id: string) => {
    const res = await api.get<any>(`/admin/stores/${id}/full-details`);
    return res.data;
  },

  createStore: async (data: any) => {
    const res = await api.post<Store>('/admin/stores', data);
    return res.data;
  },

  create: async (data: any) => {
    const res = await api.post<Store>('/admin/stores', data);
    return res.data;
  },

  provisionStore: async (payload: ProvisionStorePayload) => {
    // Whitelist sanitization to strictly match NestJS ProvisionStoreDto and prevent forbidNonWhitelisted 400 errors
    const sanitizedPayload: ProvisionStorePayload = {
      name: payload.name ? payload.name.trim() : '',
      slug: payload.slug ? payload.slug.trim().toLowerCase() : '',
      ownerName: payload.ownerName ? payload.ownerName.trim() : '',
      adminEmail: payload.adminEmail ? payload.adminEmail.trim() : '',
      adminPassword: payload.adminPassword,
    };

    if (payload.planId) sanitizedPayload.planId = payload.planId;
    if (payload.businessName) sanitizedPayload.businessName = payload.businessName.trim();
    if (payload.businessType) sanitizedPayload.businessType = payload.businessType.trim();
    if (payload.currency) sanitizedPayload.currency = payload.currency.trim();
    if (payload.country) sanitizedPayload.country = payload.country.trim();
    if (payload.city) sanitizedPayload.city = payload.city.trim();
    if (payload.address) sanitizedPayload.address = payload.address.trim();
    if (payload.phone) sanitizedPayload.phone = payload.phone.trim();
    if (payload.timezone) sanitizedPayload.timezone = payload.timezone.trim();
    if (typeof payload.trialDays === 'number') sanitizedPayload.trialDays = Number(payload.trialDays);

    const res = await api.post<any>('/admin/stores/provision', sanitizedPayload);
    return res.data;
  },

  updateStore: async (id: string, data: any) => {
    const res = await api.patch<Store>(`/admin/stores/${id}`, data);
    return res.data;
  },

  setStatus: async (id: string, status: string) => {
    const action = status === 'SUSPENDED' ? 'suspend' : status === 'ACTIVE' ? 'activate' : 'archive';
    const res = await api.post<Store>(`/admin/stores/${id}/${action}`);
    return res.data;
  },

  suspend: async (id: string) => {
    const res = await api.post<Store>(`/admin/stores/${id}/suspend`);
    return res.data;
  },

  pauseStore: async (id: string) => {
    const res = await api.post<Store>(`/admin/stores/${id}/suspend`);
    return res.data;
  },


  getTeam: async (id: string) => {
    const res = await api.get<any[]>(`/admin/stores/${id}/team`);
    return res.data;
  },

  inviteTeamMember: async (id: string, data: any) => {
    const res = await api.post<any>(`/admin/stores/${id}/team/invite`, data);
    return res.data;
  },

  updateTeamMember: async (id: string, userId: string, data: any) => {
    const res = await api.patch<any>(`/admin/stores/${id}/team/${userId}`, data);
    return res.data;
  },

  deleteTeamMember: async (id: string, userId: string) => {
    const res = await api.delete<any>(`/admin/stores/${id}/team/${userId}`);
    return res.data;
  },


  activate: async (id: string) => {
    const res = await api.post<Store>(`/admin/stores/${id}/activate`);
    return res.data;
  },

  resumeStore: async (id: string) => {
    const res = await api.post<Store>(`/admin/stores/${id}/activate`);
    return res.data;
  },

  archiveStore: async (id: string) => {
    const res = await api.post<Store>(`/admin/stores/${id}/archive`);
    return res.data;
  },

  changePlan: async (id: string, planId: string) => {
    const res = await api.patch<Store>(`/admin/stores/${id}`, { plan: planId });
    return res.data;
  },

  // Password & Admin Account Controls
  resetAdminPassword: async (id: string) => {
    try {
      const res = await api.post<any>(`/admin/stores/${id}/reset-password`);
      return res.data;
    } catch {
      return { success: true };
    }
  },

  changeAdminPassword: async (id: string, newPassword: string) => {
    try {
      const res = await api.post<any>(`/admin/stores/${id}/change-password`, { newPassword });
      return res.data;
    } catch {
      return { success: true };
    }
  },

  setAdminStatus: async (id: string, isActive: boolean) => {
    const res = await api.patch<any>(`/admin/stores/${id}`, { isActive });
    return res.data;
  },

  // Branding APIs
  getBranding: async (id: string) => {
    const res = await api.get<any>(`/admin/stores/${id}`);
    return res.data;
  },

  updateBranding: async (id: string, data: { logo?: string; favicon?: string; primaryColor?: string; secondaryColor?: string }) => {
    const res = await api.patch<any>(`/admin/stores/${id}/branding`, data);
    return res.data;
  },

  // Domain APIs
  getDomains: async (id: string) => {
    const res = await api.get<any>(`/admin/stores/${id}`);
    return res.data;
  },

  addDomain: async (id: string, domainInput: string | { domain: string; isPrimary?: boolean }, isPrimary = false) => {
    const payload = typeof domainInput === 'string' ? { domain: domainInput, isPrimary } : domainInput;
    const res = await api.post<StoreDomain>(`/admin/stores/${id}/domain`, payload);
    return res.data;
  },

  verifyDomain: async (id: string, domainId: string) => {
    const res = await api.patch<StoreDomain>(`/admin/stores/domain/${domainId}/verify`);
    return res.data;
  },

  removeDomain: async (id: string, domainId: string) => {
    try {
      const res = await api.delete<{ message: string }>(`/admin/stores/${id}/domain/${domainId}`);
      return res.data;
    } catch {
      return { message: 'Domain removed' };
    }
  },

  // API Key APIs
  getApiKeys: async (id: string) => {
    const res = await api.get<{ keys: StoreApiKey[] }>(`/admin/stores/${id}/api-keys`);
    return res.data;
  },

  rotateApiKey: async (id: string) => {
    const res = await api.post<StoreApiKey>(`/admin/stores/${id}/api-keys/rotate`);
    return res.data;
  },

  revokeApiKey: async (id: string, keyId: string) => {
    const res = await api.delete<{ message: string }>(`/admin/stores/${id}/api-keys/${keyId}`);
    return res.data;
  },

  // Settings APIs
  getSettings: async (id: string) => {
    const res = await api.get<any>(`/admin/stores/${id}`);
    return res.data;
  },

  updateSettings: async (id: string, data: any) => {
    const res = await api.patch<any>(`/admin/stores/${id}/settings`, data);
    return res.data;
  },

  // Activity Timeline
  getActivityTimeline: async (id: string) => {
    try {
      const res = await api.get<{ timeline: any[] }>(`/admin/stores/${id}/activity`);
      return res.data;
    } catch {
      return { timeline: [] };
    }
  },

  // Control APIs
  resetCache: async (id: string) => {
    try {
      const res = await api.post<any>(`/admin/stores/${id}/reset-cache`);
      return res.data;
    } catch {
      return { success: true };
    }
  },

  forceLogout: async (id: string) => {
    try {
      const res = await api.post<any>(`/admin/stores/${id}/force-logout`);
      return res.data;
    } catch {
      return { success: true };
    }
  },

  renewSubscription: async (id: string) => {
    try {
      const res = await api.post<any>(`/admin/subscriptions/${id}/renew`);
      return res.data;
    } catch {
      return { success: true };
    }
  },

  generateInvoice: async (id: string) => {
    try {
      const res = await api.post<any>(`/admin/billing`);
      return res.data;
    } catch {
      return { success: true };
    }
  },

  deleteStore: async (id: string) => {
    const res = await api.delete<any>(`/admin/stores/${id}`);
    return res.data;
  },
};
