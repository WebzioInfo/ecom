import { api } from './axios';

export interface Customer {
  _id: string;
  storeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  tags?: string[];
  totalOrders: number;
  totalSpent: number;
  notes?: string;
  isActive: boolean;
  createdAt: string;
}

export const customersApi = {
  create: async (data: Partial<Customer> & { storeId: string; firstName: string; lastName: string; email: string }) => {
    const res = await api.post<Customer>('/customers', data);
    return res.data;
  },

  getByStore: async (storeId: string, params?: { search?: string; page?: number; limit?: number }) => {
    const res = await api.get<{ data: Customer[]; total: number; totalPages: number }>(`/customers/store/${storeId}`, { params });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api.get<Customer>(`/customers/${id}`);
    return res.data;
  },

  update: async (id: string, data: Partial<Customer>) => {
    const res = await api.patch<Customer>(`/customers/${id}`, data);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await api.delete<{ message: string }>(`/customers/${id}`);
    return res.data;
  },
};
