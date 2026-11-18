import mysql from 'mysql2'
import dotenv from 'dotenv'

// Load database settings from backend/.env.
dotenv.config()

// One shared connection pool is reused by all route files.
const poolOptions = {
  host: process.env.MYSQL_HOST,
  user:  process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: Number(process.env.MYSQL_PORT || 3306),
  multipleStatements: true,
};

// Managed MySQL providers often require SSL.
if (process.env.MYSQL_SSL === "true") {
  poolOptions.ssl = { rejectUnauthorized: true };
}

const pool = mysql.createPool(poolOptions).promise();

export default pool; 