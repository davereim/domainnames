import { NextRequest, NextResponse } from 'next/server';
import { db, ensureDB } from '@/lib/db';
import { names } from '@/lib/schema';
import { eq, like, or, and, gte, lte, asc, desc, inArray, count, SQL } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    await ensureDB();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const statusFilter = searchParams.get('status') || '';
    const categoryFilter = searchParams.get('category') || '';
    const minScore = parseFloat(searchParams.get('minScore') || '0');
    const maxScore = parseFloat(searchParams.get('maxScore') || '10');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortDir = searchParams.get('sortDir') || 'desc';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const pageSize = Math.min(200, parseInt(searchParams.get('pageSize') || '50'));

    const conditions: SQL[] = [
      gte(names.score, minScore),
      lte(names.score, maxScore),
    ];

    if (search) {
      conditions.push(
        or(
          like(names.name, `%${search}%`),
          like(names.meaning, `%${search}%`),
          like(names.notes, `%${search}%`)
        ) as SQL
      );
    }
    if (statusFilter) conditions.push(eq(names.status, statusFilter));
    if (categoryFilter) conditions.push(eq(names.category, categoryFilter));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const colMap: Record<string, any> = {
      name: names.name,
      score: names.score,
      status: names.status,
      category: names.category,
      createdAt: names.createdAt,
      rank: names.rank,
    };
    const col = colMap[sortBy] ?? names.createdAt;
    const orderBy = sortDir === 'asc' ? asc(col) : desc(col);

    const [rows, [{ total }]] = await Promise.all([
      db.select().from(names).where(where).orderBy(orderBy).limit(pageSize).offset((page - 1) * pageSize),
      db.select({ total: count() }).from(names).where(where),
    ]);

    return NextResponse.json({ names: rows, total, page, pageSize });
  } catch (error) {
    console.error('GET /api/names error:', error);
    return NextResponse.json({ error: 'Failed to fetch names' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureDB();
    const body = await request.json();
    const { name, category, meaning, score, domainIdea, riskNotes, status } = body;

    if (!name || !category || !meaning || score === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const [created] = await db.insert(names).values({
      name,
      category,
      meaning,
      score,
      domainIdea: domainIdea || null,
      riskNotes: riskNotes || null,
      status: status || 'New',
    }).returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error: unknown) {
    const e = error as { message?: string };
    if (e?.message?.includes('UNIQUE constraint')) {
      return NextResponse.json({ error: 'Name already exists' }, { status: 409 });
    }
    console.error('POST /api/names error:', error);
    return NextResponse.json({ error: 'Failed to create name' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await ensureDB();
    const body = await request.json();
    const { ids } = body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'ids array required' }, { status: 400 });
    }
    await db.delete(names).where(inArray(names.id, ids));
    return NextResponse.json({ deleted: ids.length });
  } catch (error) {
    console.error('DELETE /api/names error:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
