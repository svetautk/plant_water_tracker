import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { ApiError } from '../api/client';
import { useLogin } from '../hooks/useAuth';
import AuthLayout from './AuthLayout';
import { EMAIL_MAX, PASSWORD_MAX } from '../config';

export default function LoginPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const loginMutation = useLogin();

  const errorText = (() => {
    const error = loginMutation.error;
    if (!error) return null;
    if (error instanceof ApiError && error.status === 401) return t('auth.errors.wrongCredentials');
    return t('auth.errors.unknown');
  })();

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <AuthLayout title={t('auth.loginTitle')}>
      <form onSubmit={handleSubmit}>
        <label className="field">
          <span className="field__label">{t('auth.email')}</span>
          <input
            className="input"
            type="email"
            autoComplete="email"
            maxLength={EMAIL_MAX}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
        </label>

        <label className="field">
          <span className="field__label">{t('auth.password')}</span>
          <input
            className="input"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            maxLength={PASSWORD_MAX}
            required
          />
        </label>

        {errorText && (
          <p className="auth__error" role="alert">
            {errorText}
          </p>
        )}

        <button
          type="submit"
          className="btn btn--primary btn--block"
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? t('auth.loading') : t('auth.login')}
        </button>

        <p className="auth__switch">
          {t('auth.noAccount')}{' '}
          <Link to="/register" className="link-btn">
            {t('auth.toRegister')}
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
