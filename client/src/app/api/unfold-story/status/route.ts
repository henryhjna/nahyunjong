import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    if (!year || !month) {
      return NextResponse.json(
        { error: 'Year and month are required' },
        { status: 400 }
      );
    }

    const statusFile = path.join(
      process.cwd(),
      'src',
      'data',
      'unfold-story',
      `generation-status-${year}-${month.padStart(2, '0')}.json`
    );

    try {
      const content = await fs.readFile(statusFile, 'utf-8');
      const status = JSON.parse(content);
      return NextResponse.json(status);
    } catch (error) {
      // Status file doesn't exist (not generating or already complete)
      return NextResponse.json({ status: 'idle' });
    }
  } catch (error) {
    console.error('Failed to get generation status:', error);
    return NextResponse.json(
      { error: 'Failed to get status' },
      { status: 500 }
    );
  }
}
