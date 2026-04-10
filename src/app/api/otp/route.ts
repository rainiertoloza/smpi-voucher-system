import { NextResponse } from 'next/server';

const otpStore = new Map<string, { code: string; expires: number }>();

async function sendSMS(phone: string, message: string) {
  // Semaphore SMS API
  const apiKey = process.env.SEMAPHORE_API_KEY;
  
  if (!apiKey) {
    console.log('SMS not configured. OTP:', message);
    return { success: true };
  }

  try {
    const response = await fetch('https://api.semaphore.co/api/v4/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        apikey: apiKey,
        number: phone,
        message: message,
        sendername: 'SMPI'
      })
    });

    const data = await response.json();
    return { success: response.ok, data };
  } catch (error) {
    console.error('SMS send error:', error);
    return { success: false, error };
  }
}

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();

    if (!phone || !phone.match(/^09\d{9}$/)) {
      return NextResponse.json({ error: 'Invalid Philippine phone number' }, { status: 400 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 5 * 60 * 1000; // 5 minutes

    otpStore.set(phone, { code: otp, expires });

    const message = `Your SMPI verification code is: ${otp}. Valid for 5 minutes.`;
    const smsResult = await sendSMS(phone, message);

    console.log(`OTP for ${phone}: ${otp}`);

    if (!smsResult.success && process.env.SEMAPHORE_API_KEY) {
      return NextResponse.json({ error: 'Failed to send SMS' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'OTP sent successfully',
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });
  } catch (error: any) {
    console.error('OTP send error:', error);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { phone, otp } = await req.json();

    if (!phone || !otp) {
      return NextResponse.json({ error: 'Phone and OTP required' }, { status: 400 });
    }

    const stored = otpStore.get(phone);

    if (!stored) {
      return NextResponse.json({ error: 'OTP not found or expired' }, { status: 400 });
    }

    if (Date.now() > stored.expires) {
      otpStore.delete(phone);
      return NextResponse.json({ error: 'OTP expired' }, { status: 400 });
    }

    if (stored.code !== otp) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    otpStore.delete(phone);
    return NextResponse.json({ success: true, message: 'OTP verified' });
  } catch (error: any) {
    console.error('OTP verify error:', error);
    return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 });
  }
}
