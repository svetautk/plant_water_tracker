// Схемы zod: описание того, какими должны быть данные.
//
// Схема умеет две вещи:
// 1. Проверить данные: schema.safeParse(что-то) скажет, подходят они или нет.
// 2. Дать TypeScript-тип: z.infer<typeof schema> превращает схему в тип,
//    поэтому interface руками писать не нужно, и тип не разойдётся с проверкой.
//
// Файл общий: сервер проверяет по этим схемам запросы, клиент берёт отсюда типы.
import { z } from 'zod';
import {
  EMAIL_MAX,
  INTERVAL_MAX,
  INTERVAL_MIN,
  PASSWORD_MAX,
  PASSWORD_MIN,
  PLANT_EMOJI_MAX,
  PLANT_NAME_MAX,
} from './limits.js';

// ---------- Пользователь ----------

// Email: убираем пробелы по краям, приводим к нижнему регистру
// (Anna@mail.com и anna@mail.com это один человек), и только ПОТОМ проверяем,
// похоже ли это на email. Порядок задаёт .pipe(): «сначала это, результат передай туда».
// Если написать сразу z.email().trim(), то '  anna@mail.com' не пройдёт из-за пробелов.
const emailSchema = z.string().trim().toLowerCase().max(EMAIL_MAX).pipe(z.email());

// Регистрация: email и пароль проверяем строго
export const registerSchema = z.object({
  email: emailSchema,
  password: z.string().min(PASSWORD_MIN).max(PASSWORD_MAX),
});

// Вход: проверяем только, что пришли две строки.
// Длину пароля тут не проверяем: если правила когда-нибудь поменяются,
// люди со старыми паролями всё равно должны суметь войти.
export const loginSchema = z.object({
  email: z.string().trim().toLowerCase(),
  password: z.string(),
});

// Что клиент отправляет при входе и регистрации: { email: string; password: string }
export type Credentials = z.infer<typeof loginSchema>;

// ---------- Растение ----------

export const plantInputSchema = z.object({
  emoji: z.string().min(1).max(PLANT_EMOJI_MAX),
  // trim() срабатывает до min/max: имя из одних пробелов не пройдёт
  name: z.string().trim().min(1).max(PLANT_NAME_MAX),
  // Строка вида 2026-11-19, и дата должна существовать (2026-02-30 не пройдёт)
  lastWatered: z.iso.date(),
  intervalDays: z.number().int().min(INTERVAL_MIN).max(INTERVAL_MAX),
});

// Данные растения без id: { emoji: string; name: string; lastWatered: string; intervalDays: number }
export type PlantInput = z.infer<typeof plantInputSchema>;

// Растение целиком, как его возвращает сервер: те же поля плюс id
export type Plant = PlantInput & { id: string };
