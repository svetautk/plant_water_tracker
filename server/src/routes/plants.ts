import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { db } from '../db/index.js';

interface PlantInput {
  emoji: string;
  name: string;
  lastWatered: string;
  intervalDays: number;
}

interface Plant extends PlantInput {
  id: string;
}

const COLUMNS = `id, emoji, name, last_watered AS lastWatered, interval_days AS intervalDays`;
const EMOJI_MAX = 12;
const NAME_MAX = 25;
const INTERVAL_MIN = 1;
const INTERVAL_MAX = 365;

const isValidDate = (value: unknown): value is string => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
};

const validatePlant = (input: Record<string, unknown>): PlantInput | null => {
  const { emoji, name, lastWatered, intervalDays } = input;

  if (typeof emoji !== 'string' || emoji.length === 0 || emoji.length > EMOJI_MAX) return null;
  if (typeof name !== 'string' || name.trim().length === 0 || name.trim().length > NAME_MAX) return null;
  if (!isValidDate(lastWatered)) return null;
  if (typeof intervalDays !== 'number' || !Number.isInteger(intervalDays)) return null;
  if (intervalDays < INTERVAL_MIN || intervalDays > INTERVAL_MAX) return null;

  return { emoji, name: name.trim(), lastWatered, intervalDays };
};

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

  const data = validatePlant(req.body ?? {});
  if (!data) {
    res.status(400).json({ error: 'Invalid plant data' });
    return;
  }

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

  const body: Record<string, unknown> = req.body ?? {};
  const data = validatePlant({
    emoji: body.emoji ?? existing.emoji,
    name: body.name ?? existing.name,
    lastWatered: body.lastWatered ?? existing.lastWatered,
    intervalDays: body.intervalDays ?? existing.intervalDays,
  });

  if (!data) {
    res.status(400).json({ error: 'Invalid plant data' });
    return;
  }

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