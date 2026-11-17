import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const isRu = i18n.language === 'ru';

  return (
    <button
      type="button"
      className="btn btn--ghost lang"
      onClick={() => i18n.changeLanguage(isRu ? 'en' : 'ru')}
      aria-label="Switch language"
    >
      {isRu ? 'RU' : 'EN'}
    </button>
  );
}