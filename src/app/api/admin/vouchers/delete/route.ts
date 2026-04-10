import { NextResponse } from 'next/server';
import { dbDirect } from '@/lib/db-direct';
import { getSession } from '@/lib/session';

export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const voucherId = searchParams.get('id');

    if (!voucherId) {
      return NextResponse.json({ error: 'Voucher ID required' }, { status: 400 });
    }

    await dbDirect.deleteVoucher(voucherId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Voucher DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
