const db = require('./db');

async function checkTables() {
  try {
    const tables = await db.query('SHOW TABLES');
    console.log('Tables in database:', tables);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkTables();
