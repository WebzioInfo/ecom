import { api } from './axios';

export interface ApiKeyItem {
  _id: string;
  name: string;
  key: string;
  webhookSecret?: string;
  permissions: string[];
  allowedOrigins: string[];
  rateLimitPerMinute: number;
  isActive: boolean;
  lastUsedAt?: string;
  createdAt: string;
}

export const apiKeysApi = {
  create: async (data: { storeId: string; name: string; permissions?: string[]; allowedOrigins?: string[] }) => {
    const res = await api.post<ApiKeyItem & { apiKey: string; secretKey: string }>('/api-keys', data);
    return res.data;
  },

  getByStore: async (storeId: string) => {
    const res = await api.get<ApiKeyItem[]>(`/api-keys/store/${storeId}`);
    return res.data;
  },

  update: async (id: string, data: Partial<ApiKeyItem>) => {
    const res = await api.patch<ApiKeyItem>(`/api-keys/${id}`, data);
    return res.data;
  },

  regenerateSecret: async (id: string) => {
    const res = await api.post<{ id: string; webhookSecret: string; message: string }>(`/api-keys/${id}/regenerate-secret`);
    return res.data;
  },

  revoke: async (id: string) => {
    const res = await api.delete<{ message: string }>(`/api-keys/${id}`);
    return res.data;
  },
};
