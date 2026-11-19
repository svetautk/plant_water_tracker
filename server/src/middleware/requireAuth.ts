import type { Request, Response, NextFunction } from 'express';
import { db } from '../db/index.js';
import { SESSION_COOKIE } from '../config.js';

// Проверка входа. Выполняется перед каждым защищённым маршрутом.
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  // cookie-parser заполняет req.cookies. Если cookie нет, там undefined.
  const sessionId = req.cookies?.[SESSION_COOKIE];

  if (typeof sessionId !== 'string') {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  // Ищем сессию с таким id, которая ещё не истекла.
  // expires_at хранится как ISO-строка ('2026-12-18T12:00:00.000Z'). Такие строки
  // сравниваются как обычный текст в правильном хронологическом порядке,
  // поэтому "expires_at > сейчас" работает без преобразований.
  const session = db
    .prepare('SELECT user_id FROM sessions WHERE id = ? AND expires_at > ?')
    .get(sessionId, new Date().toISOString()) as { user_id: number } | undefined;

  if (!session) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  // Дальше routes/plants.ts читает res.locals.userId, как и с заглушкой.
  // Поэтому сам plants.ts менять не нужно.
  res.locals.userId = session.user_id;
  next();
};