import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/useAuthStore';
import { LoginPayload, LoginResponse, RegisterPayload } from '../types';

export const useAuth = () => {
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: async (payload: LoginPayload) => authApi.login(payload),
    onSuccess: async (data: LoginResponse) => {
      // 1. Persist the tokens so the Axios interceptor picks them up
      localStorage.setItem('access_token', data.access_token);
      if (data.refresh_token) {
        localStorage.setItem('refresh_token', data.refresh_token);
      }

      // 2. Hydrate Zustand store immediately from login response payload
      if (data.user) {
        setUser({
          id: data.user.id || (data.user as any)._id || '',
          email: data.user.email,
          name: data.user.name,
          role: data.user.role || data.user.roles?.[0] || 'USER',
          roles: data.user.roles || [],
          permissions: data.user.permissions || [],
          accessibleModules: data.user.accessibleModules || [],
          isSuperAdmin: data.user.isSuperAdmin || false,
          storeId: data.user.storeId || '',
        });
      }

      // 3. Re-verify user profile with GET /auth/me
      try {
        const profile = await authApi.me();
        setUser({
          id: profile.id || profile._id || '',
          email: profile.email,
          name: profile.name,
          role: profile.role || profile.roles?.[0] || 'USER',
          roles: profile.roles || [],
          permissions: profile.permissions || [],
          accessibleModules: profile.accessibleModules || [],
          isSuperAdmin: profile.isSuperAdmin || false,
          storeId: profile.storeId || '',
        });
      } catch (error) {
        // Log background profile verification fallback
      }
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: async (data: LoginResponse) => {
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
        if (data.refresh_token) {
          localStorage.setItem('refresh_token', data.refresh_token);
        }
        try {
          const profile = await authApi.me();
          setUser({
            id: profile.id || profile._id || '',
            email: profile.email,
            name: profile.name,
            role: profile.role || profile.roles?.[0] || 'USER',
            roles: profile.roles || [],
            permissions: profile.permissions || [],
            accessibleModules: profile.accessibleModules || [],
            isSuperAdmin: profile.isSuperAdmin || false,
            storeId: profile.storeId || '',
          });
        } catch {
          localStorage.removeItem('access_token');
          setUser(null);
        }
      }
    },
  });

  return {
    loginMutation,
    registerMutation,
    logout: () => {
      logout();
      queryClient.clear();
    },
  };
};
