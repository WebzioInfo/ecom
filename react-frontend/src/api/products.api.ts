import { api } from './axios';
import { CreateProductPayload, ListProductsParams, Product, ProductFilters } from '../types';

export const productsApi = {
  list: async (params?: ListProductsParams) => {
    const { data } = await api.get<{ data: Product[]; meta: { total: number; page: number; limit: number; pages: number } }>('/products', { params });
    return data;
  },
  getFilters: async () => {
    const { data } = await api.get<ProductFilters>('/products/filters');
    return data;
  },
  getFeatured: async () => {
    const { data } = await api.get<Product[]>('/products/featured');
    return data;
  },
  getById: async (id: string) => {
    const { data } = await api.get<Product>(`/products/${id}`);
    return data;
  },
  create: async (payload: CreateProductPayload) => {
    const { data } = await api.post<Product>('/products', payload);
    return data;
  },
  update: async (id: string, payload: Partial<CreateProductPayload>) => {
    const { data } = await api.patch<Product>(`/products/${id}`, payload);
    return data;
  },
  remove: async (id: string) => {
    const { data } = await api.delete(`/products/${id}`);
    return data;
  },
};
