import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ru from './locales/ru.json';

const LANG_KEY = 'plant-tracker:lang';

const getInitialLang = (): 'ru' | 'en' => {
  const saved = localStorage.getItem(LANG_KEY);
  if (saved === 'ru' || saved === 'en') return saved;
  if (navigator.language.toLowerCase().startsWith('ru')) return 'ru';
  return 'en';
};

const initial = getInitialLang();

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ru: { translation: ru },
  },
  lng: initial,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

document.documentElement.lang = initial;

i18n.on('languageChanged', (lng) => {
  localStorage.setItem(LANG_KEY, lng);
  document.documentElement.lang = lng;
});