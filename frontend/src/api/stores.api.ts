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
  website?: string;
  domain?: string;
  customDomain?: string;
  status: 'active' | 'suspended' | 'pending' | 'ACTIVE' | 'SUSPENDED';
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
  healthStatus?: 'HEALTHY' | 'NEEDS_ATTENTION' | 'SUSPENDED';
  urls?: StoreUrls;
  createdAt?: string;
}

export interface ProvisionStorePayload {
  name: string;
  businessName?: string;
  businessType?: string;
  slug: string;
  code?: string;
  logo?: string;
  website?: string;
  ownerName: string;
  ownerEmail: string;
  adminEmail: string;
  adminPassword: string;
  phone?: string;
  altPhone?: string;
  country?: string;
  state?: string;
  district?: string;
  city?: string;
  address?: string;
  postalCode?: string;
  timezone?: string;
  currency?: string;
  language?: string;
  gstNumber?: string;
  taxNumber?: string;
  planId?: string;
  subscriptionType?: string;
  trialDays?: number;
  startDate?: string;
  expiryDate?: string;
  status?: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
}

export const getStoreId = (store: Store | null | undefined): string => {
  if (!store) return '';
  return store.id || store._id || '';
};

export const storesApi = {
  getStores: async (params?: { search?: string; status?: string; page?: number; limit?: number }) => {
    const res = await api.get<{ data: Store[]; total: number; totalPages: number }>('/stores', { params });
    return res.data;
  },

  getAll: async (params?: { search?: string; status?: string; page?: number; limit?: number }) => {
    const res = await api.get<{ data: Store[]; total: number; totalPages: number }>('/stores', { params });
    return res.data;
  },

  getStore: async (id: string) => {
    const res = await api.get<Store>(`/stores/${id}`);
    return res.data;
  },

  getFullDetails: async (id: string) => {
    const res = await api.get<any>(`/stores/${id}/full-details`);
    return res.data;
  },

  createStore: async (data: any) => {
    const res = await api.post<Store>('/stores', data);
    return res.data;
  },

  create: async (data: any) => {
    const res = await api.post<Store>('/stores', data);
    return res.data;
  },

  provisionStore: async (payload: ProvisionStorePayload) => {
    const res = await api.post<any>('/stores/provision', payload);
    return res.data;
  },

  updateStore: async (id: string, data: any) => {
    const res = await api.patch<Store>(`/stores/${id}`, data);
    return res.data;
  },

  setStatus: async (id: string, status: string) => {
    const res = await api.patch<Store>(`/stores/${id}/status`, { status });
    return res.data;
  },

  suspend: async (id: string) => {
    const res = await api.patch<Store>(`/stores/${id}/status`, { status: 'SUSPENDED' });
    return res.data;
  },

  activate: async (id: string) => {
    const res = await api.patch<Store>(`/stores/${id}/status`, { status: 'ACTIVE' });
    return res.data;
  },

  changePlan: async (id: string, planId: string) => {
    const res = await api.patch<Store>(`/stores/${id}/change-plan`, { planId });
    return res.data;
  },

  // Password & Admin Account Controls
  resetAdminPassword: async (id: string) => {
    const res = await api.post<any>(`/stores/${id}/admin/reset-password`);
    return res.data;
  },

  changeAdminPassword: async (id: string, newPassword: string) => {
    const res = await api.post<any>(`/stores/${id}/admin/change-password`, { newPassword });
    return res.data;
  },

  setAdminStatus: async (id: string, isActive: boolean) => {
    const res = await api.patch<any>(`/stores/${id}/admin/status`, { isActive });
    return res.data;
  },

  // Control APIs
  resetCache: async (id: string) => {
    const res = await api.post<any>(`/stores/${id}/reset-cache`);
    return res.data;
  },

  forceLogout: async (id: string) => {
    const res = await api.post<any>(`/stores/${id}/force-logout`);
    return res.data;
  },

  renewSubscription: async (id: string) => {
    const res = await api.post<any>(`/stores/${id}/renew-subscription`);
    return res.data;
  },

  generateInvoice: async (id: string) => {
    const res = await api.post<any>(`/stores/${id}/generate-invoice`);
    return res.data;
  },

  deleteStore: async (id: string) => {
    const res = await api.delete<any>(`/stores/${id}`);
    return res.data;
  },
};
