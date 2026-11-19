// Типы растения описаны один раз в общем пакете (shared/schemas.ts) и получены из схемы zod.
// Здесь мы их просто передаём дальше, чтобы компоненты могли и дальше
// писать import type { Plant } from '../types/plant'.
export type { Plant, PlantInput } from '@plant/shared';
