import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Plant, PlantInput } from '../types/plant';
import { getTodayDateStr } from '../utils/date';

const EMOJIS = ['🪴', '🌱', '🌿', '🍀', '🌵', '🌴', '🌸', '🌷', '🌻', '🌺', '🍃', '🌼', '🍅', '🥬', '🌶️', '🎍'];

interface Props {
  plant?: Plant;
  onSave: (data: PlantInput) => void;
  onClose: () => void;
}

export default function PlantModal({ plant, onSave, onClose }: Props) {
  const { t } = useTranslation();
  const today = getTodayDateStr();

  const [emoji, setEmoji] = useState(plant?.emoji ?? EMOJIS[0]);
  const [name, setName] = useState(plant?.name ?? '');
  const [lastWatered, setLastWatered] = useState(plant?.lastWatered ?? today);
  const [intervalDays, setIntervalDays] = useState(String(plant?.intervalDays ?? 7));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="modal" 
        role="dialog" 
        aria-modal="true"
        onSubmit={(e) => {
            e.preventDefault();
            onSave({
                emoji,
                name: name.trim(),
                lastWatered,
                intervalDays: Number(intervalDays),
                });
        }}>
            
        <h2 className="modal__title">{plant ? t('form.editTitle') : t('form.addTitle')}</h2>

        <div className="field">
          <span className="field__label">{t('form.icon')}</span>
          <div className="emoji-grid">
            {EMOJIS.map((e) => (
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
          <span className="field__label">{t('form.name')}</span>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('form.namePlaceholder')}
            maxLength={40}
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
            min={1}
            max={365}
            step={1}
            value={intervalDays}
            onChange={(e) => setIntervalDays(e.target.value)}
            required
          />
        </label>

        <div className="modal__actions">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            {t('form.cancel')}
          </button>
          <button type="submit" className="btn btn--primary">
            {t('form.save')}
          </button>
        </div>
      </form>
    </div>
  );
}