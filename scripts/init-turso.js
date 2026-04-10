require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@libsql/client/http');
const bcrypt = require('bcryptjs');

async function init() {
  const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  // Create tables
  await db.execute(`
    CREATE TABLE IF NOT EXISTS Customer (
      id TEXT PRIMARY KEY,
      fullName TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT NOT NULL,
      createdAt TEXT NOT NULL
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS Branch (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      location TEXT
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS Voucher (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      customerId TEXT UNIQUE NOT NULL,
      status TEXT DEFAULT 'ACTIVE',
      usedAt TEXT,
      branchId TEXT,
      createdAt TEXT NOT NULL,
      expiresAt TEXT NOT NULL,
      FOREIGN KEY (customerId) REFERENCES Customer(id),
      FOREIGN KEY (branchId) REFERENCES Branch(id)
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS Admin (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS VoucherLimit (
      id INTEGER PRIMARY KEY,
      maxVouchers INTEGER NOT NULL,
      currentCount INTEGER DEFAULT 0
    )
  `);

  // Seed admin
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await db.execute({
    sql: 'INSERT OR IGNORE INTO Admin (id, username, password) VALUES (?, ?, ?)',
    args: ['admin_1', 'admin', hashedPassword]
  });

  // Seed branches
  const branches = [
    'Main Branch', 'Downtown Branch', 'Mall Branch', 'Airport Branch',
    'North Branch', 'South Branch', 'East Branch', 'West Branch'
  ];

  for (const name of branches) {
    const id = name.toLowerCase().replace(/\s+/g, '-');
    await db.execute({
      sql: 'INSERT OR IGNORE INTO Branch (id, name, location) VALUES (?, ?, ?)',
      args: [id, name, `${name} Location`]
    });
  }

  // Initialize voucher limit
  await db.execute({
    sql: 'INSERT OR IGNORE INTO VoucherLimit (id, maxVouchers, currentCount) VALUES (1, 100, 0)',
    args: []
  });

  console.log('✅ Turso database initialized!');
}

init().catch(console.error);