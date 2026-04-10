import { NextResponse } from 'next/server';
import { dbDirect } from '@/lib/db-direct';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const analytics = await dbDirect.getAnalytics();
    return NextResponse.json(analytics);
  } catch (error: any) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
