# 🔧 Fix "Page Couldn't Load" Error

## Problem
The dashboard shows "This page couldn't load" because **environment variables are missing** in Vercel.

## Solution: Add Environment Variables to Vercel

### Step 1: Go to Vercel Dashboard
Visit: https://vercel.com/rainiertolozas-projects/voucher/settings/environment-variables

### Step 2: Add These 3 Variables

Click "Add New" for each variable:

#### Variable 1: TURSO_DATABASE_URL
```
Key: TURSO_DATABASE_URL
Value: libsql://smpi-voucher-rainiertoloza.aws-ap-northeast-1.turso.io
Environments: ✅ Production ✅ Preview ✅ Development
```

#### Variable 2: TURSO_AUTH_TOKEN
```
Key: TURSO_AUTH_TOKEN
Value: eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NzU2MTE2MjMsImlkIjoiMDE5ZDZhYjItNzMwMS03OTM2LThiOTMtNDM5ZWJmZGE5YjJkIiwicmlkIjoiMjExNDk3NWEtNmRiYS00ZDkzLTg1MDEtOTE0YzhkYmQ0YmM1In0.x-Bgk3PLNJnRTwt9E4h9UAn9-UTtdM1c4Si90AkWejrdZdgqLLAYNTWtoSacsH0ISiL5akbEsh4EhaupoLwMDg
Environments: ✅ Production ✅ Preview ✅ Development
```

#### Variable 3: JWT_SECRET
```
Key: JWT_SECRET
Value: smpi-voucher-system-secret-key-2024-production
Environments: ✅ Production ✅ Preview ✅ Development
```

### Step 3: Redeploy
After adding all 3 variables, you have 2 options:

**Option A: Automatic (Recommended)**
- Vercel will automatically redeploy when you save the environment variables
- Wait 1-2 minutes for the deployment to complete

**Option B: Manual**
- Go to: https://vercel.com/rainiertolozas-projects/voucher
- Click "Redeploy" button
- Or run: `vercel --prod` from your terminal

### Step 4: Test
After redeployment completes:

1. Visit: https://smpi-voucher-sys.vercel.app/gate/v9x3k7m2q8
2. Login with:
   - Username: `admin`
   - Password: `admin123`
3. Dashboard should now load successfully!

## Why This Happens
- Vercel doesn't automatically copy environment variables from `.env.local`
- The app needs these variables to connect to Turso database
- Without them, all API calls fail, causing "page couldn't load" error

## Current Deployment URLs
- **Production:** https://smpi-voucher-sys.vercel.app
- **Admin Login:** https://smpi-voucher-sys.vercel.app/gate/v9x3k7m2q8
- **Claim Page:** https://smpi-voucher-sys.vercel.app/claim

## Verification
Once environment variables are added, you should see:
- ✅ Login page loads
- ✅ Login succeeds
- ✅ Dashboard loads with stats
- ✅ Voucher claim works
- ✅ Database viewer works

## Still Having Issues?
Check Vercel logs:
1. Go to: https://vercel.com/rainiertolozas-projects/voucher
2. Click on latest deployment
3. Click "Functions" tab
4. Look for error messages in the logs
