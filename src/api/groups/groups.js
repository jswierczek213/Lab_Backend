import express from "express";

const router = express.Router();

// Database Connection Config
const sqlConfig = {
  server: process.env.DB_SERVER,
  database: 'lab_backend',
  user: process.env.DB_LOGIN,
  password: process.env.DB_PASSWORD,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 5000
  },
  options: {
    trustServerCertificate: true
  }
}

// Database Engine Initialization
import sql from 'mssql';

router.get('', async (req, res) => {
  try {
    const connectionPool = await sql.connect(sqlConfig);
    const result = await connectionPool.query('select * from dbo.groups');
    await connectionPool.close();
    res.status(200).send(result.recordset);
  } catch (e) {
    res.status(500).send(e.toString());
  }
});

export default router;