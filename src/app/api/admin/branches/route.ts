import { NextResponse } from 'next/server';
import { dbDirect } from '@/lib/db-direct';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const branches = await dbDirect.getBranches();
    return NextResponse.json(branches);
  } catch (error: any) {
    console.error('Branches error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
