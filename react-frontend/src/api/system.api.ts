import { api } from './axios';

export const systemApi = {
  getMetrics: async () => {
    const res = await api.get('/health/metrics');
    return res.data;
  }
};
