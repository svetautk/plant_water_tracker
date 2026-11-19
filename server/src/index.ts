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

app.listen(PORT, () => {
  console.log(`Server: http://localhost:${PORT}`);
});