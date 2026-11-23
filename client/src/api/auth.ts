import { api, ApiError } from './client';
import type { Credentials, User } from '../types/user';

export const fetchMe = async (): Promise<User | null> => {
  try {
    return await api.get<User>('/auth/me');
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
};

export const login = (credentials: Credentials) => api.post<User>('/auth/login', credentials);

export const register = (credentials: Credentials) =>
  api.post<User>('/auth/register', credentials);

export const logout = () => api.post<void>('/auth/logout');
