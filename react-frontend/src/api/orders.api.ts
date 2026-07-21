import { api } from './axios';
import { Order, CreateOrderPayload } from '../types';

export const ordersApi = {
  create: async (payload: CreateOrderPayload) => {
    const { data } = await api.post<Order>('/orders', payload);
    return data;
  },

  getByStore: async (storeId: string, params?: { status?: string; search?: string; page?: number; limit?: number }) => {
    const { data } = await api.get<{ data: Order[]; total: number; totalPages: number }>(`/orders/store/${storeId}`, { params });
    return data;
  },

  getStats: async (storeId: string) => {
    const { data } = await api.get<{
      totalOrders: number;
      pendingOrders: number;
      shippedOrders: number;
      deliveredOrders: number;
      totalRevenue: number;
    }>(`/orders/store/${storeId}/stats`);
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<Order>(`/orders/${id}`);
    return data;
  },

  updateStatus: async (id: string, payload: { status?: string; paymentStatus?: string; trackingNumber?: string; carrier?: string; notes?: string }) => {
    const { data } = await api.patch<Order>(`/orders/${id}/status`, payload);
    return data;
  },
};
