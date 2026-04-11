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


// const { Server } = require("socket.io");

// const io = new Server(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"]
//   }
// });

// attach socket logic
// require("./socket")(io);


const JWT_SECRET = process.env.JWT_SECRET;

// ✅ DB credentials for backup
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;
const DB_PORT = process.env.DB_PORT; 

// ✅ Create /backups folder if not exists
const backupDir = path.join(__dirname, 'backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir);
}



// ✅ Manual Backup Route
app.get('/backup', (req, res) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filePath = path.join(backupDir, `backup-${timestamp}.sql`);
  const dumpCommand = `mysqldump -u ${DB_USER} ${DB_PASSWORD ? `-p${DB_PASSWORD}` : ''} -P ${DB_PORT} ${DB_NAME} > "${filePath}"`;


  exec(dumpCommand, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Backup error:', error);
      return res.status(500).json({ message: 'Backup failed', error });
    }
    console.log('✅ Backup created at', filePath);
    res.json({ message: 'Backup successful', file: `backup-${timestamp}.sql` });
  });
});


app.post("/api/predict", (req, res) => {
    const {store,item,stock,price}=req.body;
    
    const python = spawn("python", [
        "../ai/predict.py",
        store,
        item,
        stock,
        price
    ]);

    let result = "";

    python.stdout.on("data", data => {
        result += data.toString();
    });

    python.stderr.on("data", data => {
        console.error(data.toString());
    });

    python.on("close", () => {
        console.log(result)
        res.json(JSON.parse(result));
    });

});

// ✅ Signup route
app.post('/signup', async (req, res) => {
  const { Email, Name, Password, role } = req.body;
  console.log(role)
  try {
    const hashedPassword = await bcrypt.hash(Password, 10);
    const SQL = 'INSERT INTO users (email, name, password , role) VALUES (?, ?, ?,?)';
    await db.query(SQL, [Email, Name, hashedPassword, role]);
    res.send({ message: 'User added!' });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Signup failed' });
  }
});

// ✅ Login route
app.post('/login', async (req, res) => {
  const { LoginEmail, LoginPassword } = req.body;
  try {
    const SQL = 'SELECT * FROM users WHERE email = ?';
    const users = await db.query(SQL, [LoginEmail]);
    
    if (users.length === 0) {
      return res.status(401).send({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(LoginPassword, users[0].password);
    if (!isMatch) {
      return res.status(401).send({ message: 'Invalid password' });
    }

    const token = jwt.sign(
      { userId: users[0].id, email: users[0].email , role: users[0].role  },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
//     user: {
  //   id: users[0].id,
  //   name: users[0].name,
  //   role: users[0].role
  // }
    res.send({ message: 'Login successful', token ,
    user: {
    id: users[0].id,
    name: users[0].name,
    role: users[0].role
  }
     });
    
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Login failed' });
  }
});

app.get('/store1-dashboard',
  verifyToken,
  authorizeRoles('store1'),
  (req, res) => {
    res.json({ message: 'Welcome Admin Dashboard' });
  }
);
app.get('/store2-dashboard',
  verifyToken,
  authorizeRoles('store2'),
  (req, res) => {
    res.json({ message: 'Welcome Manager Dashboard' });
  }
);
app.get('/store3-dashboard',
  verifyToken,
  authorizeRoles('store3'),
  (req, res) => {
    res.json({ message: 'Welcome User Dashboard' });
  }
);
app.get('/store4-dashboard',
  verifyToken,
  authorizeRoles('store4'),
  (req, res) => {
    res.json({ message: 'Welcome store4 Dashboard' });
  }
);
// ✅ Protected route example
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
const chatRoutes = require('./routes/chat');
app.use('/chat', chatRoutes);
app.use("/StockData", inventoryRoutes);
app.use('/', importExcelRoute);

server.listen(3002, () => {
  
  console.log("🚀 Server + Socket.IO running on port 3002");
});


