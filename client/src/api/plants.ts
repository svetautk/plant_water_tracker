import { api } from './client';
import type { Plant, PlantInput } from '@plant/shared';

export const fetchPlants = () => api.get<Plant[]>('/plants');

export const createPlant = (data: PlantInput) => api.post<Plant>('/plants', data);

export const updatePlant = (id: string, data: Partial<PlantInput>) =>
  api.patch<Plant>(`/plants/${id}`, data);

export const deletePlant = (id: string) => api.delete(`/plants/${id}`);
