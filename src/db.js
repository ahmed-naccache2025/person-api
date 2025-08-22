import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

export const pool = mysql.createPool({
  uri: process.env.DATABASE_URL, // e.g. mysql://user:pass@localhost:3306/persondb
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function shutdownPool() {
  await pool.end();
}
