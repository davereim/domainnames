import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';
import path from 'path';

function makeClient() {
  // Turso cloud database — used on Vercel and any production deployment
  if (process.env.TURSO_DATABASE_URL) {
    return createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN ?? '',
    });
  }
  // Local SQLite file — used for local development
  const dbPath = process.env.DATABASE_FILE ?? path.join(process.cwd(), 'data', 'naming.db');
  return createClient({ url: `file:${dbPath}` });
}

const client = makeClient();
export const db = drizzle(client, { schema });

let initialized = false;

export async function ensureDB() {
  if (initialized) return;

  // Create tables (safe to run multiple times with IF NOT EXISTS)
  for (const stmt of [
    `CREATE TABLE IF NOT EXISTS names (
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
    )`,
    `CREATE TABLE IF NOT EXISTS seed_words (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      word TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
  ]) {
    await client.execute(stmt);
  }

  // Auto-seed if the database is empty (first deploy)
  const { rows } = await client.execute('SELECT COUNT(*) as count FROM names');
  if (Number(rows[0].count) === 0) {
    await autoSeed();
  }

  initialized = true;
}

async function autoSeed() {
  const { SEED_WORDS, EXAMPLE_NAMES } = await import('./seedData');

  for (const word of SEED_WORDS) {
    await client.execute({
      sql: 'INSERT OR IGNORE INTO seed_words (word) VALUES (?)',
      args: [word],
    });
  }

  for (const n of EXAMPLE_NAMES) {
    await client.execute({
      sql: `INSERT OR IGNORE INTO names
        (name, category, meaning, score, domain_idea, status, risk_notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [n.name, n.category, n.meaning, n.score, n.domainIdea, n.status, n.riskNotes],
    });
  }
}
