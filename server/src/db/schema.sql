-- IF NOT EXISTS: файл выполняется при каждом запуске сервера,
-- и уже существующие таблицы не пересоздаются и не теряют данные.

CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,  -- номер пользователя, база выдаёт сама
  email         TEXT NOT NULL UNIQUE,               -- UNIQUE: два одинаковых email не получится
  password_hash TEXT NOT NULL,                      -- сам пароль не храним, только хеш
  created_at    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS plants (
  id            TEXT PRIMARY KEY,                   -- UUID, создаёт сервер
  user_id       INTEGER NOT NULL
                REFERENCES users(id) ON DELETE CASCADE,  -- чьё растение; удалили пользователя, удалились и растения
  emoji         TEXT NOT NULL,
  name          TEXT NOT NULL,
  last_watered  TEXT NOT NULL,                      -- 'YYYY-MM-DD'
  interval_days INTEGER NOT NULL
                CHECK (interval_days BETWEEN 1 AND 365)  -- база сама отвергнет неправильное значение
);

-- Индекс ускоряет запрос «все растения пользователя». Пока их мало, это почти незаметно,
-- но при росте данных запрос без индекса перебирал бы всю таблицу.
CREATE INDEX IF NOT EXISTS idx_plants_user_id ON plants(user_id);

-- Таблица сессий понадобится на шаге 5, создаём сразу, чтобы потом не менять схему.
CREATE TABLE IF NOT EXISTS sessions (
  id         TEXT PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL
);