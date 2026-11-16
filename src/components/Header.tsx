import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

interface Props {
  onAdd: () => void;
}

export default function Header({ onAdd }: Props) {
  const { t } = useTranslation();

  return (
    <header className="header">
      <h1 className="header__logo">🪴 {t('header.title')}</h1>
      <div className="header__actions">
        <LanguageSwitcher />
        <button type="button" className="btn btn--primary" onClick={onAdd}>
          + <span className="header__add-text">{t('header.addPlant')}</span>
        </button>
      </div>
    </header>
  );
}