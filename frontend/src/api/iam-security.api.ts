import { api } from './axios';

export interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: string;
  roles?: string[];
  teamName?: string;
  status: 'ACTIVE' | 'INVITED' | 'LOCKED' | 'DEACTIVATED';
  mfaEnabled: boolean;
  lastLogin: string;
  createdAt: string;
}

export interface AdminRoleItem {
  id: string;
  name: string;
  code: string;
  description: string;
  usersCount: number;
  permissionsCount: number;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  isCustom: boolean;
}

export interface PermissionModuleItem {
  module: string;
  description: string;
  scopes: {
    read: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
    export: boolean;
    approve: boolean;
  };
}

export interface AdminTeamItem {
  id: string;
  name: string;
  code: string;
  description: string;
  color: string;
  membersCount: number;
  assignedRole: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface UserSessionItem {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  device: string;
  browser: string;
  os: string;
  ipAddress: string;
  location: string;
  startedAt: string;
  lastActivityAt: string;
  isCurrent: boolean;
}

export interface SecurityOverviewData {
  mfaAdoptionPercent: number;
  failedLoginAttempts24h: number;
  lockedAccountsCount: number;
  activeSessionsCount: number;
  suspiciousEventsCount: number;
  passwordPolicy: {
    minLength: number;
    requireNumbers: boolean;
    requireSymbols: boolean;
    requireUppercase: boolean;
    expiryDays: number;
  };
}

export interface LoginHistoryEvent {
  id: string;
  userName: string;
  userEmail: string;
  status: 'SUCCESSFUL' | 'FAILED' | 'PASSWORD_RESET' | 'MFA_ENABLED' | 'ROLE_CHANGED';
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

export const iamSecurityApi = {
  // Users
  getUsers: async () => {
    const res = await api.get<AdminUserItem[]>('/admin/users').catch(() => ({ data: [] }));
    return res.data;
  },

  getUser: async (id: string) => {
    const res = await api.get<AdminUserItem>(`/admin/users/${id}`);
    return res.data;
  },

  createUser: async (data: { name: string; email: string; role: string; teamName?: string }) => {
    const res = await api.post<AdminUserItem>('/admin/users', data);
    return res.data;
  },

  updateUser: async (id: string, data: Partial<AdminUserItem>) => {
    const res = await api.patch<AdminUserItem>(`/admin/users/${id}`, data);
    return res.data;
  },

  deleteUser: async (id: string) => {
    const res = await api.delete(`/admin/users/${id}`);
    return res.data;
  },

  lockUser: async (id: string) => {
    const res = await api.patch<AdminUserItem>(`/admin/users/${id}/lock`, { status: 'LOCKED' });
    return res.data;
  },

  unlockUser: async (id: string) => {
    const res = await api.patch<AdminUserItem>(`/admin/users/${id}/unlock`, { status: 'ACTIVE' });
    return res.data;
  },

  resetUserPassword: async (id: string) => {
    const res = await api.post(`/admin/users/${id}/reset-password`);
    return res.data;
  },

  // Roles
  getRoles: async () => {
    const res = await api.get<AdminRoleItem[]>('/admin/roles').catch(() => ({ data: [] }));
    return res.data;
  },

  createRole: async (data: { name: string; description: string; permissions?: string[] }) => {
    const res = await api.post<AdminRoleItem>('/admin/roles', data);
    return res.data;
  },

  updateRole: async (id: string, data: Partial<AdminRoleItem>) => {
    const res = await api.patch<AdminRoleItem>(`/admin/roles/${id}`, data);
    return res.data;
  },

  deleteRole: async (id: string) => {
    const res = await api.delete(`/admin/roles/${id}`);
    return res.data;
  },

  // Permissions Matrix
  getPermissions: async () => {
    const res = await api.get<PermissionModuleItem[]>('/admin/permissions').catch(() => ({ data: [] }));
    return res.data;
  },

  updateRolePermissions: async (roleId: string, permissions: string[]) => {
    const res = await api.patch(`/admin/roles/${roleId}/permissions`, { permissions });
    return res.data;
  },

  // Teams
  getTeams: async () => {
    const res = await api.get<AdminTeamItem[]>('/admin/teams').catch(() => ({ data: [] }));
    return res.data;
  },

  createTeam: async (data: { name: string; description: string; color: string; assignedRole: string }) => {
    const res = await api.post<AdminTeamItem>('/admin/teams', data);
    return res.data;
  },

  // Sessions
  getActiveSessions: async () => {
    const res = await api.get<UserSessionItem[]>('/admin/sessions').catch(() => ({ data: [] }));
    return res.data;
  },

  terminateSession: async (id: string) => {
    const res = await api.delete(`/admin/sessions/${id}`);
    return res.data;
  },

  terminateAllSessions: async () => {
    const res = await api.delete('/admin/sessions');
    return res.data;
  },

  // Security Overview & Login History
  getSecurityOverview: async () => {
    const res = await api.get<SecurityOverviewData>('/admin/security').catch(() => null);
    return res ? res.data : null;
  },

  getLoginHistory: async () => {
    const res = await api.get<LoginHistoryEvent[]>('/admin/login-history').catch(() => ({ data: [] }));
    return res.data;
  },
};
