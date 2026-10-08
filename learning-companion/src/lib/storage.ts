import * as SQLite from 'expo-sqlite';
let database: Promise<SQLite.SQLiteDatabase> | undefined;
async function db() {
  if (!database) database = SQLite.openDatabaseAsync('ai-learning.db').then(async d => {
    await d.execAsync('CREATE TABLE IF NOT EXISTS learning_state (id INTEGER PRIMARY KEY, value TEXT NOT NULL)');
    await d.execAsync('CREATE TABLE IF NOT EXISTS account_notebooks (scope TEXT PRIMARY KEY, value TEXT NOT NULL)');
    return d;
  });
  return database;
}
export async function readStored(scope='guest'): Promise<string | null> { return (scope==='guest' ? await (await db()).getFirstAsync<{value:string}>('SELECT value FROM learning_state WHERE id = 1') : await (await db()).getFirstAsync<{value:string}>('SELECT value FROM account_notebooks WHERE scope = ?',scope))?.value ?? null; }
export async function writeStored(value: string,scope='guest') { if(scope==='guest')await (await db()).runAsync('INSERT INTO learning_state (id, value) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET value = excluded.value', value); else await (await db()).runAsync('INSERT INTO account_notebooks (scope,value) VALUES (?,?) ON CONFLICT(scope) DO UPDATE SET value=excluded.value',scope,value); }
