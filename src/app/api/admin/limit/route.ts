import { NextResponse } from 'next/server';
import { dbDirect } from '@/lib/db-direct';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const limit = await dbDirect.getVoucherLimit();
    return NextResponse.json(limit || { maxVouchers: 0, currentCount: 0 });
  } catch (error: any) {
    console.error('Limit GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { maxVouchers } = await req.json();
    
    if (!maxVouchers || maxVouchers < 0) {
      return NextResponse.json({ error: 'Invalid limit' }, { status: 400 });
    }

    dbDirect.setVoucherLimit(maxVouchers);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Limit POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
