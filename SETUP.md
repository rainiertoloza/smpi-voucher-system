# Voucher System - Setup & Run

## Initial Setup

1. Install tsx for running seed script:
```bash
npm install tsx --save-dev
```

2. Generate Prisma client:
```bash
npm run db:generate
```

3. Push database schema:
```bash
npm run db:push
```

4. Seed database with admin and branches:
```bash
npm run db:seed
```

## Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Default Admin Credentials

- Username: `admin`
- Password: `admin123`
- Admin URL: http://localhost:3000/gate/v9x3k7m2q8

## User Flow

1. Customer visits landing page → clicks "Get Started"
2. Fills claim form (name, email, phone)
3. Receives voucher code (format: VCH-XXXXXX)
4. Voucher expires in 30 days

## Admin Flow

1. Login at `/gate/v9x3k7m2q8`
2. View dashboard with analytics
3. Redeem vouchers by entering code + selecting branch
4. View all vouchers in table

## Features Implemented

✅ Landing page with CTA
✅ Claim form with validation
✅ Voucher generation (unique codes)
✅ Hidden admin dashboard (secret URL)
✅ Admin authentication with JWT
✅ Analytics (total, redeemed, active, conversion rate)
✅ Branch-based redemption tracking
✅ Chart visualization (recharts)
✅ Voucher table with status
✅ Security middleware (removes X-Powered-By)
✅ Session-based admin protection

## Database Schema

- Customer (id, fullName, email, phone, createdAt)
- Voucher (id, code, customerId, status, usedAt, branchId, createdAt, expiresAt)
- Branch (id, name, location)
- Admin (id, username, password)

## Next Steps

- Customize branch names in `prisma/seed.ts`
- Change admin password in production
- Update JWT_SECRET in `.env`
- Add email notifications (nodemailer already installed)
- Generate QR codes pointing to claim page
