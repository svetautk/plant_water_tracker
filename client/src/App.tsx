import { useTranslation } from 'react-i18next';
import AuthPage from './components/AuthPage';
import HomePage from './components/HomePage';
import { useMe } from './hooks/useAuth';

// App теперь работает как "охранник" (auth guard): спрашивает сервер, кто вошёл,
// и в зависимости от ответа показывает нужный экран.
export default function App() {
  const { t } = useTranslation();
  const { data: user, isPending, isError, refetch } = useMe();

  // 1. Ответа ещё нет. Не показываем ни вход, ни главный экран,
  //    иначе вошедший пользователь на долю секунды увидел бы форму входа ("мигание").
  if (isPending) {
    return <p className="status">{t('auth.loading')}</p>;
  }

  // 2. Запрос упал не из-за 401 (401 fetchMe превращает в null),
  //    а например потому, что сервер не запущен.
  if (isError) {
    return (
      <div className="status">
        <p>{t('auth.errors.unknown')}</p>
        <button type="button" className="btn btn--ghost" onClick={() => refetch()}>
          {t('auth.retry')}
        </button>
      </div>
    );
  }

  // 3. Никто не вошёл.
  if (!user) return <AuthPage />;

  // 4. Пользователь есть.
  return <HomePage />;
}
