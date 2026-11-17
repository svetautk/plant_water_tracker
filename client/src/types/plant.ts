export interface Plant {
  id: string;
  emoji: string;
  name: string;
  lastWatered: string;
  intervalDays: number;
}

export type PlantInput = Omit<Plant, 'id'>;