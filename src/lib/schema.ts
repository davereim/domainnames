import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const names = sqliteTable('names', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  category: text('category').notNull(),
  meaning: text('meaning').notNull(),
  score: real('score').notNull(),
  domainIdea: text('domain_idea'),
  domainStatus: text('domain_status').notNull().default('Unknown'),
  status: text('status').notNull().default('New'),
  notes: text('notes'),
  riskNotes: text('risk_notes'),
  rank: integer('rank'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
});

export const seedWords = sqliteTable('seed_words', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  word: text('word').notNull().unique(),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
});

export type Name = typeof names.$inferSelect;
export type NewName = typeof names.$inferInsert;
export type SeedWord = typeof seedWords.$inferSelect;
