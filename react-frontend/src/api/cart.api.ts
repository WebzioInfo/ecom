import { api } from './axios';
import { AddToCartPayload, CartState, UpdateCartItemPayload } from '../types';

export const cartApi = {
  get: async () => {
    const { data } = await api.get<CartState>('/cart');
    return data;
  },
  add: async (payload: AddToCartPayload) => {
    const { data } = await api.post<CartState>('/cart', payload);
    return data;
  },
  update: async (payload: UpdateCartItemPayload) => {
    const { data } = await api.patch<CartState>('/cart', payload);
    return data;
  },
  remove: async (productId: string) => {
    const { data } = await api.delete<CartState>(`/cart/${productId}`);
    return data;
  },
};
