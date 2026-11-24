export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const BASE_URL = '/api';

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const response = await fetch(BASE_URL + path, {
    method,
    // Тело есть только у POST/PATCH. Говорим серверу, что шлём JSON,
    // иначе express.json() не разберёт его и req.body будет пустым.
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    // Отправлять cookie (наша сессия 'sid'). Для того же адреса это поведение
    // по умолчанию, но пишем явно, чтобы было понятно, откуда берётся авторизация.
    credentials: 'same-origin',
  });

  // response.ok === true для статусов 200–299. Всё остальное превращаем в исключение,
  // чтобы TanStack Query понял, что запрос упал, и положил ошибку в `error`.
  if (!response.ok) {
    // Сервер отвечает { error: '...' }. Но тело может быть и не JSON (например,
    // если сервер вообще не запущен и прокси вернул HTML), поэтому через catch.
    const data = await response.json().catch(() => null);
    const message = data?.error ?? response.statusText;
    throw new ApiError(response.status, message);
  }

  // 204 No Content (DELETE, logout): тела нет, и response.json() упал бы.
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

// Короткие методы, чтобы в коде читалось как в описании API:
// api.get('/plants'), api.post('/plants', data) и т.д.
export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
  delete: <T = void>(path: string) => request<T>('DELETE', path),
};
