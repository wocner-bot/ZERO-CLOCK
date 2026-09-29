import {DatabaseSync, type SQLInputValue} from 'node:sqlite';
import {mkdirSync} from 'node:fs';
import {dirname, resolve} from 'node:path';

// Matches the D1 operations used by the news route; both runtimes keep the same SQL.
class PreparedQuery {
  private database: DatabaseSync;
  private sql: string;
  private values: SQLInputValue[];
  constructor(database: DatabaseSync, sql: string, values: SQLInputValue[] = []) {
    this.database = database;
    this.sql = sql;
    this.values = values;
  }
  bind(...values: SQLInputValue[]) {
    return new PreparedQuery(this.database, this.sql, values);
  }
  async all<T>() {
    return {results: this.database.prepare(this.sql).all(...this.values) as T[]};
  }
  execute() {
    const result = this.database.prepare(this.sql).run(...this.values);
    return {meta: {changes: Number(result.changes)}};
  }
  async run() {
    return this.execute();
  }
}

export function openDatabase(path: string) {
  if (path !== ':memory:') mkdirSync(dirname(path), {recursive: true});
  const database = new DatabaseSync(path);
  database.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA busy_timeout = 5000;
    CREATE TABLE IF NOT EXISTS feeds (id TEXT PRIMARY KEY NOT NULL, checked TEXT NOT NULL, status TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS news (id TEXT PRIMARY KEY NOT NULL, payload TEXT NOT NULL);
  `);
  return {
    prepare(sql: string) { return new PreparedQuery(database, sql); },
    async batch(queries: PreparedQuery[]) {
      database.exec('BEGIN IMMEDIATE');
      try {
        const results = queries.map(query => query.execute());
        database.exec('COMMIT');
        return results;
      } catch (error) {
        database.exec('ROLLBACK');
        throw error;
      }
    },
    close() { database.close(); },
  };
}

let connection: ReturnType<typeof openDatabase> | undefined;
export function db() {
  connection ??= openDatabase(process.env.DATABASE_PATH || resolve('.data/news.sqlite'));
  return connection;
}
