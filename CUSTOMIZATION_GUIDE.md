# 🛠️ Code Customization Guide

## Overview
This guide explains how to customize common business logic and UI elements in the SMPI Voucher System.

---

## 📝 Table of Contents
1. [Voucher Configuration](#voucher-configuration)
2. [Email Customization](#email-customization)
3. [Admin Dashboard](#admin-dashboard)
4. [Database Schema](#database-schema)
5. [Validation Rules](#validation-rules)
6. [UI Customization](#ui-customization)
7. [Rate Limiting](#rate-limiting)
8. [Branch Management](#branch-management)

---

## 🎫 Voucher Configuration

### **Change Voucher Prefix**

**Current:** `SMPI-XXXXXX`

**File:** `src/lib/db-direct.ts`

**Line:** ~26

```typescript
const code = `SMPI-${nanoid(6).toUpperCase()}`;
```

**Change to:**
```typescript
// Example: PROMO-XXXXXX
const code = `PROMO-${nanoid(6).toUpperCase()}`;

// Example: DISC-XXXXXX
const code = `DISC-${nanoid(6).toUpperCase()}`;

// Example: VCH-XXXXXX
const code = `VCH-${nanoid(6).toUpperCase()}`;
```

---

### **Change Voucher Code Length**

**Current:** 6 characters (e.g., SMPI-ABC123)

**File:** `src/lib/db-direct.ts`

**Line:** ~26

```typescript
const code = `SMPI-${nanoid(6).toUpperCase()}`;
```

**Change to:**
```typescript
// 4 characters: SMPI-AB12
const code = `SMPI-${nanoid(4).toUpperCase()}`;

// 8 characters: SMPI-ABCD1234
const code = `SMPI-${nanoid(8).toUpperCase()}`;

// 10 characters: SMPI-ABCDE12345
const code = `SMPI-${nanoid(10).toUpperCase()}`;
```

---

### **Change Voucher Expiration Period**

**Current:** 30 days

**File:** `src/lib/db-direct.ts`

**Line:** ~27

```typescript
const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
```

**Change to:**
```typescript
// 7 days (1 week)
const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

// 60 days (2 months)
const expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString();

// 90 days (3 months)
const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();

// 365 days (1 year)
const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
```

**Also update in:** `src/app/api/voucher/claim/route.ts` (Line ~56)

---

## 📧 Email Customization

### **Change Email Subject**

**File:** `src/lib/brevo.ts`

**Line:** ~75

```typescript
subject: 'Your SMPI Voucher Code',
```

**Change to:**
```typescript
subject: 'Your Exclusive Discount Code',
subject: 'SMPI Promo Code - Claim Now!',
subject: 'Your Special Offer from SMPI',
```

---

### **Change Email Sender Name**

**File:** `src/lib/brevo.ts`

**Line:** ~73

```typescript
sender: {
  name: 'SMPI Voucher System',
  email: process.env.BREVO_SENDER_EMAIL || 'smpimarketing787@gmail.com'
},
```

**Change to:**
```typescript
sender: {
  name: 'SMPI Marketing Team',
  email: process.env.BREVO_SENDER_EMAIL || 'smpimarketing787@gmail.com'
},
```

---

### **Customize Email Template**

**File:** `src/lib/brevo.ts`

**Lines:** ~13-67

**Key sections to customize:**

1. **Header Title:**
```html
<h1>🎫 Your SMPI Voucher</h1>
<p>Thank you for claiming your voucher!</p>
```

2. **Greeting:**
```html
<p>Hi <strong>${fullName}</strong>,</p>
```

3. **Important Information:**
```html
<li>Valid until: <strong>${expiryDate}</strong></li>
<li>One-time use only</li>
<li>Present this code at any SMPI branch</li>
<li>Cannot be exchanged for cash</li>
```

4. **Redemption Instructions:**
```html
<ol>
  <li>Visit any SMPI branch</li>
  <li>Show this voucher code to the staff</li>
  <li>Enjoy your discount!</li>
</ol>
```

5. **Footer:**
```html
<p>© ${new Date().getFullYear()} SMPI. All rights reserved.</p>
```

---

### **Change Email Colors**

**File:** `src/lib/brevo.ts`

**Lines:** ~18-19

```css
.header { background: linear-gradient(135deg, #0058a9 0%, #003d75 100%); }
.voucher-code { color: #0058a9; }
```

**Change to your brand colors:**
```css
.header { background: linear-gradient(135deg, #YOUR_COLOR 0%, #YOUR_DARK_COLOR 100%); }
.voucher-code { color: #YOUR_COLOR; }
```

---

## 📊 Admin Dashboard

### **Add New Column to Vouchers Table**

**Step 1: Update Database Query**

**File:** `src/lib/db-direct.ts`

**Function:** `getVouchers()` (Line ~82)

```typescript
const vouchers = await db.execute(`
  SELECT v.*, c.fullName, c.email, c.phone, b.name as branchName
  FROM Voucher v
  JOIN Customer c ON v.customerId = c.id
  LEFT JOIN Branch b ON v.branchId = b.id
  ORDER BY v.createdAt DESC
`);
```

**Add new field to return:**
```typescript
return vouchers.rows.map((v: any) => ({
  id: v.id,
  code: v.code,
  status: v.status,
  createdAt: v.createdAt,
  expiresAt: v.expiresAt,
  usedAt: v.usedAt,
  customer: { fullName: v.fullName, email: v.email, phone: v.phone },
  branch: v.branchName ? { name: v.branchName } : null,
  // Add your new field here
  newField: v.newField
}));
```

**Step 2: Update Dashboard Table**

**File:** `src/app/gate/v9x3k7m2q8/dashboard/page.tsx`

**Line:** ~360 (table header)

```typescript
<thead>
  <tr>
    <th>Code</th>
    <th>Customer</th>
    <th>Email</th>
    <th>Status</th>
    <th>Branch</th>
    <th>Created</th>
    <th>Expires</th>
    <th>New Column</th>  {/* Add this */}
  </tr>
</thead>
```

**Line:** ~370 (table body)

```typescript
<tbody>
  {filteredVouchers.map(v => (
    <tr key={v.id}>
      <td><code className={styles.code}>{v.code}</code></td>
      <td>{v.customer.fullName}</td>
      <td className={styles.email}>{v.customer.email}</td>
      <td>
        <span className={`${styles.badge} ${styles[v.status.toLowerCase()]}`}>
          {v.status}
        </span>
      </td>
      <td>{v.branch?.name || '-'}</td>
      <td>{new Date(v.createdAt).toLocaleDateString()}</td>
      <td>{v.expiresAt ? new Date(v.expiresAt).toLocaleDateString() : '-'}</td>
      <td>{v.newField || '-'}</td>  {/* Add this */}
    </tr>
  ))}
</tbody>
```

**Step 3: Update Database Viewer**

**File:** `src/app/gate/v9x3k7m2q8/database/page.tsx`

Follow same steps as dashboard (Lines ~120 and ~135)

---

### **Add New Stat Card**

**File:** `src/app/gate/v9x3k7m2q8/dashboard/page.tsx`

**Line:** ~200 (after existing stat cards)

```typescript
<div className={styles.statCard}>
  <div className={styles.statIcon}>📈</div>  {/* Your icon */}
  <div className={styles.statContent}>
    <p className={styles.statLabel}>Your Label</p>
    <p className={styles.statValue}>{yourValue}</p>
  </div>
</div>
```

**Available icons:**
- 🎫 Vouchers
- ✅ Success
- ⚡ Active
- 📊 Analytics
- 💰 Revenue
- 👥 Customers
- 🏪 Branches
- 📈 Growth

---

### **Change Default Cleanup Period**

**File:** `src/app/gate/v9x3k7m2q8/dashboard/page.tsx`

**Line:** ~20

```typescript
const [cleanupMonths, setCleanupMonths] = useState('3');
```

**Change to:**
```typescript
const [cleanupMonths, setCleanupMonths] = useState('6');  // 6 months
const [cleanupMonths, setCleanupMonths] = useState('12'); // 1 year
```

---

## 🗄️ Database Schema

### **Add New Field to Voucher**

**Step 1: Update Prisma Schema**

**File:** `prisma/schema.prisma`

**Line:** ~17 (Voucher model)

```prisma
model Voucher {
  id         String    @id @default(cuid())
  code       String    @unique
  customerId String    @unique
  customer   Customer  @relation(fields: [customerId], references: [id])
  status     String    @default("ACTIVE")
  usedAt     DateTime?
  branchId   String?
  branch     Branch?   @relation(fields: [branchId], references: [id])
  createdAt  DateTime  @default(now())
  expiresAt  DateTime
  // Add your new field here
  newField   String?   // Optional field
  discount   Int?      // Discount percentage
  category   String?   // Voucher category
}
```

**Step 2: Push Schema Changes**

```bash
npx prisma db push
```

**Step 3: Update Create Voucher Function**

**File:** `src/lib/db-direct.ts`

**Line:** ~44 (INSERT statement)

```typescript
await db.execute({
  sql: 'INSERT INTO Voucher (id, code, customerId, status, createdAt, expiresAt, newField) VALUES (?, ?, ?, ?, ?, ?, ?)',
  args: [voucherId, code, customerId, 'ACTIVE', now, expiresAt, 'defaultValue']
});
```

---

### **Add New Field to Customer**

**Step 1: Update Prisma Schema**

**File:** `prisma/schema.prisma`

**Line:** ~8 (Customer model)

```prisma
model Customer {
  id        String   @id @default(cuid())
  fullName  String
  email     String   @unique
  phone     String
  createdAt DateTime @default(now())
  voucher   Voucher?
  // Add your new field here
  address   String?
  city      String?
  birthdate DateTime?
}
```

**Step 2: Update Claim Form**

**File:** `src/app/claim/page.tsx`

Add new input field (Line ~100):

```typescript
<input
  type="text"
  placeholder="Address"
  value={formData.address}
  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
  className={styles.input}
/>
```

**Step 3: Update API**

**File:** `src/app/api/voucher/claim/route.ts`

Update to accept new field (Line ~8):

```typescript
const { fullName, email, phone, address } = await req.json();
```

---

## ✅ Validation Rules

### **Change Phone Number Format**

**File:** `src/app/claim/page.tsx`

**Line:** ~18

```typescript
const validatePhone = (phone: string) => {
  return /^09\d{9}$/.test(phone);  // Philippine format
};
```

**Change to:**
```typescript
// US format: (123) 456-7890
const validatePhone = (phone: string) => {
  return /^\(\d{3}\) \d{3}-\d{4}$/.test(phone);
};

// International: +63 912 345 6789
const validatePhone = (phone: string) => {
  return /^\+\d{2} \d{3} \d{3} \d{4}$/.test(phone);
};

// Any 10-11 digits
const validatePhone = (phone: string) => {
  return /^\d{10,11}$/.test(phone);
};
```

---

### **Change Allowed Email Domains**

**File:** `src/lib/email-validator.ts`

**Line:** ~2

```typescript
const allowedDomains = [
  'gmail.com',
  'yahoo.com',
  'yahoo.co.uk',
  // ... more yahoo domains
];
```

**Add more domains:**
```typescript
const allowedDomains = [
  'gmail.com',
  'yahoo.com',
  'outlook.com',
  'hotmail.com',
  'icloud.com',
  'protonmail.com',
  'company.com',  // Your company domain
];
```

**Or allow all domains:**
```typescript
// Remove domain check entirely
export function validateEmail(email: string): { valid: boolean; error?: string } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }
  return { valid: true };
}
```

---

## 🎨 UI Customization

### **Change Brand Colors**

**File:** `src/app/globals.css`

**Line:** ~1

```css
:root {
  --primary: #0058a9;        /* Blue */
  --secondary: #fdd802;      /* Yellow */
  --accent: #ea2429;         /* Red */
  --primary-dark: #003d75;
  --secondary-dark: #e5c402;
}
```

**Change to your colors:**
```css
:root {
  --primary: #YOUR_PRIMARY_COLOR;
  --secondary: #YOUR_SECONDARY_COLOR;
  --accent: #YOUR_ACCENT_COLOR;
  --primary-dark: #YOUR_DARK_PRIMARY;
  --secondary-dark: #YOUR_DARK_SECONDARY;
}
```

---

### **Change Landing Page Text**

**File:** `src/app/page.tsx`

**Line:** ~20

```typescript
<h1>Welcome to SMPI Voucher System</h1>
<p>Claim your exclusive voucher today!</p>
```

**Change to:**
```typescript
<h1>Your Custom Title</h1>
<p>Your custom description here</p>
```

---

### **Change Claim Page Text**

**File:** `src/app/claim/page.tsx`

**Line:** ~95

```typescript
<h1>Claim Your Voucher</h1>
<p className={styles.subtitle}>Fill in your details to receive your voucher code via email</p>
```

---

### **Change Button Text**

**Claim Button:**

**File:** `src/app/claim/page.tsx`

**Line:** ~125

```typescript
<button type="submit" disabled={loading} className={styles.btn}>
  {loading ? 'Sending...' : 'Claim Voucher'}
</button>
```

**Change to:**
```typescript
{loading ? 'Processing...' : 'Get My Code'}
{loading ? 'Please wait...' : 'Claim Now'}
{loading ? 'Submitting...' : 'Submit'}
```

---

## ⏱️ Rate Limiting

### **Change Rate Limit Settings**

**File:** `src/app/api/voucher/claim/route.ts`

**IP Rate Limit (Line ~28):**
```typescript
const ipRateLimit = checkRateLimit(`ip:${ip}`, 5, 60 * 60 * 1000); // 5 requests per hour
```

**Change to:**
```typescript
// 10 requests per hour
const ipRateLimit = checkRateLimit(`ip:${ip}`, 10, 60 * 60 * 1000);

// 3 requests per 30 minutes
const ipRateLimit = checkRateLimit(`ip:${ip}`, 3, 30 * 60 * 1000);

// 20 requests per day
const ipRateLimit = checkRateLimit(`ip:${ip}`, 20, 24 * 60 * 60 * 1000);
```

**Email Rate Limit (Line ~39):**
```typescript
const emailRateLimit = checkRateLimit(`email:${normalizedEmail}`, 1, 24 * 60 * 60 * 1000); // 1 per day
```

**Change to:**
```typescript
// 1 per week
const emailRateLimit = checkRateLimit(`email:${normalizedEmail}`, 1, 7 * 24 * 60 * 60 * 1000);

// 2 per day
const emailRateLimit = checkRateLimit(`email:${normalizedEmail}`, 2, 24 * 60 * 60 * 1000);

// 1 per month
const emailRateLimit = checkRateLimit(`email:${normalizedEmail}`, 1, 30 * 24 * 60 * 60 * 1000);
```

---

## 🏪 Branch Management

### **Add New Branch**

**Method 1: Via Database Seed**

**File:** `prisma/seed.js`

**Line:** ~22

```javascript
const branches = [
  'Main Branch', 
  'Downtown Branch', 
  'Mall Branch', 
  'Airport Branch',
  'North Branch', 
  'South Branch', 
  'East Branch', 
  'West Branch',
  'Your New Branch'  // Add here
];
```

Run: `node prisma/seed.js`

**Method 2: Via SQL**

```sql
INSERT INTO Branch (id, name, location) 
VALUES ('new-branch-id', 'New Branch Name', 'Branch Location');
```

---

### **Remove Branch**

**Warning:** Only remove branches with no voucher redemptions

```sql
-- Check if branch has vouchers
SELECT COUNT(*) FROM Voucher WHERE branchId = 'branch-id';

-- If count is 0, safe to delete
DELETE FROM Branch WHERE id = 'branch-id';
```

---

## 🔐 Admin Configuration

### **Change Admin URL**

**Current:** `/gate/v9x3k7m2q8`

**Files to update:**

1. **Rename folder:**
   - From: `src/app/gate/v9x3k7m2q8/`
   - To: `src/app/gate/YOUR_SECRET_PATH/`

2. **Update redirects in:**
   - `src/app/gate/v9x3k7m2q8/dashboard/page.tsx` (Line ~38)
   - `src/app/gate/v9x3k7m2q8/database/page.tsx` (Line ~31)
   - `src/middleware.ts` (if protected)

3. **Update links:**
   - Search for `/gate/v9x3k7m2q8` in all files
   - Replace with `/gate/YOUR_SECRET_PATH`

---

### **Change Admin Credentials**

**File:** `prisma/seed.js`

**Line:** ~8

```javascript
const hashedPassword = await bcrypt.hash('admin123', 10);
```

**Change to:**
```javascript
const hashedPassword = await bcrypt.hash('YOUR_NEW_PASSWORD', 10);
```

**Also change username (Line ~14):**
```javascript
db.prepare('INSERT INTO Admin (id, username, password) VALUES (?, ?, ?)').run(adminId, 'YOUR_USERNAME', hashedPassword);
```

Run: `node prisma/seed.js`

---

## 📝 Quick Reference

### **Common File Locations**

| What to Change | File Location |
|----------------|---------------|
| Voucher prefix | `src/lib/db-direct.ts` (Line 26) |
| Voucher expiry | `src/lib/db-direct.ts` (Line 27) |
| Email template | `src/lib/brevo.ts` (Lines 13-67) |
| Email subject | `src/lib/brevo.ts` (Line 75) |
| Phone validation | `src/app/claim/page.tsx` (Line 18) |
| Email domains | `src/lib/email-validator.ts` (Line 2) |
| Rate limits | `src/app/api/voucher/claim/route.ts` (Lines 28, 39) |
| Brand colors | `src/app/globals.css` (Line 1) |
| Landing page text | `src/app/page.tsx` (Line 20) |
| Claim page text | `src/app/claim/page.tsx` (Line 95) |
| Admin password | `prisma/seed.js` (Line 8) |
| Branches | `prisma/seed.js` (Line 22) |

---

## 🚀 After Making Changes

### **1. Test Locally**
```bash
npm run dev
```

### **2. Commit Changes**
```bash
git add .
git commit -m "Your change description"
git push
```

### **3. Verify Deployment**
- Check Vercel deployment logs
- Test the changed functionality
- Verify database changes (if any)

---

## ⚠️ Important Notes

1. **Always backup database before schema changes**
2. **Test changes locally first**
3. **Update environment variables in Vercel after changes**
4. **Redeploy after env var changes**
5. **Document your customizations**
6. **Keep original values commented for reference**

---

## 🆘 Need Help?

If you're unsure about a change:
1. Search for the text/value you want to change in all files
2. Check related files in the same directory
3. Test in development before deploying
4. Keep a backup of original code

---

**Last Updated:** 2024
**Version:** 1.0
