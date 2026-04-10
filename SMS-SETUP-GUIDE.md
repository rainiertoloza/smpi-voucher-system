# SMS/OTP Setup Guide

The OTP system currently **does NOT send real SMS messages** by default. It only logs the OTP to the console for testing.

To enable real SMS sending, follow these steps:

---

## Option 1: Semaphore (Recommended for Philippines)

### Step 1: Sign Up
1. Go to https://semaphore.co/
2. Create an account
3. Verify your account

### Step 2: Get API Key
1. Login to dashboard
2. Go to "API" section
3. Copy your API Key

### Step 3: Add Credits
1. Load credits (minimum ₱100)
2. SMS costs: ~₱0.50-1.00 per message

### Step 4: Configure Environment Variable
Add to your `.env` file or Vercel environment variables:
```env
SEMAPHORE_API_KEY=your_api_key_here
```

### Step 5: Deploy
Push changes and redeploy on Vercel.

**Cost:** ~₱0.50-1.00 per OTP sent

---

## Option 2: Twilio (International)

### Step 1: Sign Up
1. Go to https://www.twilio.com/
2. Create account (free trial available)
3. Get phone number

### Step 2: Get Credentials
1. Copy Account SID
2. Copy Auth Token
3. Copy Twilio Phone Number

### Step 3: Update OTP Route
Replace the `sendSMS` function in `src/app/api/otp/route.ts`:

```typescript
async function sendSMS(phone: string, message: string) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;
  
  if (!accountSid || !authToken || !fromNumber) {
    console.log('SMS not configured. OTP:', message);
    return { success: true };
  }

  try {
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: `+63${phone.substring(1)}`, // Convert 09XX to +639XX
          From: fromNumber,
          Body: message,
        }),
      }
    );

    return { success: response.ok };
  } catch (error) {
    console.error('SMS send error:', error);
    return { success: false };
  }
}
```

### Step 4: Add Environment Variables
```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_number
```

**Cost:** $0.0075 per SMS (~₱0.42)

---

## Option 3: Movider (Philippines)

### Step 1: Sign Up
1. Go to https://www.movider.co/
2. Create account
3. Verify business

### Step 2: Get API Credentials
1. Get API Key and Secret
2. Load credits

### Step 3: Update OTP Route
```typescript
async function sendSMS(phone: string, message: string) {
  const apiKey = process.env.MOVIDER_API_KEY;
  const apiSecret = process.env.MOVIDER_API_SECRET;
  
  if (!apiKey || !apiSecret) {
    console.log('SMS not configured. OTP:', message);
    return { success: true };
  }

  try {
    const response = await fetch('https://api.movider.co/v1/sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        phone: phone,
        message: message,
      }),
    });

    return { success: response.ok };
  } catch (error) {
    console.error('SMS send error:', error);
    return { success: false };
  }
}
```

### Step 4: Add Environment Variables
```env
MOVIDER_API_KEY=your_api_key
MOVIDER_API_SECRET=your_api_secret
```

---

## Testing Without SMS (Current Setup)

The system currently works in **testing mode**:

1. User enters phone number
2. OTP is generated
3. **OTP is logged to console** (check browser console or server logs)
4. User enters OTP manually
5. System verifies and issues voucher

### How to Test:
1. Fill out the claim form
2. Click "Send OTP"
3. Open browser console (F12)
4. Look for: `TEST OTP: 123456`
5. Enter that code in the OTP field
6. Click "Verify OTP"

---

## Production Checklist

Before going live with real SMS:

- [ ] Choose SMS provider (Semaphore recommended for PH)
- [ ] Sign up and verify account
- [ ] Load credits
- [ ] Add API credentials to Vercel environment variables
- [ ] Test with your own phone number first
- [ ] Remove `otp` from API response in production
- [ ] Monitor SMS usage and costs
- [ ] Set up alerts for low credits

---

## Cost Estimates

**Semaphore:** ₱0.50-1.00 per SMS
- 100 OTPs = ₱50-100
- 1,000 OTPs = ₱500-1,000

**Twilio:** ~₱0.42 per SMS
- 100 OTPs = ₱42
- 1,000 OTPs = ₱420

**Budget:** Estimate 1 OTP per voucher claim.

---

## Troubleshooting

**OTP not received?**
1. Check console logs for errors
2. Verify API credentials are correct
3. Check SMS provider dashboard for delivery status
4. Ensure phone number format is correct (09XXXXXXXXX)
5. Check if you have sufficient credits

**OTP expired?**
- OTPs expire after 5 minutes
- Request a new OTP

**Invalid OTP?**
- Check for typos
- Ensure you're using the latest OTP
- OTP is case-sensitive (numbers only)

---

## Support

- **Semaphore:** support@semaphore.co
- **Twilio:** https://support.twilio.com
- **Movider:** support@movider.co
