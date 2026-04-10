const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const { nanoid } = require('nanoid');

const db = new Database('./dev.db');

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminId = `admin_${nanoid(10)}`;
  
  // Insert admin
  const adminExists = db.prepare('SELECT * FROM Admin WHERE username = ?').get('admin');
  if (!adminExists) {
    db.prepare('INSERT INTO Admin (id, username, password) VALUES (?, ?, ?)').run(adminId, 'admin', hashedPassword);
    console.log('✅ Created admin user');
  } else {
    console.log('ℹ️  Admin already exists');
  }

  // Insert branches
  const branches = [
    'Main Branch', 'Downtown Branch', 'Mall Branch', 'Airport Branch',
    'North Branch', 'South Branch', 'East Branch', 'West Branch'
  ];

  for (const name of branches) {
    const branchId = name.toLowerCase().replace(/\s+/g, '-');
    const exists = db.prepare('SELECT * FROM Branch WHERE id = ?').get(branchId);
    if (!exists) {
      db.prepare('INSERT INTO Branch (id, name, location) VALUES (?, ?, ?)').run(branchId, name, `${name} Location`);
    }
  }

  console.log('✅ Seeded 8 branches');
}

main()
  .catch(console.error)
  .finally(() => db.close());
