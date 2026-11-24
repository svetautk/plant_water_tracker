import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

interface Props {
  title: string;
  children: ReactNode;
}

export default function AuthLayout({ title, children }: Props) {
  const { t } = useTranslation();

  return (
    <div className="auth">
      <div className="auth__lang">
        <LanguageSwitcher />
      </div>

      <div className="auth__card">
        <h1 className="auth__logo">{t('header.title')}</h1>
        <h2 className="modal__title">{title}</h2>
        {children}
      </div>
    </div>
  );
}
