import { api } from './axios';

export interface Coupon {
  _id: string;
  storeId: string;
  code: string;
  type: 'percentage' | 'fixed_amount' | 'free_shipping';
  value: number;
  minOrderAmount: number;
  maxUses: number;
  usedCount: number;
  startsAt?: string;
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
}

export const marketingApi = {
  createCoupon: async (data: Partial<Coupon> & { storeId: string; code: string; value: number }) => {
    const res = await api.post<Coupon>('/marketing/coupons', data);
    return res.data;
  },

  getCouponsByStore: async (storeId: string) => {
    const res = await api.get<Coupon[]>(`/marketing/coupons/store/${storeId}`);
    return res.data;
  },

  updateCoupon: async (id: string, data: Partial<Coupon>) => {
    const res = await api.patch<Coupon>(`/marketing/coupons/${id}`, data);
    return res.data;
  },

  deleteCoupon: async (id: string) => {
    const res = await api.delete<{ message: string }>(`/marketing/coupons/${id}`);
    return res.data;
  },
};
