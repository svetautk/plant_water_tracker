import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createPlant, deletePlant, fetchPlants, updatePlant } from '../api/plants';
import type { Plant, PlantInput } from '../types/plant';
import { getTodayDateStr } from '../utils/date';

export const PLANTS_KEY = ['plants'];

export const usePlants = () =>
  useQuery({
    queryKey: PLANTS_KEY,
    queryFn: fetchPlants,
  });

export const useAddPlant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPlant,
    onSuccess: (created) => {
      queryClient.setQueryData<Plant[]>(PLANTS_KEY, (old = []) => [...old, created]);
    },
  });
};

const replacePlant = (plants: Plant[] = [], updated: Plant) =>
  plants.map((p) => (p.id === updated.id ? updated : p));

export const useUpdatePlant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PlantInput }) => updatePlant(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData<Plant[]>(PLANTS_KEY, (old) => replacePlant(old, updated));
    },
  });
};

export const useWaterPlant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => updatePlant(id, { lastWatered: getTodayDateStr() }),
    onSuccess: (updated) => {
      queryClient.setQueryData<Plant[]>(PLANTS_KEY, (old) => replacePlant(old, updated));
    },
  });
};

export const useDeletePlant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePlant,
    onSuccess: (_result, id) => {
      queryClient.setQueryData<Plant[]>(PLANTS_KEY, (old = []) => old.filter((p) => p.id !== id));
    },
  });
};
