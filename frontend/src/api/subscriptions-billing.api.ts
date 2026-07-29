import { api } from './axios';

export interface SubscriptionItem {
  id: string;
  storeId: string;
  storeName: string;
  slug: string;
  ownerName: string;
  ownerEmail: string;
  planName: string;
  planCode: string;
  monthlyPrice: number;
  yearlyPrice: number;
  billingCycle: 'MONTHLY' | 'YEARLY';
  status: 'ACTIVE' | 'TRIAL' | 'GRACE_PERIOD' | 'SUSPENDED' | 'CANCELLED';
  startDate: string;
  renewalDate: string;
  gracePeriodEndsAt?: string;
  isTrial: boolean;
  daysRemaining: number;
  usage: {
    productsCount: number;
    maxProducts: number;
    ordersCount: number;
    maxOrders: number;
    customersCount: number;
    maxCustomers: number;
    usersCount: number;
    maxUsers: number;
    storageUsedMB: number;
    maxStorageMB: number;
    apiUsageCount: number;
    maxApiRequests: number;
  };
}

export interface BillingInvoice {
  id: string;
  invoiceNumber: string;
  storeId: string;
  storeName: string;
  slug: string;
  amount: number;
  currency: string;
  status: 'PAID' | 'OUTSTANDING' | 'FAILED' | 'REFUNDED';
  billingDate: string;
  dueDate: string;
  paidAt?: string;
  planName: string;
  paymentMethod: string;
  referenceNumber?: string;
  failureReason?: string;
  items: Array<{ description: string; amount: number }>;
}

export interface SubscriptionReportData {
  mrr: number;
  arr: number;
  arpu: number;
  churnRatePercent: number;
  growthRatePercent: number;
  activeCount: number;
  trialCount: number;
  graceCount: number;
  suspendedCount: number;
  cancelledCount: number;
  planSubscribers: Record<string, number>;
}

export const subscriptionsBillingApi = {
  // Subscriptions
  getAllSubscriptions: async () => {
    const res = await api.get<SubscriptionItem[]>('/admin/subscriptions');
    return res.data;
  },

  getSubscription: async (storeId: string) => {
    const res = await api.get<SubscriptionItem>(`/admin/subscriptions/${storeId}`);
    return res.data;
  },

  upgradeSubscription: async (storeId: string, planCode: string) => {
    const res = await api.post<SubscriptionItem>(`/admin/subscriptions/${storeId}/upgrade`, { planCode });
    return res.data;
  },

  downgradeSubscription: async (storeId: string, planCode: string) => {
    const res = await api.post<SubscriptionItem>(`/admin/subscriptions/${storeId}/downgrade`, { planCode });
    return res.data;
  },

  renewSubscription: async (storeId: string) => {
    const res = await api.post<SubscriptionItem>(`/admin/subscriptions/${storeId}/renew`);
    return res.data;
  },

  pauseSubscription: async (storeId: string) => {
    const res = await api.post<SubscriptionItem>(`/admin/subscriptions/${storeId}/suspend`);
    return res.data;
  },

  resumeSubscription: async (storeId: string) => {
    const res = await api.post<SubscriptionItem>(`/admin/subscriptions/${storeId}/reactivate`);
    return res.data;
  },

  cancelSubscription: async (storeId: string) => {
    const res = await api.post<SubscriptionItem>(`/admin/subscriptions/${storeId}/cancel`);
    return res.data;
  },

  getSubscriptionUsage: async (storeId: string) => {
    const res = await api.get<any>(`/admin/subscriptions/${storeId}/usage`);
    return res.data;
  },

  // Billing & Invoices
  getBillingRecords: async () => {
    const res = await api.get<BillingInvoice[]>('/admin/billing');
    return res.data;
  },

  getBillingRecord: async (id: string) => {
    const res = await api.get<BillingInvoice>(`/admin/billing/${id}`);
    return res.data;
  },

  createInvoice: async (data: { storeId: string; amount: number; planName?: string; description?: string }) => {
    const res = await api.post<BillingInvoice>('/admin/billing', data);
    return res.data;
  },

  payInvoice: async (id: string, referenceNumber?: string) => {
    const res = await api.patch<BillingInvoice>(`/admin/billing/${id}/pay`, { referenceNumber });
    return res.data;
  },

  failInvoice: async (id: string, reason?: string) => {
    const res = await api.patch<BillingInvoice>(`/admin/billing/${id}/fail`, { reason });
    return res.data;
  },

  // Reports
  getSubscriptionReport: async () => {
    const res = await api.get<{ overview: SubscriptionReportData }>('/admin/reports/platform');
    return res.data;
  },

  getRevenueReport: async () => {
    const res = await api.get<{ revenue: { mrr: number; arr: number; monthlyTrend: any[] } }>('/admin/reports/revenue');
    return res.data;
  },
};
