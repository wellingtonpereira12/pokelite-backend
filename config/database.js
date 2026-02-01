import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Create MySQL connection pool
const pool = mysql.createPool(process.env.DATABASE_URL);

console.log('✅ Connected to MySQL database (TiDB)');

export default pool;
