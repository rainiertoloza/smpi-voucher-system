import { NextResponse } from 'next/server';
import { sendVoucherEmail } from '@/lib/brevo';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // Test email send
    await sendVoucherEmail(
      email,
      'Test User',
      'SMPI-TEST123',
      'December 31, 2024'
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Test email sent successfully' 
    });
  } catch (error: any) {
    console.error('Test email error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to send test email',
      details: error.toString()
    }, { status: 500 });
  }
}
