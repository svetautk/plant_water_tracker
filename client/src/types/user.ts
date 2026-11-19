// Так сервер описывает пользователя в ответах /auth/me, /auth/login, /auth/register
export interface User {
  id: number;
  email: string;
}

// Что отправляем при входе и регистрации
export interface Credentials {
  email: string;
  password: string;
}
