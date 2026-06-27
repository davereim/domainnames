import { NextRequest, NextResponse } from 'next/server';
import { db, ensureDB } from '@/lib/db';
import { names } from '@/lib/schema';
import { eq, asc, desc } from 'drizzle-orm';

function escapeCSV(value: string | null | undefined | number): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(request: NextRequest) {
  try {
    await ensureDB();
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status') || 'Shortlist';

    const rows = await db
      .select()
      .from(names)
      .where(statusFilter === 'all' ? undefined : eq(names.status, statusFilter))
      .orderBy(asc(names.rank), desc(names.score));

    const headers = ['Rank', 'Name', 'Category', 'Score', 'Status', 'Domain Idea', 'Domain Status', 'Meaning', 'Risk Notes', 'Notes', 'Created'];

    const csvRows = rows.map((n) => [
      escapeCSV(n.rank),
      escapeCSV(n.name),
      escapeCSV(n.category),
      escapeCSV(n.score.toFixed(1)),
      escapeCSV(n.status),
      escapeCSV(n.domainIdea),
      escapeCSV(n.domainStatus),
      escapeCSV(n.meaning),
      escapeCSV(n.riskNotes),
      escapeCSV(n.notes),
      escapeCSV(n.createdAt ? new Date(n.createdAt).toLocaleDateString() : ''),
    ].join(','));

    const csv = [headers.join(','), ...csvRows].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="names-export-${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
