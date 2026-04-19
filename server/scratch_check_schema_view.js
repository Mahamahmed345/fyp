const db = require('./db');

async function checkSchema() {
  try {
    const columns = await db.query('DESCRIBE vw_smart_stock_analysis');
    console.log('Columns in vw_smart_stock_analysis:', columns);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkSchema();
