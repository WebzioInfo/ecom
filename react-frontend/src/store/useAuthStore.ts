import { create } from 'zustand';
import { authApi } from '../api/auth.api';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  roles: string[];
  permissions?: string[];
  storeId?: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isInitializing: true,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('active_store_id');
    localStorage.removeItem('active_store_data');
    set({ user: null, isAuthenticated: false });
  },

  initializeAuth: async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      set({ isInitializing: false });
      return;
    }

    try {
      const profile = await authApi.me();
      const user: AuthUser = {
        id: profile._id || profile.id || '',
        email: profile.email,
        name: profile.name,
        roles: profile.roles || ['staff'],
        permissions: profile.permissions || [],
        storeId: profile.storeId,
      };
      set({
        user,
        isAuthenticated: true,
        isInitializing: false,
      });
    } catch {
      // The Axios interceptor will handle clearing the token and dispatching 'auth:unauthorized'
      // if the token is completely invalid and cannot be refreshed.
      set({ user: null, isAuthenticated: false, isInitializing: false });
    }
  },
}));
