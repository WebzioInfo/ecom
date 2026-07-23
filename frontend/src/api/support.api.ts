import { api } from './axios';

export interface TicketMessage {
  _id: string;
  senderId: string;
  senderRole: string;
  message: string;
  attachments?: string[];
  createdAt: string;
}

export interface Ticket {
  _id: string;
  subject: string;
  type: string;
  status: string;
  storeId: any;
  createdBy: any;
  assignedTo?: any;
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
}

export const supportApi = {
  createTicket: async (data: { subject: string; type: string; message: string; attachments?: string[] }) => {
    const res = await api.post<Ticket>('/support/tenant', data);
    return res.data;
  },
  
  getStoreTickets: async () => {
    const res = await api.get<Ticket[]>('/support/tenant');
    return res.data;
  },
  
  getStoreTicket: async (id: string) => {
    const res = await api.get<Ticket>(`/support/tenant/${id}`);
    return res.data;
  },
  
  replyToTicket: async (id: string, data: { message: string; attachments?: string[]; status?: string }) => {
    const res = await api.post<Ticket>(`/support/tenant/${id}/reply`, data);
    return res.data;
  },

  // Super Admin Methods
  getGlobalTickets: async (params?: { status?: string; type?: string; storeId?: string }) => {
    const res = await api.get<Ticket[]>('/support/global', { params });
    return res.data;
  },

  getGlobalTicket: async (id: string) => {
    const res = await api.get<Ticket>(`/support/global/${id}`);
    return res.data;
  },

  replyToGlobalTicket: async (id: string, data: { message: string; attachments?: string[]; status?: string }) => {
    const res = await api.post<Ticket>(`/support/global/${id}/reply`, data);
    return res.data;
  },

  updateTicketStatus: async (id: string, status: string) => {
    const res = await api.patch<Ticket>(`/support/global/${id}/status`, { status });
    return res.data;
  },

  assignTicket: async (id: string, superAdminId: string) => {
    const res = await api.patch<Ticket>(`/support/global/${id}/assign`, { superAdminId });
    return res.data;
  },
};
