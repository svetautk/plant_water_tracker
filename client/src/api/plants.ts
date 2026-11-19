// Запросы к /api/plants. Каждая функция соответствует одному маршруту
// на сервере (server/src/routes/plants.ts).
import { api } from './client';
import type { Plant, PlantInput } from '../types/plant';

// GET /api/plants → массив растений текущего пользователя
export const fetchPlants = () => api.get<Plant[]>('/plants');

// POST /api/plants → сервер сам создаёт id и возвращает растение целиком
export const createPlant = (data: PlantInput) => api.post<Plant>('/plants', data);

// PATCH /api/plants/:id → можно прислать только изменённые поля
// (Partial<PlantInput> = все поля PlantInput становятся необязательными)
export const updatePlant = (id: string, data: Partial<PlantInput>) =>
  api.patch<Plant>(`/plants/${id}`, data);

// DELETE /api/plants/:id → ответ 204, тела нет
export const deletePlant = (id: string) => api.delete(`/plants/${id}`);
