# 📧 Brevo Email Integration Setup Guide

## Overview

This guide explains how to set up Brevo (formerly Sendinblue) for sending voucher codes via email in the SMPI Voucher System.

---

## 🚀 Quick Setup

### **Step 1: Create Brevo Account**

1. Go to [https://www.brevo.com](https://www.brevo.com)
2. Click "Sign up free"
3. Fill in your details:
   - Email address
   - Password
   - Company name: SMPI
4. Verify your email address
5. Complete the onboarding questionnaire

**Free Plan Includes:**
- 300 emails per day
- Unlimited contacts
- Email templates
- Real-time statistics

---

### **Step 2: Generate API Key**

1. Log in to your Brevo account
2. Click your name (top right) → **"SMTP & API"**
3. Click the **"API Keys"** tab
4. Click **"Generate a new API key"**
5. Name it: `SMPI_Voucher_System`
6. Copy the API key (you'll only see it once!)
7. Save it securely

**Example API Key format:**
```
xkeysib-1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f3g4h5i6j7k8l9m0n1o2p3q4r5s6t7u8v9w0x1y2z3a4b5c6d7e8f9g0h1i2j3k4l5m6n7o8p9q0r1s2t3u4v5w6x7y8z9
```

---

### **Step 3: Verify Sender Email**

**Important:** You must verify your sender email address before sending emails.

#### **Option A: Single Sender (Recommended for Testing)**

1. Go to **"Senders & IP"** → **"Senders"**
2. Click **"Add a sender"**
3. Enter your email: `noreply@yourdomain.com` (or your actual email)
4. Enter sender name: `SMPI Voucher System`
5. Click **"Add"**
6. Check your email inbox
7. Click the verification link
8. Wait for approval (usually instant)

#### **Option B: Domain Authentication (Recommended for Production)**

1. Go to **"Senders & IP"** → **"Domains"**
2. Click **"Add a domain"**
3. Enter your domain: `yourdomain.com`
4. Follow the DNS configuration steps:
   - Add DKIM record to your DNS
   - Add SPF record to your DNS
   - Add DMARC record (optional but recommended)
5. Click **"Verify"**
6. Wait for DNS propagation (can take up to 48 hours)

**DNS Records Example:**
```
Type: TXT
Host: mail._domainkey
Value: v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC...

Type: TXT
Host: @
Value: v=spf1 include:spf.brevo.com ~all

Type: TXT
Host: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com
```

---

### **Step 4: Configure Environment Variables**

1. Open your `.env` file (or create one from `.env.example`)
2. Add your Brevo credentials:

```env
# Brevo Email Configuration
BREVO_API_KEY="xkeysib-your-actual-api-key-here"
BREVO_SENDER_EMAIL="noreply@yourdomain.com"
```

**For Development (using personal email):**
```env
BREVO_API_KEY="xkeysib-your-actual-api-key-here"
BREVO_SENDER_EMAIL="your-verified-email@gmail.com"
```

**For Production (using domain):**
```env
BREVO_API_KEY="xkeysib-your-actual-api-key-here"
BREVO_SENDER_EMAIL="noreply@smpi.com"
```

---

### **Step 5: Test Email Sending**

1. Start your development server:
```bash
npm run dev
```

2. Go to: `http://localhost:3000/claim`

3. Fill in the form with your email address

4. Submit the form

5. Check your email inbox (and spam folder)

6. You should receive an email with your voucher code

---

## 📊 Brevo Dashboard Features

### **Monitor Email Performance**

1. **Statistics Dashboard:**
   - Go to **"Statistics"** → **"Email"**
   - View sent, delivered, opened, clicked emails
   - Track bounce and spam rates

2. **Real-time Activity:**
   - Go to **"Transactional"** → **"Email"**
   - See all sent emails in real-time
   - Check delivery status
   - View email content

3. **Contact Management:**
   - Go to **"Contacts"**
   - View all recipients
   - Segment by activity
   - Export contact lists

---

## 🎨 Email Template Customization

The email template is defined in `src/lib/brevo.ts`. You can customize:

### **Current Template Features:**
- ✅ Responsive HTML design
- ✅ SMPI brand colors (#0058a9, #fdd802)
- ✅ Voucher code display
- ✅ Expiry date
- ✅ Redemption instructions
- ✅ Important information box

### **Customize the Template:**

Edit `src/lib/brevo.ts`:

```typescript
sendSmtpEmail.htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      /* Your custom styles here */
    </style>
  </head>
  <body>
    <!-- Your custom HTML here -->
  </body>
  </html>
`;
```

### **Add Your Logo:**

1. Upload logo to `public/images/logo.png`
2. Add to email template:

```html
<img src="https://yourdomain.com/images/logo.png" alt="SMPI Logo" style="max-width: 200px;">
```

---

## 🔧 Advanced Configuration

### **Add Email Attachments**

```typescript
sendSmtpEmail.attachment = [
  {
    name: 'voucher.pdf',
    content: Buffer.from('PDF content').toString('base64')
  }
];
```

### **Add CC/BCC Recipients**

```typescript
sendSmtpEmail.cc = [{ email: 'manager@smpi.com' }];
sendSmtpEmail.bcc = [{ email: 'admin@smpi.com' }];
```

### **Track Email Opens**

Brevo automatically tracks email opens. View in dashboard:
- **Transactional** → **Email** → Click on email → **Statistics**

### **Use Email Templates (Alternative)**

Instead of HTML in code, create templates in Brevo:

1. Go to **"Templates"** → **"Transactional templates"**
2. Click **"Create a new template"**
3. Design your template
4. Note the template ID
5. Update code:

```typescript
sendSmtpEmail.templateId = 1; // Your template ID
sendSmtpEmail.params = {
  VOUCHER_CODE: voucherCode,
  FULL_NAME: fullName,
  EXPIRY_DATE: expiryDate
};
```

---

## 🛡️ Security Best Practices

### **1. Protect Your API Key**

- ✅ Never commit `.env` file to Git
- ✅ Use environment variables
- ✅ Rotate API keys regularly
- ✅ Use different keys for dev/staging/production

### **2. Rate Limiting**

Add rate limiting to prevent abuse:

```typescript
// In src/app/api/voucher/claim/route.ts
const rateLimitMap = new Map();

export async function POST(req: Request) {
  const email = await req.json().email;
  const lastSent = rateLimitMap.get(email);
  
  if (lastSent && Date.now() - lastSent < 60000) {
    return NextResponse.json(
      { error: 'Please wait 1 minute before requesting another voucher' },
      { status: 429 }
    );
  }
  
  rateLimitMap.set(email, Date.now());
  // ... rest of code
}
```

### **3. Email Validation**

Already implemented in the form, but you can add server-side validation:

```typescript
function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}
```

### **4. Prevent Spam**

- Enable CAPTCHA (optional)
- Implement honeypot fields
- Check for disposable email domains
- Monitor sending patterns

---

## 📈 Scaling Considerations

### **Free Plan Limits:**
- 300 emails/day
- Suitable for: ~10 vouchers/day

### **Upgrade Plans:**

| Plan | Price | Emails/Month | Best For |
|------|-------|--------------|----------|
| Free | $0 | 9,000 | Testing, small events |
| Starter | $25/mo | 20,000 | Small business |
| Business | $65/mo | 100,000 | Growing business |
| Enterprise | Custom | Unlimited | Large scale |

### **When to Upgrade:**

- Sending more than 300 emails/day
- Need advanced features (A/B testing, automation)
- Require dedicated IP address
- Need priority support

---

## 🆘 Troubleshooting

### **Problem: Email not received**

**Solutions:**
1. Check spam/junk folder
2. Verify sender email is authenticated
3. Check Brevo dashboard for delivery status
4. Verify API key is correct
5. Check email address is valid
6. Review Brevo logs for errors

### **Problem: "Invalid API key" error**

**Solutions:**
1. Verify API key in `.env` file
2. Check for extra spaces or quotes
3. Regenerate API key in Brevo dashboard
4. Restart development server after updating `.env`

### **Problem: "Sender not verified" error**

**Solutions:**
1. Go to Brevo → Senders & IP → Senders
2. Verify your sender email
3. Check verification email
4. Wait for approval (usually instant)

### **Problem: High bounce rate**

**Solutions:**
1. Validate email addresses before sending
2. Remove invalid emails from list
3. Check DNS configuration
4. Authenticate your domain

### **Problem: Emails going to spam**

**Solutions:**
1. Authenticate your domain (SPF, DKIM, DMARC)
2. Avoid spam trigger words
3. Include unsubscribe link (for marketing emails)
4. Maintain good sender reputation
5. Warm up your domain gradually

---

## 📊 Monitoring & Analytics

### **Key Metrics to Track:**

1. **Delivery Rate:**
   - Target: >95%
   - Formula: (Delivered / Sent) × 100

2. **Open Rate:**
   - Target: >20%
   - Formula: (Opened / Delivered) × 100

3. **Bounce Rate:**
   - Target: <5%
   - Formula: (Bounced / Sent) × 100

4. **Spam Rate:**
   - Target: <0.1%
   - Formula: (Spam / Sent) × 100

### **Set Up Alerts:**

1. Go to **"Settings"** → **"Notifications"**
2. Enable alerts for:
   - High bounce rate
   - Spam complaints
   - API errors
   - Daily sending limit reached

---

## 🔄 Migration from SMTP to API

If you started with SMTP and want to migrate to API:

### **Current Implementation (API):**
```typescript
import * as brevo from '@getbrevo/brevo';
const apiInstance = new brevo.TransactionalEmailsApi();
```

### **Alternative (SMTP):**
```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  auth: {
    user: 'your-email@example.com',
    pass: 'your-smtp-key'
  }
});
```

**Recommendation:** Stick with API (current implementation) for better features and tracking.

---

## 📝 Testing Checklist

Before going live:

- [ ] API key configured in `.env`
- [ ] Sender email verified
- [ ] Test email sent successfully
- [ ] Email received in inbox (not spam)
- [ ] Voucher code displays correctly
- [ ] Expiry date is accurate
- [ ] Email design looks good on mobile
- [ ] Email design looks good on desktop
- [ ] Links work correctly
- [ ] Branding matches SMPI colors
- [ ] Error handling works
- [ ] Rate limiting implemented
- [ ] Monitoring set up

---

## 🚀 Deployment

### **Environment Variables for Production:**

**Vercel:**
```bash
vercel env add BREVO_API_KEY
vercel env add BREVO_SENDER_EMAIL
```

**Railway:**
```bash
railway variables set BREVO_API_KEY=your-key
railway variables set BREVO_SENDER_EMAIL=noreply@smpi.com
```

**Netlify:**
```bash
netlify env:set BREVO_API_KEY your-key
netlify env:set BREVO_SENDER_EMAIL noreply@smpi.com
```

---

## 📞 Support Resources

- **Brevo Documentation:** https://developers.brevo.com/
- **API Reference:** https://developers.brevo.com/reference
- **Support:** https://help.brevo.com/
- **Status Page:** https://status.brevo.com/
- **Community Forum:** https://community.brevo.com/

---

## 💡 Alternative Email Services

If Brevo doesn't meet your needs:

| Service | Free Tier | Best For |
|---------|-----------|----------|
| SendGrid | 100 emails/day | Developers |
| Mailgun | 5,000 emails/month | Transactional |
| Amazon SES | 62,000 emails/month | AWS users |
| Postmark | 100 emails/month | Transactional |
| Resend | 3,000 emails/month | Modern API |

---

**Built with ❤️ for SMPI - Reliable Email Delivery**
