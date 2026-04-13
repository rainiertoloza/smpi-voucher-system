import { NextResponse } from 'next/server';
import { BrevoClient } from '@getbrevo/brevo';

export async function GET() {
  try {
    console.log('=== BREVO VERIFICATION ===');
    
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL;
    
    console.log('API Key exists:', !!apiKey);
    console.log('API Key length:', apiKey?.length || 0);
    console.log('API Key first 20 chars:', apiKey?.substring(0, 20) || 'N/A');
    console.log('Sender Email:', senderEmail);
    
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'BREVO_API_KEY not found in environment variables'
      }, { status: 500 });
    }
    
    if (!senderEmail) {
      return NextResponse.json({
        success: false,
        error: 'BREVO_SENDER_EMAIL not found in environment variables'
      }, { status: 500 });
    }
    
    // Test Brevo connection
    const client = new BrevoClient({ apiKey });
    
    try {
      // Try to get account info
      const account = await client.account.getAccount();
      
      console.log('Brevo account verified:', account.email);
      
      return NextResponse.json({
        success: true,
        message: 'Brevo connection successful',
        account: {
          email: account.email,
          firstName: account.firstName,
          lastName: account.lastName,
          companyName: account.companyName
        },
        config: {
          senderEmail,
          apiKeyLength: apiKey.length
        }
      });
    } catch (brevoError: any) {
      console.error('Brevo API error:', brevoError);
      
      return NextResponse.json({
        success: false,
        error: 'Brevo API connection failed',
        details: brevoError.message || brevoError.toString(),
        config: {
          senderEmail,
          apiKeyLength: apiKey.length,
          apiKeyPrefix: apiKey.substring(0, 20)
        }
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Verification error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Verification failed',
      details: error.toString()
    }, { status: 500 });
  }
}
