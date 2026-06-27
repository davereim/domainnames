import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { db, ensureDB } from '@/lib/db';
import { names } from '@/lib/schema';
import { eq, avg, desc, count } from 'drizzle-orm';

export async function GET() {
  try {
    await ensureDB();

    const [
      [{ total }],
      [{ shortlisted }],
      [{ liked }],
      [{ rejected }],
      [{ avgScore }],
      recent,
    ] = await Promise.all([
      db.select({ total: count() }).from(names),
      db.select({ shortlisted: count() }).from(names).where(eq(names.status, 'Shortlist')),
      db.select({ liked: count() }).from(names).where(eq(names.status, 'Like')),
      db.select({ rejected: count() }).from(names).where(eq(names.status, 'Reject')),
      db.select({ avgScore: avg(names.score) }).from(names),
      db.select().from(names).orderBy(desc(names.createdAt)).limit(8),
    ]);

    return NextResponse.json({
      total,
      shortlisted,
      liked,
      rejected,
      averageScore: avgScore ? Math.round(parseFloat(String(avgScore)) * 10) / 10 : 0,
      recent,
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 });
  }
}
