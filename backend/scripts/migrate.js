import fs from "node:fs";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const connection = await mysql.createConnection({
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  multipleStatements: true,
  ssl: process.env.MYSQL_SSL === "true"
    ? { rejectUnauthorized: true }
    : undefined,
});

const sql = fs.readFileSync("../database/init.sql", "utf8");
await connection.query(sql);
await connection.end();
console.log("Database tables are ready.");
