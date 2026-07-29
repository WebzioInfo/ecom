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
  softDelete: async (id: string) => {
    const { data } = await api.delete(`/products/${id}`);
    return data;
  },
  restore: async (id: string) => {
    const { data } = await api.post(`/products/${id}/restore`);
    return data;
  },
  bulkUpdate: async (ids: string[], updateData: any) => {
    const { data } = await api.patch('/products/bulk-update', { ids, data: updateData });
    return data;
  },
  bulkDelete: async (ids: string[]) => {
    const { data } = await api.post('/products/bulk-delete', { ids });
    return data;
  },
  getCategories: async () => {
    const { data } = await api.get<any[]>('/categories');
    return data;
  },
  getCategoriesTree: async () => {
    const { data } = await api.get<any[]>('/categories/tree');
    return data;
  },
  createCategory: async (payload: any) => {
    const { data } = await api.post('/categories', payload);
    return data;
  },
  updateCategory: async (id: string, payload: any) => {
    const { data } = await api.patch(`/categories/${id}`, payload);
    return data;
  },
  deleteCategory: async (id: string) => {
    const { data } = await api.delete(`/categories/${id}`);
    return data;
  },
  restoreCategory: async (id: string) => {
    const { data } = await api.post(`/categories/${id}/restore`);
    return data;
  },
};
