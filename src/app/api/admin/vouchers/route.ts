import { NextResponse } from 'next/server';
import { dbDirect } from '@/lib/db-direct';
import { getSession } from '@/lib/session';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const vouchers = await dbDirect.getVouchers();
    return NextResponse.json(vouchers);
  } catch (error: any) {
    console.error('Vouchers GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { code, branchId } = await req.json();
    dbDirect.redeemVoucher(code, branchId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Vouchers POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
