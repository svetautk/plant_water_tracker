import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchMe, login, logout, register } from '../api/auth';
import type { User } from '../types/user';

export const ME_KEY = ['me'];

export const useMe = () =>
  useQuery({
    queryKey: ME_KEY,
    queryFn: fetchMe,
    staleTime: Infinity,
  });

export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: login,
    onSuccess: (user) => queryClient.setQueryData<User | null>(ME_KEY, user),
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: register,
    onSuccess: (user) => queryClient.setQueryData<User | null>(ME_KEY, user),
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData<User | null>(ME_KEY, null);
      queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== ME_KEY[0] });
    },
  });
};
