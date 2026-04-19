const db = require('./db');

async function checkSchema() {
  try {
    const tables = await db.query('SHOW TABLES');
    console.log('Tables:', tables);
    
    const columns = await db.query('DESCRIBE cleaned_smart_stock');
    console.log('Columns in cleaned_smart_stock:', columns);
    
    // Check for any pricing info
    const sample = await db.query('SELECT * FROM cleaned_smart_stock LIMIT 1');
    console.log('Sample row:', sample);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkSchema();
