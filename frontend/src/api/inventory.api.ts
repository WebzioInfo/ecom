import { api } from './axios';

export interface Warehouse {
  _id: string;
  storeId: string;
  name: string;
  code: string;
  address?: string;
  city?: string;
  country?: string;
  isActive: boolean;
  createdAt: string;
}

export const inventoryApi = {
  createWarehouse: async (data: { storeId: string; name: string; code: string; address?: string }) => {
    const res = await api.post<Warehouse>('/inventory/warehouses', data);
    return res.data;
  },

  getWarehousesByStore: async (storeId: string) => {
    const res = await api.get<Warehouse[]>(`/inventory/warehouses/store/${storeId}`);
    return res.data;
  },

  adjustStock: async (data: { storeId?: string; warehouseId?: string; productId: string; quantityDelta: number; reason?: string }) => {
    const res = await api.post('/inventory/stock/adjust', data);
    return res.data;
  },

  getStockSummary: async () => {
    const res = await api.get<any>('/inventory/stock');
    return res.data;
  },

  getMovements: async (productId?: string) => {
    const res = await api.get<any[]>('/inventory/movements', { params: { productId } });
    return res.data;
  },
};
