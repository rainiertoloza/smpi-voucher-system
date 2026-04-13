import { createClient } from '@libsql/client/http';
import { nanoid } from 'nanoid';

function getDatabase() {
  return createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });
}

export const dbDirect = {
  async createVoucher(fullName: string, email: string, phone: string) {
    const db = getDatabase();
    
    // Check voucher limit
    const limit = await db.execute('SELECT * FROM VoucherLimit WHERE id = 1');
    if (limit.rows.length > 0) {
      const limitRow = limit.rows[0] as any;
      if (limitRow.currentCount >= limitRow.maxVouchers) {
        throw new Error('Voucher limit reached. No more vouchers can be issued.');
      }
    }

    const customerId = `cust_${nanoid(10)}`;
    const voucherId = `vouch_${nanoid(10)}`;
    const code = `SMPI-${nanoid(6).toUpperCase()}`;
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const now = new Date().toISOString();

    const existing = await db.execute({
      sql: 'SELECT * FROM Customer WHERE email = ?',
      args: [email]
    });
    
    if (existing.rows.length > 0) {
      throw new Error('🚫 This email has already been used to claim a voucher.');
    }

    await db.execute({
      sql: 'INSERT INTO Customer (id, fullName, email, phone, createdAt) VALUES (?, ?, ?, ?, ?)',
      args: [customerId, fullName, email, phone, now]
    });

    await db.execute({
      sql: 'INSERT INTO Voucher (id, code, customerId, status, createdAt, expiresAt) VALUES (?, ?, ?, ?, ?, ?)',
      args: [voucherId, code, customerId, 'ACTIVE', now, expiresAt]
    });

    await db.execute('UPDATE VoucherLimit SET currentCount = currentCount + 1 WHERE id = 1');

    return code;
  },

  async getAnalytics() {
    const db = getDatabase();
    
    const total = await db.execute('SELECT COUNT(*) as count FROM Voucher');
    const redeemed = await db.execute("SELECT COUNT(*) as count FROM Voucher WHERE status = 'USED'");
    const active = await db.execute("SELECT COUNT(*) as count FROM Voucher WHERE status = 'ACTIVE'");

    const byBranch = await db.execute(`
      SELECT b.name, COUNT(v.id) as count 
      FROM Branch b 
      LEFT JOIN Voucher v ON v.branchId = b.id AND v.status = 'USED'
      GROUP BY b.id, b.name
    `);

    const totalCount = (total.rows[0] as any).count;
    const redeemedCount = (redeemed.rows[0] as any).count;
    const activeCount = (active.rows[0] as any).count;

    return {
      total: totalCount,
      redeemed: redeemedCount,
      active: activeCount,
      conversionRate: totalCount > 0 ? ((redeemedCount / totalCount) * 100).toFixed(1) : '0',
      branchData: byBranch.rows.map((row: any) => ({ name: row.name, count: row.count }))
    };
  },

  async getVouchers() {
    const db = getDatabase();
    
    const vouchers = await db.execute(`
      SELECT v.*, c.fullName, c.email, c.phone, b.name as branchName
      FROM Voucher v
      JOIN Customer c ON v.customerId = c.id
      LEFT JOIN Branch b ON v.branchId = b.id
      ORDER BY v.createdAt DESC
    `);

    return vouchers.rows.map((v: any) => ({
      id: v.id,
      code: v.code,
      status: v.status,
      createdAt: v.createdAt,
      expiresAt: v.expiresAt,
      usedAt: v.usedAt,
      customer: { fullName: v.fullName, email: v.email, phone: v.phone },
      branch: v.branchName ? { name: v.branchName } : null
    }));
  },

  async getBranches() {
    const db = getDatabase();
    const result = await db.execute('SELECT * FROM Branch');
    return result.rows;
  },

  async redeemVoucher(code: string, branchId: string) {
    const db = getDatabase();
    
    const voucher = await db.execute({
      sql: 'SELECT * FROM Voucher WHERE code = ?',
      args: [code]
    });
    
    if (voucher.rows.length === 0) throw new Error('Voucher not found');
    
    const voucherData = voucher.rows[0] as any;
    if (voucherData.status === 'USED') throw new Error('Already redeemed');

    const now = new Date().toISOString();
    await db.execute({
      sql: 'UPDATE Voucher SET status = ?, usedAt = ?, branchId = ? WHERE code = ?',
      args: ['USED', now, branchId, code]
    });
  },

  async getAdmin(username: string) {
    const db = getDatabase();
    const result = await db.execute({
      sql: 'SELECT * FROM Admin WHERE username = ?',
      args: [username]
    });
    return result.rows[0] || null;
  },

  async getVoucherLimit() {
    const db = getDatabase();
    const result = await db.execute('SELECT * FROM VoucherLimit WHERE id = 1');
    return result.rows[0] || { maxVouchers: 0, currentCount: 0 };
  },

  async setVoucherLimit(maxVouchers: number) {
    const db = getDatabase();
    await db.execute({
      sql: 'UPDATE VoucherLimit SET maxVouchers = ? WHERE id = 1',
      args: [maxVouchers]
    });
  },

  async cleanupOldData(monthsAgo: number) {
    const db = getDatabase();
    
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - monthsAgo);
    const cutoffISO = cutoffDate.toISOString();

    const vouchersToDelete = await db.execute({
      sql: 'SELECT id, customerId FROM Voucher WHERE createdAt < ?',
      args: [cutoffISO]
    });

    if (vouchersToDelete.rows.length === 0) {
      return { deleted: 0, message: 'No old data found' };
    }

    await db.execute({
      sql: 'DELETE FROM Voucher WHERE createdAt < ?',
      args: [cutoffISO]
    });

    for (const row of vouchersToDelete.rows) {
      const v = row as any;
      await db.execute({
        sql: 'DELETE FROM Customer WHERE id = ?',
        args: [v.customerId]
      });
    }

    const currentCount = await db.execute('SELECT COUNT(*) as count FROM Voucher');
    await db.execute({
      sql: 'UPDATE VoucherLimit SET currentCount = ? WHERE id = 1',
      args: [(currentCount.rows[0] as any).count]
    });

    await db.execute('VACUUM');

    return { 
      deleted: vouchersToDelete.rows.length, 
      message: `Deleted ${vouchersToDelete.rows.length} vouchers older than ${monthsAgo} months` 
    };
  },

  async deleteVoucher(voucherId: string) {
    const db = getDatabase();
    
    const voucher = await db.execute({
      sql: 'SELECT customerId FROM Voucher WHERE id = ?',
      args: [voucherId]
    });
    
    if (voucher.rows.length === 0) throw new Error('Voucher not found');
    
    const customerId = (voucher.rows[0] as any).customerId;
    
    await db.execute({
      sql: 'DELETE FROM Voucher WHERE id = ?',
      args: [voucherId]
    });
    
    await db.execute({
      sql: 'DELETE FROM Customer WHERE id = ?',
      args: [customerId]
    });
    
    await db.execute('UPDATE VoucherLimit SET currentCount = currentCount - 1 WHERE id = 1');
  }
};