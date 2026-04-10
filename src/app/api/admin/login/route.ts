import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { dbDirect } from '@/lib/db-direct';
import { createSession } from '@/lib/session';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    
    const admin = await dbDirect.getAdmin(username);
    
    if (!admin || !await bcrypt.compare(password, (admin as any).password)) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    await createSession(username);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
