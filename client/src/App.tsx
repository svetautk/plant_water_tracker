import { useTranslation } from 'react-i18next';
import { Navigate, Route, Routes } from 'react-router';
import AuthPage from './components/AuthPage';
import HomePage from './components/HomePage';
import { useMe } from './hooks/useAuth';

// App работает как "охранник" (auth guard): спрашивает сервер, кто вошёл,
// и вместе с адресом в браузере решает, какой экран показать.
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

  // 3. Ответ есть: выбираем экран по адресу.
  // Routes смотрит на текущий адрес и показывает element того Route, чей path совпал.
  // <Navigate to="..." replace /> сразу переводит на другой адрес.
  // replace: заменить текущую запись в истории браузера, а не добавить новую,
  // иначе кнопка «Назад» возвращала бы на адрес, с которого нас тут же снова перекинет.
  return (
    <Routes>
      {/* Главная только для вошедших, остальных отправляем на вход */}
      <Route path="/" element={user ? <HomePage /> : <Navigate to="/login" replace />} />

      {/* Вход и регистрация только для НЕ вошедших. Поэтому после успешного входа
          экран переключается сам: useLogin записывает пользователя в кеш,
          App перерисовывается, user уже есть, и Navigate уводит на главную.
          key: при переходе /login <-> /register React создаёт форму заново,
          и поля, ошибки и запросы сбрасываются (см. пояснение в AuthPage). */}
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <AuthPage key="login" mode="login" />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/" replace /> : <AuthPage key="register" mode="register" />}
      />

      {/* path="*" значит «любой другой адрес»: например, /abc уводим на главную */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
