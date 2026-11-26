import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Plant, PlantInput } from '@plant/shared';
import { getTodayDateStr } from '../utils/date';
import { useAddPlant, useUpdatePlant } from '../hooks/usePlants';
import {
  DEFAULT_INTERVAL_DAYS,
  INTERVAL_MAX,
  INTERVAL_MIN,
  PLANT_EMOJIS,
  PLANT_NAME_MAX,
} from '../config';

interface Props {
  plant?: Plant;
  onClose: () => void;
}

export default function PlantModal({ plant, onClose }: Props) {
  const { t } = useTranslation();
  const today = getTodayDateStr();

  const [emoji, setEmoji] = useState(plant?.emoji ?? PLANT_EMOJIS[0]);
  const [name, setName] = useState(plant?.name ?? '');
  const [lastWatered, setLastWatered] = useState(plant?.lastWatered ?? today);
  const [intervalDays, setIntervalDays] = useState(String(plant?.intervalDays ?? DEFAULT_INTERVAL_DAYS));

  const addMutation = useAddPlant();
  const updateMutation = useUpdatePlant();
  const saveMutation = plant ? updateMutation : addMutation;

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data: PlantInput = {
      emoji,
      name: name.trim(),
      lastWatered,
      intervalDays: Number(intervalDays),
    };
    const options = { onSuccess: onClose };
    if (plant) {
      updateMutation.mutate({ id: plant.id, data }, options);
    } else {
      addMutation.mutate(data, options);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="modal" role="dialog" aria-modal="true" onSubmit={handleSubmit}>
        <h2 className="modal__title">{plant ? t('form.editTitle') : t('form.addTitle')}</h2>

        <div className="field">
          <span className="field__label">{t('form.icon')}</span>
          <div className="emoji-grid">
            {PLANT_EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                className={`emoji-btn ${e === emoji ? 'emoji-btn--active' : ''}`}
                onClick={() => setEmoji(e)}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <label className="field">
          <span className="field__label field__label--row">
            {t('form.name')}
            <span className={`field__counter ${name.length >= PLANT_NAME_MAX ? 'field__counter--limit' : ''}`}>
              {name.length}/{PLANT_NAME_MAX}
            </span>
          </span>
          <input
            className={`input ${name.length >= PLANT_NAME_MAX ? 'input--limit' : ''}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('form.namePlaceholder')}
            maxLength={PLANT_NAME_MAX}
            required
            autoFocus
          />
        </label>

        <label className="field">
          <span className="field__label">{t('form.lastWatered')}</span>
          <input
            className="input"
            type="date"
            value={lastWatered}
            max={today}
            onChange={(e) => setLastWatered(e.target.value)}
            required
          />
        </label>

        <label className="field">
          <span className="field__label">{t('form.interval')}</span>
          <input
            className="input"
            type="number"
            min={INTERVAL_MIN}
            max={INTERVAL_MAX}
            step={1}
            value={intervalDays}
            onChange={(e) => setIntervalDays(e.target.value)}
            required
          />
        </label>

        {saveMutation.isError && (
          <p className="banner-error" role="alert">
            {t('plants.saveError')}
          </p>
        )}

        <div className="modal__actions">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            {t('form.cancel')}
          </button>
          <button type="submit" className="btn btn--primary" disabled={saveMutation.isPending}>
            {t('form.save')}
          </button>
        </div>
      </form>
    </div>
  );
}