// db.js
const mysql = require('mysql2');
const util = require('util'); // ✅ Add this
require('dotenv').config();
const db = mysql.createConnection({
  user:process.env.DB_USER,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// ✅ Add promise support for async/await
db.query = util.promisify(db.query).bind(db);

module.exports = db;
