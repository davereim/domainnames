import { NextRequest, NextResponse } from 'next/server';
import { db, ensureDB } from '@/lib/db';
import { names } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await ensureDB();
    const id = parseInt(params.id);
    const [name] = await db.select().from(names).where(eq(names.id, id));
    if (!name) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(name);
  } catch (error) {
    console.error('GET /api/names/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch name' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await ensureDB();
    const id = parseInt(params.id);
    const body = await request.json();

    const allowed = ['name', 'category', 'meaning', 'score', 'domainIdea', 'domainStatus', 'status', 'notes', 'riskNotes', 'rank'] as const;
    type AllowedKey = (typeof allowed)[number];

    const updateData: Partial<Record<AllowedKey, unknown>> = {};
    for (const key of allowed) {
      if (key in body) updateData[key] = body[key];
    }

    // Map camelCase keys to drizzle field names
    const drizzleUpdate: Record<string, unknown> = {};
    const keyMap: Record<string, string> = {
      domainIdea: 'domainIdea',
      domainStatus: 'domainStatus',
      riskNotes: 'riskNotes',
    };
    for (const [k, v] of Object.entries(updateData)) {
      drizzleUpdate[keyMap[k] ?? k] = v;
    }
    drizzleUpdate.updatedAt = new Date().toISOString();

    const [updated] = await db
      .update(names)
      .set(drizzleUpdate as Partial<typeof names.$inferInsert>)
      .where(eq(names.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error('PATCH /api/names/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update name' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await ensureDB();
    const id = parseInt(params.id);
    await db.delete(names).where(eq(names.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/names/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
