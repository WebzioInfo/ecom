import { api } from './axios';

export interface SystemHealthData {
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  uptime: number;
  environment: string;
  version: string;
  dbLatency: string;
  dbStatus: string;
  memory: {
    free: number;
    total: number;
    process: {
      heapTotal: number;
      heapUsed: number;
      rss: number;
    };
  };
  cpu: Array<{ model: string; speed: number }>;
  backgroundQueues: number;
  activeWebSockets: number;
  services: {
    database: 'HEALTHY' | 'WARNING' | 'CRITICAL';
    apiGateway: 'HEALTHY' | 'WARNING' | 'CRITICAL';
    scheduler: 'HEALTHY' | 'WARNING' | 'CRITICAL';
    automation: 'HEALTHY' | 'WARNING' | 'CRITICAL';
    storage: 'HEALTHY' | 'WARNING' | 'CRITICAL';
    queues: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  };
}

export interface StoreHealthItem {
  id: string;
  name: string;
  slug: string;
  ownerName: string;
  healthScore: number;
  status: 'ACTIVE' | 'PAUSED' | 'PENDING';
  planName: string;
  storageMB: number;
  apiRequests: number;
  automationStatus: 'ACTIVE' | 'PAUSED' | 'FAILED';
  backgroundJobs: number;
  lastActivity: string;
}

export interface BackgroundJob {
  id: string;
  name: string;
  type: 'trial_expiry' | 'billing_generator' | 'quota_checker' | 'system_cleanup' | 'provisioning_engine';
  schedule: string;
  lastExecution: string;
  nextExecution: string;
  executionTimeMs: number;
  status: 'COMPLETED' | 'RUNNING' | 'FAILED' | 'QUEUED';
  retryCount: number;
  queuedCount: number;
  averageRuntimeMs: number;
}

export interface ProvisioningJob {
  id: string;
  storeName: string;
  slug: string;
  planName: string;
  status: 'COMPLETED' | 'RUNNING' | 'FAILED' | 'ROLLBACK';
  progressPercent: number;
  durationMs: number;
  createdAt: string;
  errorReason?: string;
}

export interface OperationNotification {
  id: string;
  title: string;
  message: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  category: 'Support' | 'System' | 'Billing' | 'Security';
  isRead: boolean;
  isArchived: boolean;
  createdAt: string;
}

export interface PlatformAuditLog {
  id: string;
  action: string;
  entity: string;
  actorName: string;
  actorEmail: string;
  ipAddress: string;
  details: string;
  createdAt: string;
}

export const operationsMonitoringApi = {
  // System Health
  getSystemHealth: async () => {
    const res = await api.get<SystemHealthData>('/admin/system/health');
    return res.data;
  },

  // Store Health
  getStoreHealthList: async () => {
    const res = await api.get<StoreHealthItem[]>('/admin/monitoring/stores').catch(() => ({ data: [] }));
    return res.data;
  },

  // Jobs & Automation
  getBackgroundJobs: async () => {
    const res = await api.get<BackgroundJob[]>('/admin/jobs');
    return res.data;
  },

  getFailedJobs: async () => {
    const res = await api.get<BackgroundJob[]>('/admin/jobs/failed');
    return res.data;
  },

  runAutomationCron: async (type: 'trials' | 'billing' | 'usage' | 'cleanup' | 'provisioning') => {
    const res = await api.post(`/admin/automation/run/${type}`);
    return res.data;
  },

  retryAutomationJob: async (jobId: string) => {
    const res = await api.post(`/admin/automation/jobs/${jobId}/retry`);
    return res.data;
  },

  // Provisioning Monitor
  getProvisioningJobs: async () => {
    const res = await api.get<ProvisioningJob[]>('/admin/provisioning/jobs');
    return res.data;
  },

  // Notifications
  getNotifications: async () => {
    const res = await api.get<OperationNotification[]>('/admin/notifications');
    return res.data;
  },

  markNotificationRead: async (id: string) => {
    const res = await api.patch(`/admin/notifications/${id}/read`);
    return res.data;
  },

  // Audit Logs
  getAuditLogs: async (query?: any) => {
    const res = await api.get<PlatformAuditLog[]>('/admin/audit', { params: query });
    return res.data;
  },

  // Usage & Storage
  getUsageStats: async () => {
    const res = await api.get<any>('/admin/usage');
    return res.data;
  },

  getStorageStats: async () => {
    const res = await api.get<any>('/admin/storage');
    return res.data;
  },
};
