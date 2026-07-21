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
};
