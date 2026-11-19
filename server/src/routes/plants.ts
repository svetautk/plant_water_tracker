import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { db } from '../db/index.js';
// Схема проверки и тип растения общие с клиентом: пакет @plant/shared (файл shared/schemas.ts)
import { plantInputSchema, type Plant } from '@plant/shared';

const COLUMNS = `id, emoji, name, last_watered AS lastWatered, interval_days AS intervalDays`;

export const plantsRouter = Router();

// GET /api/plants - список растений ТЕКУЩЕГО пользователя
plantsRouter.get('/', (_req, res) => {
  const userId = res.locals.userId as number;
  const plants = db
    .prepare(`SELECT ${COLUMNS} FROM plants WHERE user_id = ?`)
    .all(userId) as Plant[];
  res.json(plants);
});

// POST /api/plants - добавить растение
plantsRouter.post('/', (req, res) => {
  const userId = res.locals.userId as number;

  // Проверяем тело запроса по схеме. В parsed.data имя уже без пробелов по краям.
  const parsed = plantInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid plant data' });
    return;
  }
  const data = parsed.data;

  const id = randomUUID();
  db.prepare(
    `INSERT INTO plants (id, user_id, emoji, name, last_watered, interval_days)
     VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(id, userId, data.emoji, data.name, data.lastWatered, data.intervalDays);

  // 201 Created: ресурс создан. Возвращаем его целиком, клиенту удобно сразу показать.
  res.status(201).json({ id, ...data });
});

// PATCH /api/plants/:id - изменить растение (в том числе полив)
plantsRouter.patch('/:id', (req, res) => {
  const userId = res.locals.userId as number;
  const { id } = req.params;

  const existing = db
    .prepare(`SELECT ${COLUMNS} FROM plants WHERE id = ? AND user_id = ?`)
    .get(id, userId) as Plant | undefined;

  if (!existing) {
    res.status(404).json({ error: 'Plant not found' });
    return;
  }

  // PATCH может прислать только часть полей (например, при поливе только lastWatered).
  // Недостающие берём из базы, а получившееся растение целиком проверяем той же схемой.
  const body: Record<string, unknown> = req.body ?? {};
  const parsed = plantInputSchema.safeParse({
    emoji: body.emoji ?? existing.emoji,
    name: body.name ?? existing.name,
    lastWatered: body.lastWatered ?? existing.lastWatered,
    intervalDays: body.intervalDays ?? existing.intervalDays,
  });

  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid plant data' });
    return;
  }
  const data = parsed.data;

  db.prepare(
    `UPDATE plants
     SET emoji = ?, name = ?, last_watered = ?, interval_days = ?
     WHERE id = ? AND user_id = ?`,
  ).run(data.emoji, data.name, data.lastWatered, data.intervalDays, id, userId);

  res.json({ id: existing.id, ...data });
});

// DELETE /api/plants/:id
plantsRouter.delete('/:id', (req, res) => {
  const userId = res.locals.userId as number;

  const result = db
    .prepare('DELETE FROM plants WHERE id = ? AND user_id = ?')
    .run(req.params.id, userId);

  if (result.changes === 0) {
    res.status(404).json({ error: 'Plant not found' });
    return;
  }

  res.status(204).end();
});