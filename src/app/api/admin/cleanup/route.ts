import { NextResponse } from 'next/server';
import { dbDirect } from '@/lib/db-direct';
import { getSession } from '@/lib/session';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { monthsAgo } = await req.json();
    
    if (!monthsAgo || monthsAgo < 1) {
      return NextResponse.json({ error: 'Invalid months value' }, { status: 400 });
    }

    const result = dbDirect.cleanupOldData(monthsAgo);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Cleanup error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
