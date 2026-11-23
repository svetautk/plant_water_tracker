import { useTranslation } from 'react-i18next';
import { Navigate, Route, Routes } from 'react-router';
import AuthPage from './components/AuthPage';
import HomePage from './components/HomePage';
import { useMe } from './hooks/useAuth';

export default function App() {
  const { t } = useTranslation();
  const { data: user, isPending, isError } = useMe();

  if (isPending) {
    return <p className="status">{t('auth.loading')}</p>;
  }

  if (isError) {
    return (
      <div className="status">
        <p>{t('auth.errors.unknown')}</p>
        <p>{t('auth.reloadHint')}</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={user ? <HomePage /> : <Navigate to="/login" replace />} />

      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <AuthPage key="login" mode="login" />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/" replace /> : <AuthPage key="register" mode="register" />}
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
