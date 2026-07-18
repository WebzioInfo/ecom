import { api } from './axios';
import { UpdateProfilePayload, UserProfile, WishlistResponse } from '../types';

export const usersApi = {
  profile: async () => {
    const { data } = await api.get<UserProfile>('/users/profile');
    return data;
  },
  updateProfile: async (payload: UpdateProfilePayload) => {
    const { data } = await api.patch<UserProfile>('/users/profile', payload);
    return data;
  },
  wishlist: async () => {
    const { data } = await api.get<WishlistResponse>('/users/wishlist');
    return data;
  },
  addToWishlist: async (productId: string) => {
    const { data } = await api.post<WishlistResponse>('/users/wishlist', { productId });
    return data;
  },
  removeFromWishlist: async (productId: string) => {
    const { data } = await api.delete<WishlistResponse>(`/users/wishlist/${productId}`);
    return data;
  },
};
