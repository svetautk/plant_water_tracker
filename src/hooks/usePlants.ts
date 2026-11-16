import { useEffect, useState } from 'react';
import type { Plant, PlantInput } from '../types/plant';
import { getTodayDateStr } from '../utils/date';

const STORAGE_KEY = 'plant-tracker:plants';

const loadPlants = (): Plant[] => {
  try {
    const rawData = localStorage.getItem(STORAGE_KEY);
    if (!rawData) return [];

    const parsed: unknown = JSON.parse(rawData);
    return Array.isArray(parsed) ? (parsed as Plant[]) : [];
  } catch {
    return [];
  }
};

export const usePlants = () => {
  const [plants, setPlants] = useState<Plant[]>(loadPlants);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plants));
  }, [plants]);

  const addPlant = (data: PlantInput) => {
    setPlants((prev) => [...prev, { ...data, id: crypto.randomUUID() }]);
  };

  const updatePlant = (id: string, data: PlantInput) => {
    setPlants((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
  };

  const removePlant = (id: string) => {
    setPlants((prev) => prev.filter((p) => p.id !== id));
  };

  const waterNow = (id: string) => {
    setPlants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, lastWatered: getTodayDateStr() } : p)),
    );
  };

  return { plants, addPlant, updatePlant, removePlant, waterNow };
};