import * as SQLite from 'expo-sqlite';
let database: Promise<SQLite.SQLiteDatabase> | undefined;
async function db() {
  if (!database) database = SQLite.openDatabaseAsync('ai-learning.db').then(async d => {
    await d.execAsync('CREATE TABLE IF NOT EXISTS learning_state (id INTEGER PRIMARY KEY, value TEXT NOT NULL)');
    return d;
  });
  return database;
}
export async function readStored(): Promise<string | null> { return (await (await db()).getFirstAsync<{ value: string }>('SELECT value FROM learning_state WHERE id = 1'))?.value ?? null; }
export async function writeStored(value: string) { await (await db()).runAsync('INSERT INTO learning_state (id, value) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET value = excluded.value', value); }
