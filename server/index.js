const express = require('express');
const cors = require('cors');
const http = require("http");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { exec } = require('child_process');
const fs = require('fs');
const csv = require("csv-parser");
const { spawn } = require("child_process");
const path = require('path');
const inventoryRoutes = require('./routes/inventoryRoutes');
require('dotenv').config();
const { verifyToken, authorizeRoles } = require('./middleware/authMiddleware');
require('./backupScheduler');
const auditRoutes = require("./routes/auditRoutes");
const db = require('./db');
const importExcelRoute = require('./routes/importExcelRoute');

const app = express();

app.use(express.json());
app.use(cors());
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

require("./socket")(io);

const JWT_SECRET = process.env.JWT_SECRET;
const backupDir = path.join(__dirname, 'backups');
if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);

app.get('/backup', (req, res) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filePath = path.join(backupDir, `backup-${timestamp}.sql`);
  const dumpCommand = `mysqldump -u ${process.env.DB_USER} ${process.env.DB_PASSWORD ? `-p${process.env.DB_PASSWORD}` : ''} -P ${process.env.DB_PORT} ${process.env.DB_NAME} > "${filePath}"`;
  exec(dumpCommand, (error) => {
    if (error) return res.status(500).json({ message: 'Backup failed', error });
    res.json({ message: 'Backup successful', file: `backup-${timestamp}.sql` });
  });
});


app.post("/api/predict", (req, res) => {
    const {store,item,stock,price}=req.body;
    const python = spawn("python", ["../ai/predict.py", store, item, stock, price]);
    let result = "";
    python.stdout.on("data", data => result += data.toString());
    python.on("close", () => res.json(JSON.parse(result || '{}')));
});

app.post('/signup', async (req, res) => {
  const { Email, Name, Password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(Password, 10);
    const SQL = 'INSERT INTO users (email, name, password , role) VALUES (?, ?, ?,?)';
    await db.query(SQL, [Email, Name, hashedPassword, role]);
    res.send({ message: 'User added!' });
  } catch (err) { 
    console.error("❌ Signup error:", err);
    res.status(500).send({ error: 'Signup failed' }); 
  }
});

app.post('/login', async (req, res) => {
  const { LoginEmail, LoginPassword } = req.body;
  try {
    const SQL = 'SELECT * FROM users WHERE email = ?';
    const users = await db.query(SQL, [LoginEmail]);
    if (users.length === 0) return res.status(401).send({ message: 'User not found' });
    const isMatch = await bcrypt.compare(LoginPassword, users[0].password);
    if (!isMatch) return res.status(401).send({ message: 'Invalid password' });
    const token = jwt.sign({ userId: users[0].id, email: users[0].email, role: users[0].role }, JWT_SECRET, { expiresIn: '1h' });
    res.send({ message: 'Login successful', token, user: { id: users[0].id, name: users[0].name, role: users[0].role } });
  } catch (err) { res.status(500).send({ error: 'Login failed' }); }
});

app.get('/store1-dashboard', verifyToken, authorizeRoles('store1'), (req, res) => res.json({ message: 'Welcome Admin Dashboard' }));
app.get('/store2-dashboard', verifyToken, authorizeRoles('store2'), (req, res) => res.json({ message: 'Welcome Manager Dashboard' }));
app.get('/store3-dashboard', verifyToken, authorizeRoles('store3'), (req, res) => res.json({ message: 'Welcome User Dashboard' }));
app.get('/store4-dashboard', verifyToken, authorizeRoles('store4'), (req, res) => res.json({ message: 'Welcome store4 Dashboard' }));

app.get('/protected', (req, res) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(403).send({ message: 'No token provided' });
  const token = authHeader.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).send({ message: 'Invalid token' });
    res.send({ message: 'Protected content accessed!', userId: decoded.userId });
  });
});

app.use("/api", auditRoutes);
app.use('/chat', require('./routes/chat'));
app.use("/StockData", inventoryRoutes);
app.use('/', importExcelRoute);


// ✅ STRATEGIC ANALYTICS ENDPOINT (TOP-LEVEL)
app.get("/strategic-intelligence", async (req, res) => {
    try {
        const query = `
            SELECT 
                Warehouse_ID as storeId,
                Category as category,
                SUM(Stock_Level) as stock,
                SUM(Units_Sold) as demand,
                AVG(Unit_Price) as avgPrice,
                SUM(fault_market_price + fault_dead_stock + fault_loss_sale + fault_revenue_gap) as anomalyCount,
                COUNT(*) as itemCount,
                MAX(Date) as lastSync
            FROM vw_smart_stock_analysis
            WHERE Date = (SELECT MAX(Date) FROM cleaned_smart_stock)
            GROUP BY Warehouse_ID, Category
        `;
        
        const results = await db.query(query);
        const rows = Array.isArray(results) ? results : (results[0] || []);
        
        let totalValuation = 0;
        let totalAnomalies = 0;
        let predictedStockouts = 0;
        let totalStock = 0;
        let totalDemand = 0;
        
        const detailedStats = rows.map(row => {
            const stock = parseFloat(row.stock || 0);
            const demand = parseFloat(row.demand || 0);
            const price = parseFloat(row.avgPrice || 0);
            const anomalies = parseInt(row.anomalyCount || 0);
            
            totalValuation += stock * price;
            totalAnomalies += anomalies;
            totalStock += stock;
            totalDemand += demand;
            
            if (demand > stock && demand > 0) predictedStockouts++;

            const dailyDemand = demand / 30 || 0; 
            const demand7d = Math.round(dailyDemand * 7);
            const daysOfCover = dailyDemand > 0 ? (stock / dailyDemand).toFixed(1) : "Inf.";

            let status = 'Healthy';
            if (demand > 0 && stock < (demand * 0.25)) status = 'Critical';
            else if (demand > 0 && stock < (demand * 0.50)) status = 'Reorder';
            else if (demand === 0) status = 'Dead Stock';

            return {
                ...row,
                name: row.storeId.includes('WH-') ? row.storeId.replace('WH-', 'Store ') : row.storeId,
                demand7d,
                daysOfCover,
                status,
                isDeadStock: demand === 0
            };
        });

        // Calculate Global Inventory Turnover
        const globalTurnover = totalStock > 0 ? (totalDemand / (totalStock / 30)) : 0;

        res.json({
            kpis: {
                totalValue: Math.round(totalValuation),
                predictedStockouts,
                totalAnomalies,
                inventoryTurnover: globalTurnover.toFixed(1) + "x",
                lastUpdate: new Date().toLocaleTimeString()
            },
            inventoryAudit: detailedStats
        });
    } catch (err) {
        console.error("❌ Strategic Intelligence Error:", err);
        res.status(500).json({ error: "Failed to fetch strategic insights" });
    }
});

// ✅ REAL USER MANAGEMENT ENDPOINT
app.get("/api/users", async (req, res) => {
    try {
        const query = "SELECT id, name, email, role FROM users";
        const results = await db.query(query);
        const rows = Array.isArray(results) ? results : (results[0] || []);
        
        // Map status and base permissions for UI consistency
        const sanitizedUsers = rows.map(user => ({
            ...user,
            status: "Active",
            permissions: {
                csv: user.role === 'admin',
                cnn: true
            }
        }));
        
        res.json(sanitizedUsers);
    } catch (err) {
        console.error("❌ Users Fetch Error:", err);
        res.status(500).json({ error: "Failed to fetch user accounts" });
    }
});

server.listen(3002, () => console.log("🚀 Server + Socket.IO running on port 3002"));
