const db = require('./db');

async function migrate() {
  try {
    console.log("Starting database migration...");
    
    // 1. Update Role Enum to include 'admin'
    const alterRoleSql = "ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'store1', 'store2', 'store3', 'store4') DEFAULT 'store1'";
    await db.query(alterRoleSql);
    console.log("✅ Role enum updated successfully.");

    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  }
}

migrate();
