const db = require("../db");

exports.getInventory = (req, res) => {
  const { store, item } = req.query;

  const sql = `
    SELECT *
    FROM vw_smart_stock_analysis
    WHERE Warehouse_ID = ?
    AND Product_Name = ?
    ORDER BY Date DESC
    LIMIT 50
  `;

  db.query(sql, [store, item], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
};