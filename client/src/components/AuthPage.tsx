import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiError } from '../api/client';
import { useLogin, useRegister } from '../hooks/useAuth';
import LanguageSwitcher from './LanguageSwitcher';
// Те же ограничения проверяет сервер: оба берут их из shared/limits.ts.
// Клиентская проверка нужна для удобства: подсказать сразу, не дожидаясь сервера.
// Защиту она не даёт, её даёт только серверная проверка.
import { EMAIL_MAX, PASSWORD_MAX, PASSWORD_MIN } from '../config';

type Mode = 'login' | 'register';

export default function AuthPage() {
  const { t } = useTranslation();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // Показывать ли ошибку "пароли не совпадают". Пока человек не закончил ввод,
  // ругаться рано: после первой же буквы пароли, конечно, "не совпадают".
  // Поэтому включаем показ, когда поле теряет фокус (onBlur) или при отправке формы.
  const [confirmTouched, setConfirmTouched] = useState(false);

  const loginMutation = useLogin();
  const registerMutation = useRegister();
  // Работаем с той мутацией, которая соответствует текущему режиму
  const mutation = mode === 'login' ? loginMutation : registerMutation;

  // Превращаем ошибку сервера в понятный пользователю текст.
  // Для этого мы и добавляли status в ApiError.
  const errorText = (() => {
    const error = mutation.error;
    if (!error) return null;
    if (error instanceof ApiError) {
      if (error.status === 401) return t('auth.errors.wrongCredentials');
      if (error.status === 409) return t('auth.errors.emailTaken');
      if (error.status === 400) return t('auth.errors.invalid');
    }
    // Сеть упала или сервер не запущен
    return t('auth.errors.unknown');
  })();

  const isLogin = mode === 'login';

  // Не храним "совпадают ли пароли" в отдельном useState: это значение
  // ВЫЧИСЛЯЕТСЯ из двух других состояний. Отдельное состояние пришлось бы
  // вручную синхронизировать, и рано или поздно оно бы разъехалось с реальностью.
  const passwordsMatch = password === confirmPassword;
  const showMismatch = !isLogin && confirmTouched && !passwordsMatch;

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setConfirmPassword('');
    setConfirmTouched(false);
    // Сбрасываем старую ошибку, чтобы "неверный пароль" не висел на форме регистрации
    loginMutation.reset();
    registerMutation.reset();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // без этого браузер перезагрузил бы страницу

    // Подтверждение пароля проверяем ТОЛЬКО на клиенте и на сервер не отправляем.
    // Это защита от опечатки самого пользователя, а не от злоумышленника:
    // серверу важен только сам пароль.
    if (!isLogin && !passwordsMatch) {
      setConfirmTouched(true); // показать ошибку, даже если поле ещё не теряло фокус
      return;
    }

    // Дальше всё делает хук: запрос, а при успехе запись пользователя в кеш.
    // App увидит пользователя и сам покажет главный экран.
    mutation.mutate({ email: email.trim(), password });
  };

  return (
    <div className="auth">
      <div className="auth__lang">
        <LanguageSwitcher />
      </div>

      <form className="auth__card" onSubmit={handleSubmit}>
        <h1 className="auth__logo">{t('header.title')}</h1>
        <h2 className="modal__title">{isLogin ? t('auth.loginTitle') : t('auth.registerTitle')}</h2>

        <label className="field">
          <span className="field__label">{t('auth.email')}</span>
          <input
            className="input"
            type="email" // браузер сам проверит формат и покажет нужную клавиатуру на телефоне
            autoComplete="email" // менеджер паролей поймёт, что сюда подставлять
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
            // current-password: подставить сохранённый пароль;
            // new-password: предложить сгенерировать новый
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            // Минимальную длину проверяем только при регистрации:
            // при входе ошибку "неверный пароль" и так скажет сервер
            minLength={isLogin ? undefined : PASSWORD_MIN}
            maxLength={PASSWORD_MAX}
            required
          />
          {!isLogin && <span className="field__hint">{t('auth.passwordHint', { count: PASSWORD_MIN })}</span>}
        </label>

        {/* Поле есть только при регистрации: при входе подтверждать нечего */}
        {!isLogin && (
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
              // aria-invalid и aria-describedby: экранная читалка скажет,
              // что поле с ошибкой, и прочитает текст ошибки
              aria-invalid={showMismatch}
              aria-describedby={showMismatch ? 'confirm-error' : undefined}
            />
            {showMismatch && (
              <span id="confirm-error" className="field__hint field__hint--error">
                {t('auth.errors.passwordMismatch')}
              </span>
            )}
          </label>
        )}

        {/* role="alert": экранная читалка сразу озвучит ошибку */}
        {errorText && (
          <p className="auth__error" role="alert">
            {errorText}
          </p>
        )}

        <button
          type="submit"
          className="btn btn--primary btn--block"
          // Пока запрос идёт, кнопка неактивна, чтобы не отправить форму дважды
          disabled={mutation.isPending}
        >
          {mutation.isPending ? t('auth.loading') : isLogin ? t('auth.login') : t('auth.register')}
        </button>

        <p className="auth__switch">
          {isLogin ? t('auth.noAccount') : t('auth.haveAccount')}{' '}
          <button type="button" className="link-btn" onClick={switchMode}>
            {isLogin ? t('auth.toRegister') : t('auth.toLogin')}
          </button>
        </p>
      </form>
    </div>
  );
}
