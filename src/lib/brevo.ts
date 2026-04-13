import { BrevoClient } from '@getbrevo/brevo';

const client = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY || ''
});

export async function sendVoucherEmail(
  email: string,
  fullName: string,
  voucherCode: string,
  expiryDate: string
) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0058a9 0%, #003d75 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .voucher-box { background: white; border: 3px dashed #0058a9; padding: 20px; margin: 20px 0; text-align: center; border-radius: 10px; }
        .voucher-code { font-size: 32px; font-weight: bold; color: #0058a9; letter-spacing: 2px; margin: 10px 0; }
        .info-box { background: #fff3cd; border-left: 4px solid #fdd802; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
        .btn { display: inline-block; background: #0058a9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎫 Your SMPI Voucher</h1>
          <p>Thank you for claiming your voucher!</p>
        </div>
        <div class="content">
          <p>Hi <strong>${fullName}</strong>,</p>
          <p>Your voucher has been successfully generated. Here are your details:</p>
          
          <div class="voucher-box">
            <p style="margin: 0; color: #666;">Your Voucher Code</p>
            <div class="voucher-code">${voucherCode}</div>
            <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">Save this code for redemption</p>
          </div>

          <div class="info-box">
            <strong>⚠️ Important Information:</strong>
            <ul style="margin: 10px 0;">
              <li>Valid until: <strong>${expiryDate}</strong></li>
              <li>One-time use only</li>
              <li>Present this code at any SMPI branch</li>
              <li>Cannot be exchanged for cash</li>
            </ul>
          </div>

          <p><strong>How to Redeem:</strong></p>
          <ol>
            <li>Visit any SMPI branch</li>
            <li>Show this voucher code to the staff</li>
            <li>Enjoy your discount!</li>
          </ol>

          <p style="margin-top: 30px;">If you have any questions, please contact our customer service.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} SMPI. All rights reserved.</p>
          <p>This is an automated email. Please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    console.log('Sending email to:', email);
    console.log('Brevo API Key exists:', !!process.env.BREVO_API_KEY);
    console.log('Sender email:', process.env.BREVO_SENDER_EMAIL);
    
    const result = await client.transactionalEmails.sendTransacEmail({
      sender: {
        name: 'SMPI Voucher System',
        email: process.env.BREVO_SENDER_EMAIL || 'noreply@smpi.com'
      },
      to: [{ email, name: fullName }],
      subject: 'Your SMPI Voucher Code',
      htmlContent
    });
    
    console.log('Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error: any) {
    console.error('Brevo email error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    throw new Error(`Failed to send email: ${error.message || error.toString()}`);
  }
}
