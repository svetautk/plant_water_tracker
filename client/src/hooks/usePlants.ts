// Хуки для растений. Раньше здесь были useState + localStorage,
// теперь источник правды это сервер, а TanStack Query держит его копию в кеше.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createPlant, deletePlant, fetchPlants, updatePlant } from '../api/plants';
import type { Plant, PlantInput } from '../types/plant';
import { getTodayDateStr } from '../utils/date';

export const PLANTS_KEY = ['plants'];

// Чтение списка. Компонент получает { data, isPending, isError, refetch }.
export const usePlants = () =>
  useQuery({
    queryKey: PLANTS_KEY,
    queryFn: fetchPlants,
  });

// Все мутации ниже устроены одинаково: сервер возвращает итоговое растение,
// и мы точечно обновляем массив в кеше через setQueryData.
// Можно было бы вместо этого вызвать invalidateQueries(PLANTS_KEY), и TanStack Query
// заново скачал бы весь список. Это проще, но делает лишний запрос.
// Здесь ответ сервера и так содержит всё нужное, поэтому обновляем кеш сами.

export const useAddPlant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPlant,
    onSuccess: (created) => {
      // old может быть undefined, если список ещё не загружен,
      // поэтому значение по умолчанию: (old = [])
      queryClient.setQueryData<Plant[]>(PLANTS_KEY, (old = []) => [...old, created]);
    },
  });
};

// Вспомогательная функция: заменить в массиве растение с тем же id
const replacePlant = (plants: Plant[] = [], updated: Plant) =>
  plants.map((p) => (p.id === updated.id ? updated : p));

export const useUpdatePlant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    // useMutation передаёт в mutationFn ОДИН аргумент, поэтому id и данные
    // упаковываем в объект: mutate({ id, data })
    mutationFn: ({ id, data }: { id: string; data: PlantInput }) => updatePlant(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData<Plant[]>(PLANTS_KEY, (old) => replacePlant(old, updated));
    },
  });
};

export const useWaterPlant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    // Шлём только одно поле: PATCH для того и нужен
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
    // Сервер ничего не вернул (204), но в onSuccess второй аргумент это то,
    // с чем вызвали mutate(), то есть id удалённого растения
    onSuccess: (_result, id) => {
      queryClient.setQueryData<Plant[]>(PLANTS_KEY, (old = []) => old.filter((p) => p.id !== id));
    },
  });
};
