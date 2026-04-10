# 🎫 SMPI Voucher System

A full-stack voucher management system built with Next.js, featuring customer voucher claims, admin dashboard, and analytics.

## ✨ Features

### Customer Features
- 🎯 Landing page with hero background
- 📝 Voucher claim form with validation
- ✅ Instant voucher code generation (SMPI-XXXXXX format)
- 📧 Email validation (one voucher per email)
- ⏰ 30-day voucher expiration

### Admin Features
- 🔐 Secure admin login (hidden URL: `/gate/v9x3k7m2q8`)
- 📊 Real-time analytics dashboard
- 📈 Charts (Bar chart & Pie chart)
- 🎯 Set voucher issuance limits
- 🔓 Redeem vouchers by branch
- 🗑️ Cleanup old data (3+ months)
- 🗄️ Database viewer
- 🔍 Search and filter vouchers

## 🎨 Design

- **Primary Color:** #0058a9 (Blue)
- **Secondary Color:** #fdd802 (Yellow)
- **Accent Color:** #ea2429 (Red)
- **Glassmorphism UI** with backdrop blur effects
- **Responsive design** for mobile and desktop

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** SQLite + better-sqlite3
- **ORM:** Prisma
- **Authentication:** JWT (jose)
- **Charts:** Recharts
- **Styling:** CSS Modules

## 📦 Installation

```bash
# Clone repository
git clone <your-repo-url>
cd voucher

# Install dependencies
npm install

# Setup database
npm run db:push
npm run db:seed

# Run development server
npm run dev
```

Visit http://localhost:3000

## 🔑 Default Credentials

- **Username:** admin
- **Password:** admin123
- **Admin URL:** http://localhost:3000/gate/v9x3k7m2q8

⚠️ **Change these in production!**

## 📁 Project Structure

```
voucher/
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   ├── claim/            # Voucher claim page
│   │   ├── gate/v9x3k7m2q8/  # Admin dashboard
│   │   └── page.tsx          # Landing page
│   ├── lib/
│   │   ├── db-direct.ts      # Database operations
│   │   └── session.ts        # Authentication
│   └── middleware.ts         # Security middleware
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.js               # Database seeding
├── public/
│   └── images/               # Images folder
├── DEPLOYMENT.md             # Deployment guide
└── SETUP.md                  # Setup instructions
```

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment guide.

**Recommended:** Railway + SQLite ($10-15/month)

## 🗄️ Database Schema

- **Customer** - Customer information
- **Voucher** - Voucher codes and status
- **Branch** - Branch locations
- **Admin** - Admin users
- **VoucherLimit** - Issuance limits

## 📊 Features Breakdown

### Voucher Management
- Generate unique SMPI-XXXXXX codes
- Track status (ACTIVE/USED)
- Set issuance limits
- Automatic expiration (30 days)
- Branch-based redemption

### Analytics
- Total issued vouchers
- Redemption count
- Active vouchers
- Conversion rate
- Branch performance

### Data Management
- Cleanup old data (3+ months)
- Database viewer
- Search functionality
- Export capabilities

## 🔒 Security

- Hidden admin URL
- JWT-based authentication
- HTTP-only cookies
- Session management
- Input validation
- SQL injection protection

## 📝 Environment Variables

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-here"
NODE_ENV="development"
```

## 🧪 Testing

```bash
# Run development server
npm run dev

# Test voucher claim
# Visit: http://localhost:3000/claim

# Test admin dashboard
# Visit: http://localhost:3000/gate/v9x3k7m2q8
```

## 📈 Scalability

- **Current:** Handles 100K+ vouchers with SQLite
- **Storage:** ~500-800 bytes per voucher
- **Performance:** Optimized queries with indexes
- **Migration:** Easy upgrade to PostgreSQL if needed

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## 📄 License

Private - SMPI Internal Use

## 🆘 Support

For issues or questions:
1. Check [DEPLOYMENT.md](./DEPLOYMENT.md)
2. Check [SETUP.md](./SETUP.md)
3. Review error logs
4. Contact development team

## 🎯 Roadmap

- [ ] Email notifications
- [ ] QR code generation
- [ ] Bulk voucher import
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Mobile app

---

**Built with ❤️ for SMPI**
