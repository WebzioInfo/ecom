import { api } from './axios';

export interface TicketMessage {
  id?: string;
  _id?: string;
  senderId: string;
  senderRole: string;
  message: string;
  attachments?: string[];
  isRead?: boolean;
  isDeleted?: boolean;
  createdAt: string;
}

export interface Ticket {
  id?: string;
  _id?: string;
  subject: string;
  type: string;
  status: string;
  storeId: any;
  createdById?: string;
  createdBy?: any;
  assignedTo?: any;
  messages: TicketMessage[];
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StoreSupportSummary {
  storeId: string;
  storeName: string;
  slug: string;
  ownerName: string;
  ownerEmail: string;
  status: string;
  ticketId: string;
  ticketStatus: string;
  unreadCount: number;
  lastMessage: string;
  lastActivity: string;
}

export const getTicketId = (t: Ticket | null | undefined): string => {
  if (!t) return '';
  return t.id || t._id || '';
};

export const getMessageId = (m: TicketMessage | null | undefined): string => {
  if (!m) return '';
  return m.id || m._id || '';
};

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

  markAsRead: async (id: string) => {
    const res = await api.patch<Ticket>(`/support/read/${id}`);
    return res.data;
  },

  deleteTicket: async (id: string) => {
    const res = await api.delete<Ticket>(`/support/ticket/${id}`);
    return res.data;
  },

  deleteMessage: async (messageId: string, ticketId: string) => {
    const res = await api.delete<Ticket>(`/support/message/${messageId}`, { params: { ticketId } });
    return res.data;
  },

  closeTicket: async (id: string) => {
    const res = await api.patch<Ticket>(`/support/close/${id}`);
    return res.data;
  },

  reopenTicket: async (id: string) => {
    const res = await api.patch<Ticket>(`/support/reopen/${id}`);
    return res.data;
  },

  // Super Admin Methods
  getGlobalSummaries: async () => {
    const res = await api.get<StoreSupportSummary[]>('/support/global/summaries');
    return res.data;
  },

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
