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

// Prevent multiple refresh requests simultaneously
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        localStorage.removeItem('access_token');
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // If already refreshing, wait for the token and retry
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = 'Bearer ' + token;
            return api(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        // Determine if it's a super admin or store admin route
        const isSuperAdminRoute = originalRequest.url?.includes('/super-admin') || window.location.pathname.includes('/super-admin');
        const refreshUrl = isSuperAdminRoute ? '/super-admin/auth/refresh' : '/auth/refresh';

        const { data } = await axios.post(`${baseURL}${refreshUrl}`, { refresh_token: refreshToken });
        
        const newAccessToken = data.access_token;
        localStorage.setItem('access_token', newAccessToken);
        
        api.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;
        originalRequest.headers.Authorization = 'Bearer ' + newAccessToken;
        
        processQueue(null, newAccessToken);
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  },
);
