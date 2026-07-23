import { api } from './axios';

export interface AuditLogItem {
  _id: string;
  storeId?: { _id: string; name: string; slug: string };
  userId: { _id: string; name: string; email: string; roles: string[] };
  action: string;
  entity: string;
  entityId?: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  createdAt: string;
}

export const auditLogsApi = {
  getByStore: async (storeId: string, limit = 50) => {
    const res = await api.get<AuditLogItem[]>(`/audit-logs/store/${storeId}`, { params: { limit } });
    return res.data;
  },

  getGlobal: async (limit = 100) => {
    const res = await api.get<AuditLogItem[]>('/audit-logs/global', { params: { limit } });
    return res.data;
  },
};
