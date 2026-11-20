import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cookieParser from 'cookie-parser';
import { requireAuth } from './middleware/requireAuth.js';
import { authRouter } from './routes/auth.js';
import { plantsRouter } from './routes/plants.js';
import { PORT } from './config.js';

const app = express();

app.use(express.json()); // читает JSON из тела запроса в req.body
app.use(cookieParser()); // читает заголовок Cookie в req.cookies

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

// Вход, регистрация, выход: открыты всем (/me защищает себя сама)
app.use('/api/auth', authRouter);

// Растения: только для вошедших
app.use('/api/plants', requireAuth, plantsRouter);

// Неизвестный адрес под /api: отвечаем ошибкой JSON, а не страницей сайта
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ---------- Собранный клиент ----------
// На хостинге работает одна программа: этот сервер отдаёт и API, и сам сайт.
// Папка client/dist появляется после `npm run build --workspace client`.
// Локально при разработке сайт отдаёт Vite, и этот блок не нужен.
const clientDist = fileURLToPath(new URL('../../client/dist', import.meta.url));

if (existsSync(clientDist)) {
  // Файлы как есть: index.html, JS, CSS, шрифты
  app.use(express.static(clientDist));

  // Любой другой адрес (/login, /register...) получает index.html,
  // а нужную страницу дальше показывает React Router в браузере.
  // Без этого обновление страницы на /login давало бы 404.
  app.get('/{*splat}', (_req, res) => {
    res.sendFile('index.html', { root: clientDist });
  });
}

app.listen(PORT, () => {
  console.log(`Server: http://localhost:${PORT}`);
});
