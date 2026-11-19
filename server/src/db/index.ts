import Database from 'better-sqlite3';
import { mkdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Пути строим относительно ЭТОГО файла, а не папки, из которой запущен сервер.
// Иначе при запуске из другой директории база создалась бы не там.
// В ESM нет __dirname, поэтому используем import.meta.url.
const dbPath = fileURLToPath(new URL('../../data/plants.db', import.meta.url));
const schemaPath = fileURLToPath(new URL('./schema.sql', import.meta.url));

mkdirSync(new URL('../../data', import.meta.url), { recursive: true });
// Если файла plants.db нет, SQLite создаст его сам.
export const db = new Database(dbPath);

// По умолчанию SQLite НЕ проверяет внешние ключи (user_id -> users.id).
// Без этой строки ON DELETE CASCADE и REFERENCES не работали бы.
db.pragma('foreign_keys = ON');

// Читаем schema.sql и выполняем. exec запускает сразу несколько SQL-команд.
db.exec(readFileSync(schemaPath, 'utf-8'));
