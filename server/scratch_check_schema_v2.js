const db = require('./db');
require('dotenv').config();

async function checkSchema() {
  try {
    const results = await db.query('DESCRIBE cleaned_smart_stock');
    console.log(JSON.stringify(results, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkSchema();
