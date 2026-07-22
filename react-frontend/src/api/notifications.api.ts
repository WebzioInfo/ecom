import { api } from './axios';

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export const notificationsApi = {
  getStoreNotifications: async () => {
    const res = await api.get<Notification[]>('/notifications/tenant');
    return res.data;
  },
  
  getGlobalNotifications: async () => {
    const res = await api.get<Notification[]>('/notifications/global');
    return res.data;
  },

  markAsRead: async (id: string) => {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
  },

  markAllAsRead: async () => {
    const res = await api.patch('/notifications/tenant/read-all');
    return res.data;
  }
};
