// Так сервер описывает пользователя в ответах /auth/me, /auth/login, /auth/register
export interface User {
  id: number;
  email: string;
}

// Что отправляем при входе и регистрации: тип из общего пакета (shared/schemas.ts)
export type { Credentials } from '@plant/shared';
