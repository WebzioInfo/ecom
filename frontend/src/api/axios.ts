import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4001/api/v1';

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
  
  const isAuthRoute = config.url && (config.url.includes('/auth/login') || config.url.includes('/auth/register') || config.url.includes('/auth/refresh'));

  if (token && config.headers && !isAuthRoute) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Prevent attaching store headers to auth routes which can fail backend UserRegistry validation
  if (!isAuthRoute) {
    if (activeStoreId && activeStoreId !== 'undefined' && activeStoreId !== 'none' && config.headers && !config.headers['x-store-id']) {
      config.headers['x-store-id'] = activeStoreId;
    }

    // Automatically derive store slug from subdomain if present (e.g. acme.commercepro.com -> acme)
    if (config.headers && !config.headers['x-store-id'] && !config.headers['x-store-slug']) {
      const hostname = window.location.hostname;
      const parts = hostname.split('.');
      // Exclude localhost and common generic subdomains
      if (parts.length >= 3 && parts[0] !== 'www' && parts[0] !== 'app' && parts[0] !== 'admin') {
        const derivedSlug = parts[0];
        if (derivedSlug) {
          config.headers['x-store-slug'] = derivedSlug;
        }
      }
    }
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
  (response) => {
    // If the response body has the standard NestJS API envelope format, unwrap it
    if (response.data && typeof response.data === 'object' && 'success' in response.data && 'data' in response.data) {
      response.data = response.data.data;
    }
    return response;
  },
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
        const refreshUrl = '/auth/refresh';

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
