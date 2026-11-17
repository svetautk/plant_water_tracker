import { useTranslation } from 'react-i18next';
import type { Plant } from '../types/plant';
import PlantCard from './PlantCard';
import { sortPlants } from '../utils/date';

interface Props {
  plants: Plant[];
  onEdit: (plant: Plant) => void;
  onDelete: (id: string) => void;
  onWater: (id: string) => void;
}

export default function PlantList({ plants, onEdit, onDelete, onWater }: Props) {
  const { t } = useTranslation();

  if (plants.length === 0) {
    return <p className="empty">{t('empty')}</p>;
  }

  const sortedPlants = sortPlants(plants);

  return (
    <div className="grid">
      {sortedPlants.map((plant) => (
        <PlantCard
          key={plant.id}
          plant={plant}
          onEdit={() => onEdit(plant)}
          onDelete={() => onDelete(plant.id)}
          onWater={() => onWater(plant.id)}
        />
      ))}
    </div>
  );
}