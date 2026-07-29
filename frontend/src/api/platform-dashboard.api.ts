import { api } from './axios';

export interface DashboardOverviewResponse {
  overview: {
    totalStores: number;
    activeStores: number;
    suspendedStores: number;
    trialStores: number;
    expiredStores: number;
    cancelledStores: number;
    provisioningInProgress: number;
    provisioningFailed: number;
    totalActiveUsers: number;
    totalProducts: number;
    totalCustomers: number;
    totalOrders: number;
    todayOrders: number;
    todayRevenue: number;
    monthlyRevenue: number;
    totalRevenue: number;
    totalApiCalls: number;
    storageUsedMB: number;
    averageResponseTimeMs: number;
  };
}

export interface MetricsResponse {
  metrics: DashboardOverviewResponse['overview'] & {
    cpuUsagePercent: number;
    memoryUsageMB: number;
    uptimeSeconds: number;
  };
}

export interface RevenueAnalyticsResponse {
  revenue: {
    today: number;
    thisMonth: number;
    total: number;
    currency: string;
  };
}

export interface SystemHealthResponse {
  status: string;
  database: string;
  redis: string;
  queue: string;
  storage: string;
  cpu: {
    cores: number;
    model: string;
    loadAverage: number[];
  };
  memory: {
    heapUsedMB: number;
    heapTotalMB: number;
    rssMB: number;
    systemTotalMB: number;
    systemFreeMB: number;
  };
  uptimeSeconds: number;
  applicationVersion: string;
  buildVersion: string;
  environment: string;
}

export interface BackgroundJobsResponse {
  jobs: Array<{
    name: string;
    schedule: string;
    status: 'ACTIVE' | 'PAUSED' | 'FAILED';
    lastRun: string;
    failedRuns: number;
    durationMs?: number;
    progress?: number;
  }>;
}

export interface NotificationItem {
  id: string;
  title: string;
  type: 'CRITICAL' | 'WARNING' | 'SYSTEM_INFO' | 'INFO';
  read: boolean;
  createdAt: string;
  description?: string;
}

export interface AuditLogItem {
  id: string;
  action: string;
  entity?: string;
  entityId?: string;
  performedBy?: string;
  details?: any;
  storeName?: string;
  slug?: string;
  createdAt: string;
}

export interface PlatformReportResponse {
  overview: {
    mrr: number;
    arr: number;
    arpu: number;
    totalStores: number;
    activeStores: number;
    trialStores: number;
    suspendedStores: number;
    cancelledStores: number;
    growthRatePercent: number;
    churnRatePercent: number;
    provisioningSuccessRatePercent: number;
    planSubscribers: Record<string, number>;
  };
}

export interface RevenueReportResponse {
  revenue: {
    mrr: number;
    arr: number;
    monthlyTrend: Array<{ month: string; amount: number }>;
  };
}

export const platformDashboardApi = {
  getOverview: async () => {
    const res = await api.get<DashboardOverviewResponse>('/admin/dashboard');
    return res.data;
  },

  getMetrics: async () => {
    const res = await api.get<MetricsResponse>('/admin/dashboard/metrics');
    return res.data;
  },

  getRevenueAnalytics: async () => {
    const res = await api.get<RevenueAnalyticsResponse>('/admin/dashboard/revenue');
    return res.data;
  },

  getSystemHealth: async () => {
    const res = await api.get<SystemHealthResponse>('/admin/system/health');
    return res.data;
  },

  getBackgroundJobs: async () => {
    const res = await api.get<BackgroundJobsResponse>('/admin/jobs');
    return res.data;
  },

  getProvisioningJobs: async () => {
    const res = await api.get<any[]>('/admin/provisioning/jobs');
    return res.data;
  },

  getNotifications: async () => {
    const res = await api.get<{ notifications: NotificationItem[] }>('/admin/notifications');
    return res.data;
  },

  markNotificationRead: async (id: string) => {
    const res = await api.patch<{ id: string; read: boolean }>(`/admin/notifications/${id}/read`);
    return res.data;
  },

  getAuditLogs: async (params?: { page?: number; limit?: number }) => {
    const res = await api.get<{ data: AuditLogItem[]; meta: { total: number; page: number; totalPages: number } }>('/admin/audit', { params });
    return res.data;
  },

  getPlatformReport: async () => {
    const res = await api.get<PlatformReportResponse>('/admin/reports/platform');
    return res.data;
  },

  getRevenueReport: async () => {
    const res = await api.get<RevenueReportResponse>('/admin/reports/revenue');
    return res.data;
  },
};
