import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SuperAdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface SuperAdminAuthState {
  user: SuperAdminUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (user: SuperAdminUser, accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

export const useSuperAdminAuthStore = create<SuperAdminAuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken }),
      logout: () => set({ user: null, accessToken: null, refreshToken: null }),
    }),
    {
      name: 'super-admin-auth-storage',
    }
  )
);
