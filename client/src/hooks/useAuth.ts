import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchMe, login, logout, register } from '../api/auth';
import type { User } from '../types/user';

// Ключ, под которым текущий пользователь лежит в кеше TanStack Query.
// Выносим в константу, потому что он нужен в нескольких местах: опечатка
// в одном из них дала бы второй, независимый кусок кеша.
export const ME_KEY = ['me'];

// useQuery: ЧИТАЕМ данные. Сам вызывает fetchMe при первом рендере и даёт
//   data       - результат (User или null),
//   isPending  - true, пока ответа ещё не было,
//   isError    - true, если запрос упал (например, сервер не запущен).
export const useMe = () =>
  useQuery({
    queryKey: ME_KEY,
    queryFn: fetchMe,
    // Кто вошёл, меняется только при входе/выходе, а их мы обрабатываем сами.
    // Infinity: не перезапрашивать при каждом переключении вкладки браузера.
    staleTime: Infinity,
  });

// useMutation: ИЗМЕНЯЕМ данные (POST/PATCH/DELETE). В отличие от useQuery,
// сама ничего не запускает, а возвращает функцию mutate(), которую мы вызываем
// по событию (submit формы). Даёт isPending, error и т.д. для этой операции.
//
// onSuccess выполняется после успешного ответа. Сервер вернул пользователя,
// и мы КЛАДЁМ его прямо в кеш под ключ ['me'] через setQueryData.
// Все компоненты, которые используют useMe(), тут же перерисуются с новым
// пользователем. Лишний запрос /auth/me не нужен.
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
      // Записываем "никто не вошёл", и App покажет страницу входа.
      queryClient.setQueryData<User | null>(ME_KEY, null);
      // Удаляем из кеша все ОСТАЛЬНЫЕ данные (в будущем там будут растения):
      // следующий пользователь на этом компьютере не должен их увидеть.
      // Сам ['me'] удалять нельзя: App подписан именно на этот объект в кеше.
      // Если его удалить, setQueryData создал бы новый объект, а App продолжал бы
      // смотреть на старый и не узнал бы о выходе.
      queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== ME_KEY[0] });
    },
  });
};
