import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Droplets, Pencil, Trash2 } from 'lucide-react';
import type { Plant } from '@plant/shared';
import { getWateringInfo } from '../utils/date';
import ConfirmModal from './ConfirmModal';

interface Props {
  plant: Plant;
  onEdit: () => void;
  onDelete: () => void;
  onWater: () => void;
}

export default function PlantCard({ plant, onEdit, onDelete, onWater }: Props) {
  const { t } = useTranslation();
  const { state, diff } = getWateringInfo(plant);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const phrase = (() => {
    if (diff === 0) return t('when.today');
    if (diff === 1) return t('when.tomorrow');
    if (diff === -1) return t('when.yesterday');
    if (diff > 1) return t('when.inDays', { count: diff });
    return t('when.daysAgo', { count: -diff });
  })();

  const label = state === 'overdue' ? t('card.shouldHaveWatered') : t('card.nextWatering');

  const handleConfirmDelete = () => {
    setIsConfirmOpen(false);
    onDelete();
  };

  return (
    <>
      <article className="card">
        <div className="card__top">
          <span className="card__emoji" aria-hidden="true">
            {plant.emoji}
          </span>
          <div className="card__actions">
            <button
              type="button"
              className="icon-btn"
              onClick={onEdit}
              title={t('card.edit')}
              aria-label={t('card.edit')}
            >
              <Pencil size={18} />
            </button>
            <button
              type="button"
              className="icon-btn icon-btn--danger"
              onClick={() => setIsConfirmOpen(true)}
              title={t('card.delete')}
              aria-label={t('card.delete')}
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        <h2 className="card__name">{plant.name}</h2>
        <p className="card__interval">{t('card.waterEvery', { count: plant.intervalDays })}</p>

        <p className="card__next">
          {label}
          <span className={`pill pill--${state}`}>{phrase}</span>
        </p>

        <button type="button" className="btn btn--primary btn--block" onClick={onWater}>
          <Droplets size={18} aria-hidden="true" />
          {t('card.wateringNow')}
        </button>
      </article>
      {isConfirmOpen && (
          <ConfirmModal
            title={t('card.confirmTitle')}
            message={t('card.confirmText', { name: plant.name })}
            confirmLabel={t('card.delete')}
            cancelLabel={t('form.cancel')}
            onConfirm={handleConfirmDelete}
            onCancel={() => setIsConfirmOpen(false)}
          />
        )}
    </>
  );
}