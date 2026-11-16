import type { Plant } from '../types/plant';

const MS_IN_DAY = 86_400_000; // кол-во миллисекунд в сутках

export const getTodayDateStr = (): string => {  // поменять в других файлах название функции на getTodayDateStr
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
};

export type WateringState = 'ok' | 'today' | 'overdue';

export const getWateringInfo = (plant: Plant) => {
  const passed = (Date.parse(getTodayDateStr()) - Date.parse(plant.lastWatered)) / MS_IN_DAY;
  const diff = plant.intervalDays - passed;

  const state: WateringState = diff < 0 ? 'overdue' : diff === 0 ? 'today' : 'ok';
  return { state, diff };
};