const db = require('./db');
db.query('SELECT DISTINCT role FROM users')
  .then(results => {
    console.log(JSON.stringify(results, null, 2));
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
