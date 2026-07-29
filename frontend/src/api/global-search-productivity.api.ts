import { api } from './axios';

export interface SearchResultItem {
  id: string;
  title: string;
  subtitle?: string;
  category: 'STORES' | 'USERS' | 'SUBSCRIPTIONS' | 'PLANS' | 'INVOICES' | 'WEBHOOKS' | 'AUDIT' | 'NAVIGATION';
  url: string;
  iconName?: string;
  metadata?: Record<string, any>;
}

export interface FavoriteItem {
  id: string;
  title: string;
  url: string;
  category: string;
  iconName?: string;
}

export const globalSearchProductivityApi = {
  searchGlobal: async (query: string) => {
    if (!query.trim()) return [];
    const res = await api.get<SearchResultItem[]>('/admin/search', { params: { q: query } }).catch(() => ({ data: [] }));
    return res.data;
  },

  getRecentSearches: async () => {
    const res = await api.get<SearchResultItem[]>('/admin/search/recent').catch(() => ({ data: [] }));
    return res.data;
  },

  getFavorites: async () => {
    const res = await api.get<FavoriteItem[]>('/admin/search/favorites').catch(() => ({ data: [] }));
    return res.data;
  },

  addFavorite: async (item: Omit<FavoriteItem, 'id'>) => {
    const res = await api.post<FavoriteItem>('/admin/search/favorites', item);
    return res.data;
  },

  removeFavorite: async (id: string) => {
    const res = await api.delete(`/admin/search/favorites/${id}`);
    return res.data;
  },
};
