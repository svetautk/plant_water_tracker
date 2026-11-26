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

const emailSchema = z.string().trim().toLowerCase().max(EMAIL_MAX).pipe(z.email());

export const registerSchema = z.object({
  email: emailSchema,
  password: z.string().min(PASSWORD_MIN).max(PASSWORD_MAX),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase(),
  password: z.string(),
});

export type Credentials = z.infer<typeof loginSchema>;

export const plantInputSchema = z.object({
  emoji: z.string().min(1).max(PLANT_EMOJI_MAX),
  name: z.string().trim().min(1).max(PLANT_NAME_MAX),
  lastWatered: z.iso.date(),
  intervalDays: z.number().int().min(INTERVAL_MIN).max(INTERVAL_MAX),
});

export type PlantInput = z.infer<typeof plantInputSchema>;

export type Plant = PlantInput & { id: string };