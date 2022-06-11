// Database Connection Config
export const sqlConfig = {
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