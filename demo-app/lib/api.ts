import axios from 'axios';

const BASE_URL = 'http://localhost:4000/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach dynamic request interceptor to load tokens and headers on the fly
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const storeId = localStorage.getItem('qa_store_id');
      const apiKey = localStorage.getItem('qa_api_key');
      const token = localStorage.getItem('qa_token');

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
