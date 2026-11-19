import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router';
import './i18n';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/fraunces/500.css';
import './index.css';
import App from './App';

// QueryClient хранит кеш: результаты всех запросов по их ключам (queryKey).
// Создаём ОДИН раз, вне компонента: если создать внутри, кеш сбрасывался бы при каждом рендере.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // По умолчанию упавший запрос повторяется 3 раза. Для 401 ("не вошёл")
      // это бессмысленно, поэтому повторяем один раз и только не при 4xx.
      retry: (failureCount, error) => {
        const status = (error as { status?: number }).status;
        if (status && status >= 400 && status < 500) return false;
        return failureCount < 1;
      },
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Provider кладёт queryClient в контекст React, и любой компонент
        внутри может вызвать useQuery / useMutation */}
    <QueryClientProvider client={queryClient}>
      {/* BrowserRouter следит за адресом в браузере (/login, /register, /)
          и сообщает его компонентам внутри: Routes, Link, Navigate */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
