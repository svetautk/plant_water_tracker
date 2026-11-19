import { Router } from 'express';
import type { Response } from 'express';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import { db } from '../db/index.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { BCRYPT_ROUNDS, SESSION_COOKIE, SESSION_MS } from '../config.js';
// Общие с клиентом ограничения: пакет @plant/shared (папка shared/ в корне проекта)
import { EMAIL_MAX, PASSWORD_MAX, PASSWORD_MIN } from '@plant/shared';

// Свойства cookie без срока жизни (срок добавляем только при установке, см. ниже)
const cookieBase = {
  httpOnly: true, // JavaScript в браузере не может прочитать cookie, украсть её через XSS сложнее
  sameSite: 'lax' as const, // браузер не отправляет cookie при запросах со сторонних сайтов
  secure: process.env.NODE_ENV === 'production', // в продакшене только по HTTPS
  path: '/',
};

// Создаёт сессию в базе и ставит cookie в ответ
const startSession = (res: Response, userId: number) => {
  // 32 случайных байта в виде 64 hex-символов. Угадать невозможно.
  // Важно: именно randomBytes, а не Math.random, который предсказуем.
  const id = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_MS).toISOString();

  db.prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)').run(
    id,
    userId,
    expiresAt,
  );

  res.cookie(SESSION_COOKIE, id, { ...cookieBase, maxAge: SESSION_MS });
};

// Из тела запроса достаём email и пароль или возвращаем null, если там мусор.
// Email приводим к нижнему регистру: Anna@mail.com и anna@mail.com это один человек.
const readCredentials = (body: unknown): { email: string; password: string } | null => {
  if (typeof body !== 'object' || body === null) return null;
  const { email, password } = body as Record<string, unknown>;
  if (typeof email !== 'string' || typeof password !== 'string') return null;
  return { email: email.trim().toLowerCase(), password };
};

// Минимальная проверка: что-то@что-то.что-то и без пробелов.
// Строже проверять смысла нет, настоящую проверку делает только письмо на адрес.
const isValidEmail = (email: string) =>
  email.length <= EMAIL_MAX && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const authRouter = Router();

// POST /api/auth/register
authRouter.post('/register', async (req, res) => {
  const credentials = readCredentials(req.body);

  if (
    !credentials ||
    !isValidEmail(credentials.email) ||
    credentials.password.length < PASSWORD_MIN ||
    credentials.password.length > PASSWORD_MAX
  ) {
    res.status(400).json({ error: 'Invalid email or password' });
    return;
  }

  const { email, password } = credentials;

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    // 409 Conflict: такой ресурс уже есть
    res.status(409).json({ error: 'Email already registered' });
    return;
  }

  // Хешируем пароль. await, потому что bcrypt считает долго специально
  // (это защита от перебора) и не должен блокировать сервер.
  // Хеш включает в себя "соль" (случайную добавку), поэтому у одинаковых паролей
  // разные хеши, и сравнивать их можно только через bcrypt.compare.
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const result = db
    .prepare('INSERT INTO users (email, password_hash, created_at) VALUES (?, ?, ?)')
    .run(email, passwordHash, new Date().toISOString());

  // lastInsertRowid это id только что созданной строки
  const userId = Number(result.lastInsertRowid);

  startSession(res, userId); // сразу входим, повторно вводить пароль не заставляем
  res.status(201).json({ id: userId, email });
});

// POST /api/auth/login
authRouter.post('/login', async (req, res) => {
  const credentials = readCredentials(req.body);

  if (!credentials) {
    res.status(400).json({ error: 'Invalid email or password' });
    return;
  }

  const { email, password } = credentials;

  const user = db
    .prepare('SELECT id, email, password_hash FROM users WHERE email = ?')
    .get(email) as { id: number; email: string; password_hash: string } | undefined;

  // Сравниваем введённый пароль с хешем. Если пользователя нет, ok = false.
  const ok = user ? await bcrypt.compare(password, user.password_hash) : false;

  // Одно и то же сообщение для "нет такого email" и "неверный пароль":
  // так нельзя перебором выяснить, какие адреса зарегистрированы.
  if (!user || !ok) {
    res.status(401).json({ error: 'Wrong email or password' });
    return;
  }

  // Заодно чистим просроченные сессии, чтобы таблица не росла бесконечно
  db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(new Date().toISOString());

  startSession(res, user.id);
  res.json({ id: user.id, email: user.email });
});

// POST /api/auth/logout
authRouter.post('/logout', (req, res) => {
  const sessionId = req.cookies?.[SESSION_COOKIE];

  // Удаляем сессию из базы: после этого cookie даже у злоумышленника, укравшего её, не работает.
  if (typeof sessionId === 'string') {
    db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
  }

  res.clearCookie(SESSION_COOKIE, cookieBase); // просим браузер удалить cookie
  res.status(204).end();
});

// GET /api/auth/me: кто сейчас вошёл. Клиент вызовет это при запуске приложения.
authRouter.get('/me', requireAuth, (_req, res) => {
  const user = db
    .prepare('SELECT id, email FROM users WHERE id = ?')
    .get(res.locals.userId as number);

  res.json(user);
});