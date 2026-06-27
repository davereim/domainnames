import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';
import path from 'path';

const dbPath = process.env.DATABASE_FILE ?? path.join(process.cwd(), 'data', 'naming.db');

const client = createClient({
  url: `file:${dbPath}`,
});

export const db = drizzle(client, { schema });

// Ensure tables exist on cold start
let initialized = false;
export async function ensureDB() {
  if (initialized) return;
  await client.executeMultiple(`
    CREATE TABLE IF NOT EXISTS names (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL,
      meaning TEXT NOT NULL,
      score REAL NOT NULL,
      domain_idea TEXT,
      domain_status TEXT NOT NULL DEFAULT 'Unknown',
      status TEXT NOT NULL DEFAULT 'New',
      notes TEXT,
      risk_notes TEXT,
      rank INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS seed_words (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      word TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  initialized = true;
}
