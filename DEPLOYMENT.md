# 🚀 Deployment Guide - SMPI Voucher System

## 📊 Database Decision: SQLite vs PostgreSQL

### ✅ **Keep SQLite if:**
- Expected vouchers: < 100,000 per year
- Single server deployment
- Budget-conscious
- Simple maintenance preferred
- Low to medium traffic (< 1000 concurrent users)

### 🔄 **Migrate to PostgreSQL if:**
- Expected vouchers: > 100,000 per year
- Multiple servers/regions needed
- High concurrent users (> 1000)
- Need advanced features (replication, clustering)
- Enterprise-grade reliability required

**Recommendation for SMPI:** Start with SQLite, migrate later if needed. It's production-ready!

---

## 🎯 Recommended Deployment Stack

### **Option 1: Vercel (Easiest - Recommended)**

**Pros:**
- ✅ Zero configuration
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Free tier available
- ✅ Perfect for Next.js
- ✅ Auto-scaling

**Cons:**
- ❌ SQLite needs workaround (use Turso/Vercel Postgres)
- ❌ Serverless limitations

**Cost:** Free for small projects, $20/month Pro

**Steps:**
1. Push code to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy (automatic)

**Database Options for Vercel:**
- **Turso** (SQLite-compatible, serverless) - $0-29/month
- **Vercel Postgres** - $0.25/month + usage
- **Neon** (Serverless Postgres) - Free tier available

---

### **Option 2: Railway (Best for SQLite)**

**Pros:**
- ✅ Native SQLite support
- ✅ Persistent storage
- ✅ Simple deployment
- ✅ Built-in database backups
- ✅ No serverless limitations

**Cons:**
- ❌ Costs more than Vercel free tier
- ❌ Manual scaling

**Cost:** $5/month + usage (~$10-20/month total)

**Steps:**
1. Push code to GitHub
2. Create Railway project
3. Connect GitHub repo
4. Add environment variables
5. Deploy

---

### **Option 3: DigitalOcean App Platform**

**Pros:**
- ✅ Full control
- ✅ Persistent storage
- ✅ Predictable pricing
- ✅ Good for SQLite

**Cons:**
- ❌ More expensive
- ❌ Manual setup

**Cost:** $12/month minimum

---

### **Option 4: VPS (Most Control)**

**Providers:** DigitalOcean, Linode, Vultr, AWS Lightsail

**Pros:**
- ✅ Full control
- ✅ Best for SQLite
- ✅ Can run anything
- ✅ Predictable costs

**Cons:**
- ❌ Manual server management
- ❌ Need DevOps knowledge
- ❌ Manual SSL setup

**Cost:** $5-10/month

---

## 🏆 **RECOMMENDED DEPLOYMENT PLAN FOR SMPI**

### **Phase 1: Initial Launch (0-10K vouchers)**

**Platform:** Railway
**Database:** SQLite (current setup)
**Cost:** ~$10-15/month

**Why:**
- Keep current SQLite setup (no migration needed)
- Simple deployment
- Persistent storage
- Easy backups
- Room to grow

### **Phase 2: Growth (10K-100K vouchers)**

**Platform:** Railway or DigitalOcean
**Database:** SQLite (still works!)
**Cost:** ~$20-30/month

**Optimizations:**
- Enable automatic cleanup (3-6 months)
- Add database backups
- Monitor performance

### **Phase 3: Scale (100K+ vouchers)**

**Platform:** Vercel + Managed Database
**Database:** Migrate to PostgreSQL (Neon/Supabase)
**Cost:** ~$50-100/month

**Migration needed:**
- Update Prisma schema
- Migrate data
- Update connection strings

---

## 📋 Deployment Checklist

### **Pre-Deployment**

- [ ] Change admin password from default
- [ ] Update JWT_SECRET in .env
- [ ] Set voucher limit
- [ ] Test all features locally
- [ ] Add hero.jpg background image
- [ ] Update branch names in seed
- [ ] Remove test data

### **Environment Variables**

```env
# Production .env
DATABASE_URL="file:./prod.db"  # For SQLite
JWT_SECRET="your-super-secret-key-here-min-32-chars"
NODE_ENV="production"
```

### **For PostgreSQL (if migrating):**

```env
DATABASE_URL="postgresql://user:password@host:5432/dbname"
JWT_SECRET="your-super-secret-key-here"
NODE_ENV="production"
```

---

## 🚀 Quick Deploy to Railway (Recommended)

### **Step 1: Prepare Code**

```bash
# Add to .gitignore
echo "dev.db" >> .gitignore
echo "*.db" >> .gitignore
echo ".env.local" >> .gitignore

# Commit changes
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### **Step 2: Deploy to Railway**

1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your voucher repo
5. Railway auto-detects Next.js

### **Step 3: Configure**

1. Add environment variables:
   - `JWT_SECRET`: Generate at https://randomkeygen.com/
   - `DATABASE_URL`: `file:./prod.db`

2. Add start command:
   ```
   npm run db:push && npm run db:seed && npm start
   ```

3. Deploy!

### **Step 4: Setup Domain**

1. Railway provides: `your-app.railway.app`
2. Add custom domain (optional): `vouchers.smpi.com`

---

## 🔄 Database Migration Guide (SQLite → PostgreSQL)

### **When to Migrate:**
- More than 100K vouchers
- Need multiple servers
- High concurrent users

### **Migration Steps:**

1. **Update Prisma Schema:**
```prisma
datasource db {
  provider = "postgresql"  // Changed from sqlite
}
```

2. **Export SQLite Data:**
```bash
node scripts/export-data.js
```

3. **Import to PostgreSQL:**
```bash
node scripts/import-data.js
```

4. **Update Connection:**
```env
DATABASE_URL="postgresql://..."
```

5. **Test & Deploy**

---

## 📊 Monitoring & Maintenance

### **Weekly:**
- Check voucher count
- Monitor database size
- Review error logs

### **Monthly:**
- Run cleanup (delete old data)
- Backup database
- Check performance

### **Quarterly:**
- Review analytics
- Optimize queries
- Update dependencies

---

## 💾 Backup Strategy

### **Automated Backups:**

```bash
# Add to cron (daily at 2 AM)
0 2 * * * cp /path/to/prod.db /path/to/backups/prod-$(date +\%Y\%m\%d).db
```

### **Manual Backup:**

```bash
# Download from Railway
railway run cp prod.db backup.db
railway run cat backup.db > local-backup.db
```

---

## 🔒 Security Checklist

- [ ] Change default admin password
- [ ] Use strong JWT_SECRET (32+ characters)
- [ ] Enable HTTPS (automatic on Railway/Vercel)
- [ ] Hide admin URL (already done: /gate/v9x3k7m2q8)
- [ ] Rate limit API routes (optional)
- [ ] Regular security updates

---

## 💰 Cost Comparison

| Platform | Monthly Cost | Best For |
|----------|-------------|----------|
| Railway | $10-20 | SQLite, Simple |
| Vercel + Turso | $0-29 | Serverless, Scale |
| DigitalOcean | $12-25 | Full Control |
| VPS | $5-15 | DIY, Cheapest |

---

## 🎯 Final Recommendation

**For SMPI Voucher System:**

1. **Start:** Railway + SQLite ($10-15/month)
2. **Grow:** Same setup, enable cleanup
3. **Scale:** Migrate to PostgreSQL only if needed

**Why Railway:**
- No code changes needed
- SQLite works perfectly
- Easy backups
- Simple deployment
- Room to grow

**Next Steps:**
1. Push to GitHub
2. Deploy to Railway
3. Add environment variables
4. Test production
5. Go live! 🚀

---

## 📞 Support Resources

- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- Prisma Docs: https://www.prisma.io/docs
- Next.js Docs: https://nextjs.org/docs

---

**Need help?** Check the deployment logs or contact your DevOps team.
