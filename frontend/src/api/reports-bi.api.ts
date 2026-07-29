import { api } from './axios';

export interface PlatformReportOverview {
  mrr: number;
  arr: number;
  arpu: number;
  churnRatePercent: number;
  growthRatePercent: number;
  totalRevenue: number;
  totalStores: number;
  activeStores: number;
  trialStores: number;
  graceStores: number;
  suspendedStores: number;
  totalApiRequests: number;
  totalStorageMB: number;
  platformHealthScore: number;
}

export interface RevenueReportData {
  mrr: number;
  arr: number;
  totalRevenue: number;
  monthlyTrend: Array<{ month: string; revenue: number; mrr: number }>;
  revenueByPlan: Array<{ planName: string; amount: number; percentage: number }>;
  revenueByStore: Array<{ storeName: string; slug: string; amount: number }>;
  refundTrend: Array<{ month: string; refundAmount: number }>;
}

export interface SubscriptionReportData {
  activeCount: number;
  trialCount: number;
  graceCount: number;
  suspendedCount: number;
  cancelledCount: number;
  planDistribution: Array<{ name: string; count: number; percentage: number }>;
  upgradeRatePercent: number;
  downgradeRatePercent: number;
  renewalRatePercent: number;
}

export interface StoreLeaderboardItem {
  id: string;
  name: string;
  slug: string;
  ownerName: string;
  revenue: number;
  growthPercent: number;
  storageMB: number;
  apiRequests: number;
  planName: string;
  createdAt: string;
}

export const reportsBiApi = {
  // Reports
  getPlatformOverview: async () => {
    const res = await api.get<{ overview: PlatformReportOverview }>('/admin/reports/platform');
    return res.data;
  },

  getRevenueReport: async () => {
    const res = await api.get<RevenueReportData>('/admin/reports/revenue');
    return res.data;
  },

  getSubscriptionReport: async () => {
    const res = await api.get<SubscriptionReportData>('/admin/reports/subscriptions');
    return res.data;
  },

  getStoresReport: async () => {
    const res = await api.get<StoreLeaderboardItem[]>('/admin/reports/stores');
    return res.data;
  },

  getApiUsageReport: async () => {
    const res = await api.get<any>('/admin/reports/api-usage');
    return res.data;
  },

  getStorageReport: async () => {
    const res = await api.get<any>('/admin/reports/storage');
    return res.data;
  },

  // Export Engine
  exportCSV: async (title: string, data: any[], fields?: string[]) => {
    const res = await api.post<{ success: boolean; downloadUrl?: string; filename?: string }>('/reports/export/csv', {
      title,
      data,
      fields,
    });
    return res.data;
  },

  exportExcel: async (title: string, data: any[], sheetName?: string) => {
    const res = await api.post<{ success: boolean; downloadUrl?: string; filename?: string }>('/reports/export/excel', {
      title,
      data,
      sheetName,
    });
    return res.data;
  },

  exportPDF: async (title: string, summary: any, data: any[]) => {
    const res = await api.post<{ success: boolean; downloadUrl?: string; filename?: string }>('/reports/export/pdf', {
      title,
      summary,
      data,
    });
    return res.data;
  },
};
