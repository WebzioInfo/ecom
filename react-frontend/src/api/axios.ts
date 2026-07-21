import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('access_token');
  const activeStoreId = localStorage.getItem('active_store_id');
  
  const isAuthRoute = config.url && (config.url.includes('/auth/login') || config.url.includes('/super-admin-auth/login'));

  if (token && config.headers && !isAuthRoute) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (activeStoreId && config.headers && !config.headers['x-store-id'] && !isAuthRoute) {
    config.headers['x-store-id'] = activeStoreId;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const requestUrl = (error.config as InternalAxiosRequestConfig)?.url ?? '';
      const isInitCall = requestUrl.includes('/auth/me');
      if (!isInitCall) {
        localStorage.removeItem('access_token');
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
    }
    return Promise.reject(error);
  },
);
