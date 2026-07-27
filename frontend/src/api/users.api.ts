import { api } from './axios';
import { UpdateProfilePayload, UserProfile } from '../types';

export const usersApi = {
  profile: async () => {
    const { data } = await api.get<UserProfile>('/users/profile');
    return data;
  },
  updateProfile: async (payload: UpdateProfilePayload) => {
    const { data } = await api.patch<UserProfile>('/users/profile', payload);
    return data;
  },
  getStoreStaff: async () => {
    const { data } = await api.get<any[]>('/users/store');
    return data;
  },
  addStoreStaff: async (payload: any) => {
    const { data } = await api.post<any>('/users/store', payload);
    return data;
  },
  updateStoreStaff: async (id: string, payload: any) => {
    const { data } = await api.patch<any>(`/users/store/${id}`, payload);
    return data;
  },
  resetStaffPassword: async (id: string, password?: string) => {
    const { data } = await api.post<any>(`/users/store/${id}/reset-password`, { password });
    return data;
  },
  deleteStoreStaff: async (id: string) => {
    const { data } = await api.delete<any>(`/users/store/${id}`);
    return data;
  },
};
