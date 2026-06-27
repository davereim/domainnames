import { createClient } from '@libsql/client';
import path from 'path';
import { SEED_WORDS, EXAMPLE_NAMES } from '../src/lib/seedData';

const dbPath = process.env.DATABASE_FILE ?? path.join(process.cwd(), 'data', 'naming.db');
const client = createClient({ url: `file:${dbPath}` });

async function main() {
  console.log('Creating tables...');
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

  for (const word of SEED_WORDS) {
    await client.execute({ sql: 'INSERT OR IGNORE INTO seed_words (word) VALUES (?)', args: [word] });
  }
  console.log(`Seeded ${SEED_WORDS.length} seed words`);

  for (const n of EXAMPLE_NAMES) {
    await client.execute({
      sql: `INSERT OR IGNORE INTO names (name, category, meaning, score, domain_idea, status, risk_notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [n.name, n.category, n.meaning, n.score, n.domainIdea, n.status, n.riskNotes],
    });
  }
  console.log(`Seeded ${EXAMPLE_NAMES.length} example names`);

  console.log('Done!');
  await client.close();
}

main().catch(console.error);
