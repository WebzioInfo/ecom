import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { usersApi } from '../api/users.api';
import { useAuthStore } from '../store/useAuthStore';
import { LoginPayload, LoginResponse, RegisterPayload, UserProfile } from '../types';

export const useAuth = () => {
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: async (payload: LoginPayload) => authApi.login(payload),
    onSuccess: async (data: LoginResponse) => {
      localStorage.setItem('access_token', data.access_token);
      try {
        const profile = await usersApi.profile();
        setUser({
          id: profile._id,
          email: profile.email,
          name: profile.name,
          roles: profile.roles,
        });
      } catch {
        setUser({ id: '', email: '', name: '', roles: ['user'] });
      }
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (payload: RegisterPayload) => authApi.register(payload),
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
