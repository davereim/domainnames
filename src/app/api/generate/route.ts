import { NextRequest, NextResponse } from 'next/server';
import { generateNames } from '@/lib/nameGenerator';
import type { NamingStyle } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { themeWords, style, count } = body;

    if (!themeWords || !Array.isArray(themeWords) || themeWords.length === 0) {
      return NextResponse.json({ error: 'themeWords array required' }, { status: 400 });
    }

    const validStyles: NamingStyle[] = [
      'invented', 'trust', 'visibility', 'operations', 'modern', 'biblical',
    ];

    if (!style || !validStyles.includes(style)) {
      return NextResponse.json({ error: 'Invalid style' }, { status: 400 });
    }

    const requestedCount = Math.min(Math.max(parseInt(count) || 30, 1), 500);
    const names = generateNames(themeWords, style as NamingStyle, requestedCount);

    return NextResponse.json({ names, generated: names.length });
  } catch (error) {
    console.error('POST /api/generate error:', error);
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}
