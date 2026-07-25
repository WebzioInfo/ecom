import { api } from './axios';

export interface PlanLimits {
  maxProducts: number;
  maxCategories: number;
  maxOrders: number;
  maxCustomers: number;
  maxStaff: number;
  maxWarehouses: number;
  maxStorageMB: number;
  maxApiRequestsPerMonth: number;
  maxIntegrations: number;
}

export interface PlanFeatures {
  customDomain: boolean;
  apiAccess: boolean;
  webhooks: boolean;
  advancedAnalytics: boolean;
  customReports: boolean;
  coupons: boolean;
  productReviews: boolean;
  advancedInventory: boolean;
  multiWarehouse: boolean;
  marketingTools: boolean;
  advancedShipping: boolean;
  multiplePaymentGateways: boolean;
  staffManagement: boolean;
  auditLogs: boolean;
  aiFeatures: boolean;
}

export interface Plan {
  id?: string;
  _id?: string;
  name: string;
  code: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;
  trialDays: number;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  popularBadge: boolean;
  recommendedBadge: boolean;
  limits: PlanLimits;
  features: PlanFeatures;
  displayOrder: number;
  subscriberCount?: number;
  createdAt: string;
  updatedAt: string;
}

export const getPlanId = (p: Plan | null | undefined): string => {
  if (!p) return '';
  return p.id || p._id || '';
};

export const plansApi = {
  getAll: async (status?: string) => {
    const params = status ? { status } : {};
    const res = await api.get<Plan[]>('/plans', { params });
    return res.data;
  },
  getOne: async (id: string) => {
    const res = await api.get<Plan>(`/plans/${id}`);
    return res.data;
  },
  create: async (data: Omit<Plan, 'id' | '_id' | 'createdAt' | 'updatedAt'>) => {
    const res = await api.post<Plan>('/plans', data);
    return res.data;
  },
  update: async (id: string, data: Partial<Plan>) => {
    const res = await api.patch<Plan>(`/plans/${id}`, data);
    return res.data;
  },
  duplicate: async (id: string) => {
    const res = await api.post<Plan>(`/plans/${id}/duplicate`);
    return res.data;
  },
  setStatus: async (id: string, status: string) => {
    const res = await api.patch<Plan>(`/plans/${id}/status`, { status });
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/plans/${id}`);
    return res.data;
  },
};
