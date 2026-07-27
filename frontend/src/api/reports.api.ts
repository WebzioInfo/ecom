import { api } from './axios';

export const reportsApi = {
  getSummary: async () => {
    const { data } = await api.get<any>('/reports/summary');
    return data;
  },

  getExportUrl: (type: string) => {
    return `${api.defaults.baseURL}/reports/export?type=${type}`;
  },
};
