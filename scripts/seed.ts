import { createClient } from '@libsql/client';
import path from 'path';

const dbPath = process.env.DATABASE_FILE ?? path.join(process.cwd(), 'data', 'naming.db');

const client = createClient({ url: `file:${dbPath}` });

const SEED_WORDS = [
  'Sense', 'Signal', 'Pulse', 'Clarity', 'Map', 'Graph', 'Link',
  'Steward', 'Control', 'Visibility', 'Intelligence', 'Context',
  'Memory', 'Trust', 'Insight', 'Foundation', 'Beacon', 'Compass',
  'Anchor', 'Layer', 'Core', 'Fabric', 'Thread', 'Weave', 'Orbit',
  'Nexus', 'Relay', 'Current', 'Source', 'Stack',
];

const EXAMPLE_NAMES = [
  { name: 'AssetIQ', category: 'Operations & Intelligence', meaning: 'Combines asset management with intelligence. The IQ suffix implies smart, automated insights into what your business owns.', score: 8.2, domainIdea: 'assetiq.com, getassetiq.com, assetiq.io', status: 'New', riskNotes: 'IQ suffix is common in SaaS naming — verify distinctiveness.' },
  { name: 'WiseOps', category: 'Operations & Intelligence', meaning: 'Wise operations — intelligent management and oversight of business systems and dependencies.', score: 7.8, domainIdea: 'wiseops.com, getwiseops.com, wiseops.io', status: 'New', riskNotes: 'Ops suffix is increasingly common in B2B SaaS.' },
  { name: 'MyAssetHQ', category: 'Operations & Intelligence', meaning: 'Personal headquarters for managing your digital assets. Positions the product as the central command center.', score: 6.5, domainIdea: 'myassethq.com, assethq.com', status: 'New', riskNotes: 'My prefix may feel too informal for business software.' },
  { name: 'StewOps', category: 'Trust & Stewardship', meaning: 'Stewardship + Operations. Responsible, careful management of business systems and digital assets.', score: 6.8, domainIdea: 'stewops.com, getstewops.com', status: 'New', riskNotes: 'Stew has informal connotations in everyday English.' },
  { name: 'SenseOps', category: 'Operations & Intelligence', meaning: 'Making sense of your operations. Clarity and awareness across all your business systems.', score: 7.5, domainIdea: 'senseops.com, getsenseops.com', status: 'New', riskNotes: 'Check trademark availability in the SaaS category.' },
  { name: 'Clarix', category: 'Invented Word', meaning: 'Derived from Clarity. The -ix suffix creates a modern, technical feel without losing the core meaning of clear understanding.', score: 8.5, domainIdea: 'clarix.com, getclarix.com, clarix.io', status: 'New', riskNotes: 'Verify trademark in the business software category.' },
  { name: 'Nexora', category: 'Invented Word', meaning: 'From Nexus (a connected hub) + -ora suffix. Evokes a central network of connected intelligence and visibility.', score: 8.7, domainIdea: 'nexora.com, getnexora.com', status: 'New', riskNotes: 'Check for existing brands in tech with similar phonetics.' },
  { name: 'Linkwise', category: 'Visibility & Clarity', meaning: 'Wise connections. Understanding the links between your business systems, dependencies, and assets.', score: 7.2, domainIdea: 'linkwise.com, getlinkwise.com', status: 'New', riskNotes: 'Wise suffix appears in several products — verify availability.' },
  { name: 'Dependra', category: 'Invented Word', meaning: 'From Dependency + -ra suffix. Visibility into what depends on what across your digital business.', score: 7.4, domainIdea: 'dependra.com, getdependra.com', status: 'New', riskNotes: 'May be read as a personal name (Devendra) in some markets.' },
  { name: 'Cendra', category: 'Invented Word', meaning: 'From Central + -dra. The central point of your digital operations — everything flows from here.', score: 7.6, domainIdea: 'cendra.com, getcendra.com', status: 'New', riskNotes: 'Similar to Kendra (personal name). Check for brand confusion.' },
  { name: 'Velora', category: 'Invented Word', meaning: 'Velocity + clarity combined into a single brand. Fast, clear business intelligence for modern teams.', score: 8.3, domainIdea: 'velora.com, getvelora.com', status: 'New', riskNotes: 'Very clean name — verify domain and trademark availability promptly.' },
  { name: 'Norava', category: 'Invented Word', meaning: 'From Nova (new, bright) + -rava. A fresh, luminous lens on your business landscape.', score: 7.9, domainIdea: 'norava.com, getnorava.com', status: 'New', riskNotes: 'Check for geographic name conflicts in European markets.' },
  { name: 'Syntra', category: 'Invented Word', meaning: 'Sync + -tra. Bringing all your business systems into alignment and harmony.', score: 8.4, domainIdea: 'syntra.com, getsyntra.com', status: 'New', riskNotes: 'Syntra is a registered brand in Belgium (vocational training). Verify.' },
  { name: 'Virelo', category: 'Invented Word', meaning: 'From Vireo (to see clearly, Latin) + -lo. A light, clear view of your entire digital business.', score: 8.1, domainIdea: 'virelo.com, getvirelo.com', status: 'New', riskNotes: 'No significant risk factors noted. Strong candidate.' },
  { name: 'Covara', category: 'Invented Word', meaning: 'Coverage + -vara. Complete visibility and coverage of your digital estate and assets.', score: 7.7, domainIdea: 'covara.com, getcovara.com', status: 'New', riskNotes: 'May draw associations with insurance/coverage industry.' },
];

async function main() {
  console.log('Creating tables...');
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

  console.log('Seeding seed words...');
  for (const word of SEED_WORDS) {
    await client.execute({
      sql: 'INSERT OR IGNORE INTO seed_words (word) VALUES (?)',
      args: [word],
    });
  }
  console.log(`Seeded ${SEED_WORDS.length} seed words`);

  console.log('Seeding example names...');
  for (const n of EXAMPLE_NAMES) {
    await client.execute({
      sql: `INSERT OR IGNORE INTO names
        (name, category, meaning, score, domain_idea, status, risk_notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [n.name, n.category, n.meaning, n.score, n.domainIdea, n.status, n.riskNotes],
    });
  }
  console.log(`Seeded ${EXAMPLE_NAMES.length} example names`);

  console.log('Done!');
  await client.close();
}

main().catch(console.error);
