import { api } from './axios';
import { CreateOrderPayload, Order } from '../types';

export const ordersApi = {
  create: async (payload: CreateOrderPayload) => {
    const { data } = await api.post<{ order: Order; whatsappUrl: string }>('/orders', payload);
    return data;
  },
  list: async () => {
    const { data } = await api.get<Order[]>('/orders');
    return data;
  },
  getById: async (id: string) => {
    const { data } = await api.get<Order>(`/orders/${id}`);
    return data;
  },
};
