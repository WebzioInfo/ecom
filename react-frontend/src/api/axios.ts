import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL;
if (!baseURL) {
  throw new Error('VITE_API_URL is not defined. Add VITE_API_URL to react-frontend/.env.');
}

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem('access_token');
    }
    return Promise.reject(error);
  },
);
