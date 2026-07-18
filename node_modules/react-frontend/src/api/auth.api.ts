import { api } from './axios';
import { LoginPayload, LoginResponse, RegisterPayload } from '../types';

export const authApi = {
  login: async (payload: LoginPayload) => {
    const { data } = await api.post<LoginResponse>('/auth/login', payload);
    return data;
  },

  register: async (payload: RegisterPayload) => {
    const { data } = await api.post('/auth/register', payload);
    return data;
  },

  forgotPassword: async (email: string) => {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data;
  },

  resetPassword: async (token: string, password: string) => {
    const { data } = await api.post('/auth/reset-password', { token, password });
    return data;
  },

  verifyEmail: async (token: string) => {
    const { data } = await api.post('/auth/verify-email', { token });
    return data;
  },
};
