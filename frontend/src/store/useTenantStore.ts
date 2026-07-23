import { create } from 'zustand';

export interface StoreItem {
  _id: string;
  name: string;
  slug: string;
  status: 'active' | 'suspended' | 'pending';
  plan: 'basic' | 'pro' | 'enterprise';
  domain?: string;
}

interface TenantState {
  activeStore: StoreItem | null;
  stores: StoreItem[];
  environment: 'production' | 'sandbox';
  setActiveStore: (store: StoreItem | null) => void;
  setStores: (stores: StoreItem[]) => void;
  setEnvironment: (env: 'production' | 'sandbox') => void;
}

export const useTenantStore = create<TenantState>((set) => ({
  activeStore: localStorage.getItem('active_store_data')
    ? JSON.parse(localStorage.getItem('active_store_data') || '{}')
    : null,
  stores: [],
  environment: 'production',
  setActiveStore: (store) => {
    if (store) {
      localStorage.setItem('active_store_id', store._id);
      localStorage.setItem('active_store_data', JSON.stringify(store));
    } else {
      localStorage.removeItem('active_store_id');
      localStorage.removeItem('active_store_data');
    }
    set({ activeStore: store });
  },
  setStores: (stores) => set({ stores }),
  setEnvironment: (environment) => set({ environment }),
}));
