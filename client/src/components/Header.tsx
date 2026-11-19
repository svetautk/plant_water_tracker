import { useTranslation } from 'react-i18next';
import { LogOut, Plus } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import { useLogout } from '../hooks/useAuth';

interface Props {
  onAdd: () => void;
}

export default function Header({ onAdd }: Props) {
  const { t } = useTranslation();
  // Хук вызываем прямо здесь, а не передаём onLogout пропсом из App:
  // кеш TanStack Query доступен любому компоненту, "прокидывать" ничего не нужно.
  const logoutMutation = useLogout();

  return (
    <header className="header">
      <h1 className="header__logo">{t('header.title')}</h1>

      <div className="header__actions">
        <button type="button" className="btn btn--primary header__add" onClick={onAdd}>
          <Plus size={18} aria-hidden="true" />
          <span className="header__add-text">{t('header.addPlant')}</span>
        </button>
        <LanguageSwitcher />
        <button
          type="button"
          className="icon-btn"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
          title={t('header.logout')}
          aria-label={t('header.logout')}
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}
