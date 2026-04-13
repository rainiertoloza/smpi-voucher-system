# 🛡️ Rate Limiting & Security Features

## Overview

The SMPI Voucher System includes comprehensive rate limiting and email validation to prevent abuse and protect your Brevo email quota.

---

## 🚦 Rate Limiting

### **IP-Based Rate Limiting**
- **Limit:** 5 requests per hour per IP address
- **Purpose:** Prevent spam and abuse from single source
- **Response:** 429 Too Many Requests with retry time

### **Email-Based Rate Limiting**
- **Limit:** 1 voucher per email per 24 hours
- **Purpose:** Prevent duplicate claims
- **Response:** 429 Too Many Requests

### **How It Works:**

```typescript
// Rate limit by IP
checkRateLimit(`ip:${ip}`, 5, 60 * 60 * 1000); // 5 per hour

// Rate limit by email
checkRateLimit(`email:${email}`, 1, 24 * 60 * 60 * 1000); // 1 per day
```

### **Automatic Cleanup:**
- Old rate limit entries are automatically cleaned every 10 minutes
- Prevents memory leaks in long-running processes

---

## 📧 Email Validation

### **1. Format Validation**
- Validates proper email format using regex
- Checks for @ symbol and domain
- Example: `user@domain.com` ✅

### **2. Disposable Email Detection**
Blocks temporary/disposable email services:
- tempmail.com
- guerrillamail.com
- 10minutemail.com
- mailinator.com
- yopmail.com
- And more...

**Why?** Prevents users from creating multiple accounts with throwaway emails.

### **3. Common Typo Detection**
Suggests corrections for common typos:
- `gmial.com` → `gmail.com`
- `yahooo.com` → `yahoo.com`
- `hotmial.com` → `hotmail.com`
- `outlok.com` → `outlook.com`

### **4. Email Normalization**
- Converts to lowercase
- Trims whitespace
- Ensures consistency

---

## 💰 Brevo Email Quota Protection

### **Problem:**
Without validation, invalid emails would still consume your daily Brevo quota (300 emails/day on free plan).

### **Solution:**
1. **Validate email BEFORE creating voucher**
2. **Create voucher in database FIRST**
3. **Send email ONLY if voucher creation succeeds**
4. **Handle email failures gracefully**

### **Flow:**

```
User submits form
    ↓
Validate email format ✓
    ↓
Check disposable domains ✓
    ↓
Check rate limits ✓
    ↓
Create voucher in database ✓
    ↓
Send email (only if all above pass) ✓
```

### **Email Failure Handling:**

If email sending fails after voucher creation:
- Voucher is still saved in database
- User receives voucher code in response
- Error is logged for manual follow-up
- No Brevo quota wasted on invalid emails

---

## 🔒 Security Features

### **1. Input Validation**
```typescript
// All fields required
if (!fullName || !email || !phone) {
  return error('All fields required');
}
```

### **2. SQL Injection Protection**
- Uses parameterized queries
- No raw SQL string concatenation
- Turso/libsql handles escaping

### **3. XSS Protection**
- React automatically escapes output
- No dangerouslySetInnerHTML used
- Content Security Policy headers

### **4. CSRF Protection**
- Same-origin policy enforced
- No cookies used for authentication on claim page

### **5. Rate Limiting**
- Prevents brute force attacks
- Protects against DDoS
- Limits resource consumption

---

## 📊 Rate Limit Response Format

### **Success Response:**
```json
{
  "success": true,
  "message": "Voucher sent to your email"
}
```

### **Rate Limit Exceeded (IP):**
```json
{
  "error": "Too many requests. Please try again in 45 minutes."
}
```
**Status Code:** 429

### **Rate Limit Exceeded (Email):**
```json
{
  "error": "This email has already claimed a voucher today."
}
```
**Status Code:** 429

### **Invalid Email:**
```json
{
  "error": "Disposable email addresses are not allowed"
}
```
**Status Code:** 400

### **Email Typo Detected:**
```json
{
  "error": "Did you mean user@gmail.com?"
}
```
**Status Code:** 400

---

## 🎯 Customizing Rate Limits

### **Adjust IP Rate Limit:**

Edit `src/app/api/voucher/claim/route.ts`:

```typescript
// Change from 5 per hour to 10 per hour
const ipRateLimit = checkRateLimit(`ip:${ip}`, 10, 60 * 60 * 1000);
```

### **Adjust Email Rate Limit:**

```typescript
// Change from 1 per day to 1 per week
const emailRateLimit = checkRateLimit(
  `email:${email}`, 
  1, 
  7 * 24 * 60 * 60 * 1000
);
```

### **Add Phone Rate Limit:**

```typescript
// Limit by phone number
const phoneRateLimit = checkRateLimit(`phone:${phone}`, 1, 24 * 60 * 60 * 1000);

if (!phoneRateLimit.allowed) {
  return NextResponse.json(
    { error: 'This phone number has already claimed a voucher today.' },
    { status: 429 }
  );
}
```

---

## 🧪 Testing Rate Limits

### **Test IP Rate Limit:**

```bash
# Make 6 requests quickly (5 should succeed, 6th should fail)
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/voucher/claim \
    -H "Content-Type: application/json" \
    -d '{"fullName":"Test User","email":"test'$i'@example.com","phone":"09123456789"}'
  echo ""
done
```

### **Test Email Rate Limit:**

```bash
# Try claiming twice with same email
curl -X POST http://localhost:3000/api/voucher/claim \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test User","email":"test@example.com","phone":"09123456789"}'

# Second attempt should fail
curl -X POST http://localhost:3000/api/voucher/claim \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test User","email":"test@example.com","phone":"09123456789"}'
```

### **Test Disposable Email:**

```bash
curl -X POST http://localhost:3000/api/voucher/claim \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test User","email":"test@tempmail.com","phone":"09123456789"}'

# Should return: "Disposable email addresses are not allowed"
```

---

## 📈 Monitoring Rate Limits

### **Add Logging:**

Edit `src/lib/rate-limit.ts`:

```typescript
export function checkRateLimit(identifier: string, maxRequests: number, windowMs: number) {
  const result = /* ... rate limit logic ... */;
  
  // Log rate limit hits
  if (!result.allowed) {
    console.warn(`Rate limit exceeded for ${identifier}`);
  }
  
  return result;
}
```

### **Track in Admin Dashboard:**

Add rate limit statistics to admin dashboard:
- Total rate limit hits today
- Most blocked IPs
- Most blocked emails
- Peak request times

---

## 🔧 Advanced Configuration

### **Redis-Based Rate Limiting (Production):**

For high-traffic deployments, use Redis instead of in-memory Map:

```typescript
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN
});

export async function checkRateLimit(identifier: string, maxRequests: number, windowMs: number) {
  const key = `ratelimit:${identifier}`;
  const count = await redis.incr(key);
  
  if (count === 1) {
    await redis.expire(key, Math.ceil(windowMs / 1000));
  }
  
  return {
    allowed: count <= maxRequests,
    remaining: Math.max(0, maxRequests - count),
    resetTime: Date.now() + windowMs
  };
}
```

### **Add CAPTCHA (Optional):**

For additional protection, integrate reCAPTCHA:

```typescript
// Verify reCAPTCHA token
const captchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: `secret=${process.env.RECAPTCHA_SECRET}&response=${captchaToken}`
});

const captchaData = await captchaResponse.json();

if (!captchaData.success) {
  return NextResponse.json({ error: 'CAPTCHA verification failed' }, { status: 400 });
}
```

---

## 🆘 Troubleshooting

### **Rate limit not working:**
1. Check if rate-limit.ts is imported correctly
2. Verify IP address is being captured (check headers)
3. Test with different IPs/emails
4. Check server logs for errors

### **False positives (legitimate users blocked):**
1. Increase rate limits
2. Whitelist specific IPs (office, branches)
3. Add bypass mechanism for staff
4. Implement CAPTCHA for borderline cases

### **Memory issues with rate limiting:**
1. Reduce cleanup interval
2. Implement Redis-based rate limiting
3. Set shorter time windows
4. Monitor memory usage

---

## 📝 Best Practices

1. **Start Conservative:** Begin with strict limits, loosen if needed
2. **Monitor Logs:** Track rate limit hits to adjust thresholds
3. **Whitelist Internal IPs:** Don't rate limit your own testing
4. **Clear Communication:** Show users when they're rate limited and when they can retry
5. **Graceful Degradation:** Don't break the entire system if rate limiting fails
6. **Regular Review:** Adjust limits based on actual usage patterns

---

## 🎯 Summary

### **Rate Limits:**
- ✅ 5 requests per hour per IP
- ✅ 1 voucher per email per day
- ✅ Automatic cleanup of old entries

### **Email Protection:**
- ✅ Format validation
- ✅ Disposable domain blocking
- ✅ Typo detection
- ✅ Normalization

### **Brevo Quota Protection:**
- ✅ Validate before sending
- ✅ Create voucher first
- ✅ Send email only if valid
- ✅ Handle failures gracefully

### **Result:**
- 🎯 Prevents abuse
- 💰 Saves Brevo quota
- 🛡️ Protects system resources
- ✨ Better user experience

---

**Built with ❤️ for SMPI - Secure & Efficient**
