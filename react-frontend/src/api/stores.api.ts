import { api } from './axios';

export interface Store {
  _id: string;
  name: string;
  slug: string;
  domain?: string;
  customDomain?: string;
  status: 'active' | 'suspended' | 'pending';
  ownerId?: any;
  subscription?: {
    planId?: any;
    status: string;
    renewalDate?: string;
    trialEndDate?: string;
  };
  branding?: {
    primaryColor: string;
    logoUrl?: string;
    theme: string;
  };
  settings?: {
    currency: string;
    timezone: string;
    taxPercentage: number;
    paymentGateways?: Record<string, any>;
    shippingProviders?: Record<string, any>;
  };
  apiUsageCount: number;
  storageUsedMB: number;
  productCount: number;
  orderCount: number;
  createdAt: string;
}

export const storesApi = {
  create: async (data: Partial<Store> & { ownerId: string }) => {
    const res = await api.post<Store>('/stores', data);
    return res.data;
  },

  getAll: async (params?: { search?: string; status?: string; page?: number; limit?: number }) => {
    const res = await api.get<{ data: Store[]; total: number; totalPages: number }>('/stores', { params });
    return res.data;
  },

  getGlobalAnalytics: async () => {
    const res = await api.get<{
      totalStores: number;
      activeStores: number;
      suspendedStores: number;
      totalApiRequests: number;
      totalStorageMB: number;
      totalProducts: number;
      totalOrders: number;
      systemHealth: string;
    }>('/stores/analytics/global');
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api.get<Store>(`/stores/${id}`);
    return res.data;
  },

  getBySlug: async (slug: string) => {
    const res = await api.get<Store>(`/stores/slug/${slug}`);
    return res.data;
  },

  getFullDetails: async (id: string) => {
    const res = await api.get<{ store: Store; metrics: any }>(`/stores/${id}/full-details`);
    return res.data;
  },

  changePlan: async (id: string, planId: string) => {
    const res = await api.patch<Store>(`/stores/${id}/plan`, { planId });
    return res.data;
  },

  transferOwnership: async (id: string, newOwnerId: string) => {
    const res = await api.patch<Store>(`/stores/${id}/transfer-ownership`, { newOwnerId });
    return res.data;
  },

  update: async (id: string, data: Partial<Store>) => {
    const res = await api.patch<Store>(`/stores/${id}`, data);
    return res.data;
  },

  suspend: async (id: string) => {
    const res = await api.patch<Store>(`/stores/${id}/suspend`);
    return res.data;
  },

  activate: async (id: string) => {
    const res = await api.patch<Store>(`/stores/${id}/activate`);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await api.delete<{ message: string }>(`/stores/${id}`);
    return res.data;
  },
};
