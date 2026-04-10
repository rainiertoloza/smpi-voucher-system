import { NextResponse } from 'next/server';
import { dbDirect } from '@/lib/db-direct';

export async function POST(req: Request) {
  try {
    const { fullName, email, phone } = await req.json();

    if (!fullName || !email || !phone) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 });
    }

    const code = await dbDirect.createVoucher(fullName, email, phone);
    return NextResponse.json({ code });
  } catch (error: any) {
    console.error('Claim error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
