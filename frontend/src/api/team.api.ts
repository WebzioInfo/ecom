import { api } from './index';

export const teamApi = {
  getMembers: async () => {
    const response = await api.get('/team/members');
    return response.data;
  },

  getRoles: async () => {
    const response = await api.get('/team/roles');
    return response.data;
  },

  createMember: async (data: any) => {
    const response = await api.post('/team/members', data);
    return response.data;
  },

  updateMember: async (id: string, data: any) => {
    const response = await api.patch(`/team/members/${id}`, data);
    return response.data;
  },

  removeMember: async (id: string) => {
    const response = await api.delete(`/team/members/${id}`);
    return response.data;
  },
};
