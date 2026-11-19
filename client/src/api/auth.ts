// Функции для запросов авторизации. Они ничего не знают про React:
// это просто "сходи на сервер и верни результат". React-часть живёт в hooks/useAuth.ts.
import { api, ApiError } from './client';
import type { Credentials, User } from '../types/user';

// Кто сейчас вошёл? Если никто, сервер отвечает 401.
// Для нас "не вошёл" это нормальное состояние, а не ошибка,
// поэтому 401 превращаем в null. Любую другую ошибку пробрасываем дальше.
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
