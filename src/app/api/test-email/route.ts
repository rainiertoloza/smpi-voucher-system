import { NextResponse } from 'next/server';
import { sendVoucherEmail } from '@/lib/brevo';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    console.log('=== TEST EMAIL DEBUG ===');
    console.log('Environment variables:');
    console.log('- BREVO_API_KEY exists:', !!process.env.BREVO_API_KEY);
    console.log('- BREVO_API_KEY length:', process.env.BREVO_API_KEY?.length || 0);
    console.log('- BREVO_SENDER_EMAIL:', process.env.BREVO_SENDER_EMAIL);
    console.log('- Target email:', email);

    // Test email send
    const result = await sendVoucherEmail(
      email,
      'Test User',
      'SMPI-TEST123',
      'December 31, 2024'
    );

    console.log('Email sent result:', result);

    return NextResponse.json({ 
      success: true, 
      message: 'Test email sent successfully',
      messageId: result.messageId,
      debug: {
        apiKeyExists: !!process.env.BREVO_API_KEY,
        senderEmail: process.env.BREVO_SENDER_EMAIL,
        targetEmail: email
      }
    });
  } catch (error: any) {
    console.error('=== TEST EMAIL ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Full error:', error);
    
    return NextResponse.json({ 
      error: error.message || 'Failed to send test email',
      details: error.toString(),
      stack: error.stack
    }, { status: 500 });
  }
}
