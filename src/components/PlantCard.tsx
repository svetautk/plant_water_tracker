import { useTranslation } from 'react-i18next';
import type { Plant } from '../types/plant';
import { getWateringInfo } from '../utils/date';

interface Props {
  plant: Plant;
  onEdit: () => void;
  onDelete: () => void;
  onWater: () => void;
}

export default function PlantCard({ plant, onEdit, onDelete, onWater }: Props) {
  const { t } = useTranslation();
  const { state, diff } = getWateringInfo(plant);

  const phrase = (() => {
    if (diff === 0) return t('when.today');
    if (diff === 1) return t('when.tomorrow');
    if (diff === -1) return t('when.yesterday');
    if (diff > 1) return t('when.inDays', { count: diff });
    return t('when.daysAgo', { count: -diff });
  })();

  const label = state === 'overdue' ? t('card.shouldHaveWatered') : t('card.nextWatering');

  const handleDelete = () => {
    if (window.confirm(t('card.confirmDelete', { name: plant.name }))) onDelete();
  };

  return (
    <article className="card">
      <div className="card__top">
        <span className="card__emoji" aria-hidden="true">
          {plant.emoji}
        </span>
        <h2 className="card__name">{plant.name}</h2>
        <button
          type="button"
          className="icon-btn"
          onClick={onEdit}
          title={t('card.edit')}
          aria-label={t('card.edit')}
        >
          ✏️
        </button>
        <button
          type="button"
          className="icon-btn"
          onClick={handleDelete}
          title={t('card.delete')}
          aria-label={t('card.delete')}
        >
          🗑️
        </button>
      </div>

      <p className="card__interval">{t('card.waterEvery', { count: plant.intervalDays })}</p>

      <p className="card__next">
        {label}: <span className={`pill pill--${state}`}>{phrase}</span>
      </p>

      <button type="button" className="btn btn--primary btn--block" onClick={onWater}>
        💧 {t('card.wateringNow')}
      </button>
    </article>
  );
}