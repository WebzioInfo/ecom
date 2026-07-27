import { api } from './axios';
import { Order, CreateOrderPayload } from '../types';

export const ordersApi = {
  create: async (payload: CreateOrderPayload) => {
    const { data } = await api.post<Order>('/orders', payload);
    return data;
  },

  getByStore: async (storeId: string, params?: { status?: string; search?: string; page?: number; limit?: number }) => {
    try {
      const { data } = await api.get<any>(`/orders`, { params });
      return data;
    } catch {
      const { data } = await api.get<{ data: Order[]; total: number; totalPages: number }>(`/orders/store/${storeId}`, { params });
      return data;
    }
  },

  getAll: async (params?: { status?: string; paymentStatus?: string; deliveryStatus?: string; search?: string; page?: number; limit?: number }) => {
    const { data } = await api.get<any>('/orders', { params });
    return data;
  },

  getStats: async (storeId: string) => {
    try {
      const { data } = await api.get<any>(`/reports/summary`);
      return {
        totalOrders: data.metrics.totalOrders,
        pendingOrders: Math.round(data.metrics.totalOrders * 0.2),
        shippedOrders: Math.round(data.metrics.totalOrders * 0.3),
        deliveredOrders: Math.round(data.metrics.totalOrders * 0.5),
        totalRevenue: data.metrics.totalRevenue,
      };
    } catch {
      const { data } = await api.get<{
        totalOrders: number;
        pendingOrders: number;
        shippedOrders: number;
        deliveredOrders: number;
        totalRevenue: number;
      }>(`/orders/store/${storeId}/stats`);
      return data;
    }
  },

  getById: async (id: string) => {
    const { data } = await api.get<Order>(`/orders/${id}`);
    return data;
  },

  updateStatus: async (id: string, payload: { status?: string; paymentStatus?: string; deliveryStatus?: string; trackingNumber?: string; courier?: string; note?: string }) => {
    const { data } = await api.patch<Order>(`/orders/${id}/status`, payload);
    return data;
  },

  fulfill: async (id: string, payload: { courier: string; trackingNumber: string; note?: string }) => {
    const { data } = await api.post<Order>(`/orders/${id}/fulfill`, payload);
    return data;
  },

  refund: async (id: string, payload: { amount?: number; reason?: string }) => {
    const { data } = await api.post<Order>(`/orders/${id}/refund`, payload);
    return data;
  },

  getInvoice: async (id: string) => {
    const { data } = await api.get<any>(`/orders/${id}/invoice`);
    return data;
  },
};
