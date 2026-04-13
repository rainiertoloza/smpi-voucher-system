# 🔧 Brevo Email Troubleshooting Guide

## Quick Diagnosis Steps

### **Step 1: Verify Brevo Configuration**

Visit: `https://your-domain.vercel.app/api/verify-brevo`

This will check:
- ✅ API key exists
- ✅ Sender email is configured
- ✅ Brevo API connection works
- ✅ Account details

**Expected Response:**
```json
{
  "success": true,
  "message": "Brevo connection successful",
  "account": {
    "email": "your-email@example.com",
    "firstName": "Your Name",
    "companyName": "SMPI"
  },
  "config": {
    "senderEmail": "smpimarketing787@gmail.com",
    "apiKeyLength": 87
  }
}
```

---

### **Step 2: Test Email Sending**

**Method 1: Using curl**
```bash
curl -X POST https://your-domain.vercel.app/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"your-test-email@gmail.com"}'
```

**Method 2: Using browser console**
```javascript
fetch('/api/test-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'your-test-email@gmail.com' })
})
.then(r => r.json())
.then(console.log)
```

---

### **Step 3: Check Vercel Logs**

1. Go to Vercel Dashboard
2. Select your project
3. Click "Logs" tab
4. Look for:
   - "Sending email to: ..."
   - "Brevo API Key exists: true"
   - "Sender email: smpimarketing787@gmail.com"
   - Any error messages

---

## Common Issues & Solutions

### **Issue 1: Sender Email Not Verified**

**Symptoms:**
- Error: "Sender email not verified"
- Error: "Invalid sender"

**Solution:**
1. Go to Brevo Dashboard: https://app.brevo.com
2. Navigate to: **Senders & IP** → **Senders**
3. Check if `smpimarketing787@gmail.com` is listed
4. If not listed:
   - Click **"Add a sender"**
   - Email: `smpimarketing787@gmail.com`
   - Name: `SMPI Voucher System`
   - Click **"Add"**
5. Check Gmail inbox for verification email
6. Click verification link
7. Wait for approval (usually instant)

**Verify it's active:**
- Status should show: ✅ **Active**
- Not: ⏳ Pending or ❌ Not verified

---

### **Issue 2: Wrong API Key**

**Symptoms:**
- Error: "Invalid API key"
- Error: "Unauthorized"
- 401 status code

**Solution:**
1. Go to Brevo Dashboard
2. Click your name (top right) → **"SMTP & API"**
3. Click **"API Keys"** tab
4. Check if your key is listed
5. If not, generate new key:
   - Click **"Generate a new API key"**
   - Name: `SMPI_Voucher_Production`
   - Copy the key (shown only once!)
6. Update Vercel environment variable:
   ```
   BREVO_API_KEY=xkeysib-your-new-key-here
   ```
7. Redeploy or restart Vercel

---

### **Issue 3: Environment Variables Not Set in Vercel**

**Symptoms:**
- Error: "BREVO_API_KEY not found"
- Logs show: "Brevo API Key exists: false"

**Solution:**
1. Go to Vercel Dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add/Update:
   ```
   BREVO_API_KEY = xkeysib-your-actual-api-key-here
   BREVO_SENDER_EMAIL = smpimarketing787@gmail.com
   ```
5. Select environments: **Production**, **Preview**, **Development**
6. Click **"Save"**
7. **Important:** Redeploy your application
   - Go to **Deployments** tab
   - Click **"..."** on latest deployment
   - Click **"Redeploy"**

---

### **Issue 4: Email Going to Spam**

**Symptoms:**
- Email sent successfully
- Not in inbox
- Found in spam folder

**Solution:**

**Short-term:**
1. Check spam folder
2. Mark as "Not Spam"
3. Add sender to contacts

**Long-term (Domain Authentication):**
1. Buy a custom domain (e.g., `smpi-voucher.com`)
2. Add domain to Vercel
3. Configure DNS at domain registrar:
   ```
   Type: TXT
   Host: mail._domainkey
   Value: [Get from Brevo → Senders & IP → Domains]
   
   Type: TXT
   Host: @
   Value: v=spf1 include:spf.brevo.com ~all
   
   Type: TXT
   Host: _dmarc
   Value: v=DMARC1; p=none; rua=mailto:admin@smpi-voucher.com
   ```
4. Update sender email to use custom domain

---

### **Issue 5: Rate Limiting**

**Symptoms:**
- Error: "Too many requests"
- Error: "Daily limit reached"

**Solution:**

**Free Plan Limits:**
- 300 emails per day
- Check usage: Brevo Dashboard → Statistics

**If limit reached:**
1. Wait until next day (resets at midnight UTC)
2. Or upgrade plan:
   - Starter: $25/mo (20,000 emails)
   - Business: $65/mo (100,000 emails)

---

### **Issue 6: Gmail Blocking Emails**

**Symptoms:**
- Error: "Recipient rejected"
- Gmail not receiving emails

**Solution:**

**For Gmail sender (smpimarketing787@gmail.com):**
1. Enable "Less secure app access" (if using SMTP)
2. Or use Gmail App Password:
   - Google Account → Security → 2-Step Verification
   - App passwords → Generate
   - Use this password instead

**For Gmail recipients:**
1. Check spam folder
2. Whitelist sender
3. Add to contacts

---

## Debugging Checklist

Use this checklist to diagnose issues:

- [ ] **Brevo API Key is correct**
  - Visit `/api/verify-brevo`
  - Should return success: true

- [ ] **Sender email is verified in Brevo**
  - Check Brevo → Senders & IP → Senders
  - Status should be "Active"

- [ ] **Environment variables set in Vercel**
  - Check Vercel → Settings → Environment Variables
  - Both BREVO_API_KEY and BREVO_SENDER_EMAIL exist

- [ ] **Application redeployed after env var changes**
  - Env vars only apply after redeploy

- [ ] **Test email endpoint works**
  - Visit `/api/test-email` with POST request
  - Should send test email

- [ ] **Check Vercel logs for errors**
  - Look for "Brevo email error" messages
  - Check full error details

- [ ] **Check Brevo dashboard for sent emails**
  - Brevo → Transactional → Email
  - See if emails are being sent

- [ ] **Check spam folder**
  - Emails might be delivered to spam

- [ ] **Daily limit not exceeded**
  - Free plan: 300 emails/day
  - Check Brevo → Statistics

---

## Testing Commands

### **1. Verify Brevo Connection**
```bash
curl https://your-domain.vercel.app/api/verify-brevo
```

### **2. Send Test Email**
```bash
curl -X POST https://your-domain.vercel.app/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@gmail.com"}'
```

### **3. Test Voucher Claim**
```bash
curl -X POST https://your-domain.vercel.app/api/voucher/claim \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@gmail.com",
    "phone": "09123456789"
  }'
```

---

## Brevo Dashboard Quick Links

- **Account:** https://app.brevo.com/account
- **Senders:** https://app.brevo.com/senders
- **API Keys:** https://app.brevo.com/settings/keys/api
- **Statistics:** https://app.brevo.com/statistics/email
- **Transactional Emails:** https://app.brevo.com/transactional
- **Logs:** https://app.brevo.com/logs

---

## Expected Logs (Success)

When email sends successfully, you should see:

```
=== TEST EMAIL DEBUG ===
Environment variables:
- BREVO_API_KEY exists: true
- BREVO_API_KEY length: 87
- BREVO_SENDER_EMAIL: smpimarketing787@gmail.com
- Target email: test@gmail.com

Sending email to: test@gmail.com
Brevo API Key exists: true
Sender email: smpimarketing787@gmail.com
Email sent successfully: <message-id>
```

---

## Expected Logs (Error)

If there's an error, you'll see:

```
=== TEST EMAIL ERROR ===
Error message: Sender email not verified
Error stack: [stack trace]
Full error: [full error object]
```

Common error messages:
- `"Sender email not verified"` → Verify sender in Brevo
- `"Invalid API key"` → Check API key in Vercel env vars
- `"Unauthorized"` → API key is wrong or expired
- `"Daily limit reached"` → Exceeded 300 emails/day
- `"Recipient rejected"` → Email address invalid or blocked

---

## Still Not Working?

### **1. Check Brevo Status**
Visit: https://status.brevo.com/
- Ensure Brevo services are operational

### **2. Try Different Email**
- Test with different recipient email
- Try Gmail, Yahoo, Outlook

### **3. Check Brevo Logs**
- Brevo Dashboard → Logs
- See if emails are being received by Brevo

### **4. Contact Brevo Support**
- Email: support@brevo.com
- Live chat: Available in dashboard
- Provide: Account email, error message, timestamp

### **5. Alternative: Use SMTP**
If API doesn't work, try SMTP:

```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  auth: {
    user: 'smpimarketing787@gmail.com',
    pass: 'your-smtp-key'
  }
});
```

Get SMTP key from: Brevo → SMTP & API → SMTP

---

## Quick Fix Summary

**Most common issue:** Sender email not verified

**Quick fix:**
1. Go to https://app.brevo.com/senders
2. Add `smpimarketing787@gmail.com`
3. Verify via email link
4. Wait 5 minutes
5. Test again

**Second most common:** Environment variables not set

**Quick fix:**
1. Vercel → Settings → Environment Variables
2. Add BREVO_API_KEY and BREVO_SENDER_EMAIL
3. Redeploy application
4. Test again

---

**Need more help?** Check Vercel logs and Brevo dashboard for specific error messages.
