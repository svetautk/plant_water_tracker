import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

interface Props {
  onAdd: () => void;
}

export default function Header({ onAdd }: Props) {
  const { t } = useTranslation();

  return (
    <header className="header">
      <h1 className="header__logo">{t('header.title')}</h1>

      <div className="header__actions">
        <button type="button" className="btn btn--primary header__add" onClick={onAdd}>
          <Plus size={18} aria-hidden="true" />
          <span className="header__add-text">{t('header.addPlant')}</span>
        </button>
        <LanguageSwitcher />
      </div>
    </header>
  );
}