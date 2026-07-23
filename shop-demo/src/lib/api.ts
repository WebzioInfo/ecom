import axios from 'axios';

const BASE_URL = 'http://localhost:4000/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject client context headers dynamically
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const storeId = localStorage.getItem('shop_store_id');
      const apiKey = localStorage.getItem('shop_api_key') || 'demo_key_electronics_hub';
      const token = localStorage.getItem('shop_token');

      if (storeId) {
        config.headers['x-store-id'] = storeId;
      }
      if (apiKey) {
        config.headers['x-api-key'] = apiKey;
      }
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);
