import { NextResponse } from 'next/server';
import { dbDirect } from '@/lib/db-direct';
import { sendVoucherEmail } from '@/lib/brevo';
import { checkRateLimit } from '@/lib/rate-limit';
import { validateEmail, normalizeEmail } from '@/lib/email-validator';

export async function POST(req: Request) {
  try {
    const { fullName, email, phone } = await req.json();

    if (!fullName || !email || !phone) {
      return NextResponse.json({ error: '⚠️ All fields are required' }, { status: 400 });
    }

    // Normalize email
    const normalizedEmail = normalizeEmail(email);

    // Validate email format and check for disposable domains
    const emailValidation = validateEmail(normalizedEmail);
    if (!emailValidation.valid) {
      return NextResponse.json({ error: emailValidation.error }, { status: 400 });
    }

    // Rate limiting by IP address
    const ip = req.headers.get('x-forwarded-for') || 
               req.headers.get('x-real-ip') || 
               'unknown';
    const ipRateLimit = checkRateLimit(`ip:${ip}`, 5, 60 * 60 * 1000); // 5 requests per hour
    
    if (!ipRateLimit.allowed) {
      const resetIn = Math.ceil((ipRateLimit.resetTime - Date.now()) / 1000 / 60);
      return NextResponse.json(
        { error: `⏰ Too many requests. Please try again in ${resetIn} minutes.` },
        { status: 429 }
      );
    }

    // Rate limiting by email
    const emailRateLimit = checkRateLimit(`email:${normalizedEmail}`, 1, 24 * 60 * 60 * 1000); // 1 per day
    
    if (!emailRateLimit.allowed) {
      return NextResponse.json(
        { error: '🚫 This email has already claimed a voucher today. Please try again tomorrow.' },
        { status: 429 }
      );
    }

    // Create voucher in database first
    const code = await dbDirect.createVoucher(fullName, normalizedEmail, phone);
    
    // Calculate expiry date
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    const formattedExpiry = expiryDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    // Send email only after successful voucher creation
    try {
      await sendVoucherEmail(normalizedEmail, fullName, code, formattedExpiry);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Voucher is created but email failed - log for manual follow-up
      return NextResponse.json({ 
        success: true,
        warning: 'Voucher created but email delivery failed. Please contact support with code: ' + code
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Voucher sent to your email' 
    });
  } catch (error: any) {
    console.error('Claim error:', error);
    return NextResponse.json({ error: error.message || '💥 Server error. Please try again.' }, { status: 500 });
  }
}
