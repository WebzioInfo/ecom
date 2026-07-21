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
      // 1. Persist the token so the Axios interceptor picks it up immediately
      localStorage.setItem('access_token', data.access_token);

      // 2. Fetch the full user profile using the new token
      try {
        const profile = await authApi.me();
        setUser({
          id: profile._id,
          email: profile.email,
          name: profile.name,
          roles: profile.roles,
        });
      } catch {
        // Fallback: If /auth/me fails despite a fresh token, clear and reject
        localStorage.removeItem('access_token');
        setUser(null);
      }
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: async (data: LoginResponse) => {
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
        try {
          const profile = await authApi.me();
          setUser({
            id: profile._id,
            email: profile.email,
            name: profile.name,
            roles: profile.roles,
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
