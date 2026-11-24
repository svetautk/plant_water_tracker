import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { ApiError } from '../api/client';
import { useRegister } from '../hooks/useAuth';
import AuthLayout from './AuthLayout';
import { EMAIL_MAX, PASSWORD_MAX, PASSWORD_MIN } from '../config';

export default function RegisterPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmTouched, setConfirmTouched] = useState(false);

  const registerMutation = useRegister();

  const errorText = (() => {
    const error = registerMutation.error;
    if (!error) return null;
    if (error instanceof ApiError) {
      if (error.status === 409) return t('auth.errors.emailTaken');
      if (error.status === 400) return t('auth.errors.invalid');
    }
    return t('auth.errors.unknown');
  })();

  const passwordsMatch = password === confirmPassword;
  const showMismatch = confirmTouched && !passwordsMatch;

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!passwordsMatch) {
      setConfirmTouched(true);
      return;
    }
    registerMutation.mutate({ email, password });
  };

  return (
    <AuthLayout title={t('auth.registerTitle')}>
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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={PASSWORD_MIN}
            maxLength={PASSWORD_MAX}
            required
          />
          <span className="field__hint">{t('auth.passwordHint', { count: PASSWORD_MIN })}</span>
        </label>

        <label className="field">
          <span className="field__label">{t('auth.confirmPassword')}</span>
          <input
            className={`input ${showMismatch ? 'input--limit' : ''}`}
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onBlur={() => setConfirmTouched(true)}
            maxLength={PASSWORD_MAX}
            required
            aria-invalid={showMismatch}
            aria-describedby={showMismatch ? 'confirm-error' : undefined}
          />
          {showMismatch && (
            <span id="confirm-error" className="field__hint field__hint--error">
              {t('auth.errors.passwordMismatch')}
            </span>
          )}
        </label>

        {errorText && (
          <p className="auth__error" role="alert">
            {errorText}
          </p>
        )}

        <button
          type="submit"
          className="btn btn--primary btn--block"
          disabled={registerMutation.isPending}
        >
          {registerMutation.isPending ? t('auth.loading') : t('auth.register')}
        </button>

        <p className="auth__switch">
          {t('auth.haveAccount')}{' '}
          <Link to="/login" className="link-btn">
            {t('auth.toLogin')}
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
