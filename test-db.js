import pool from './config/database.js';

console.log('Testing connection...');
try {
    const [rows] = await pool.query('SELECT 1 + 1 as result');
    console.log('Success:', rows[0].result);
} catch (err) {
    console.error('Error:', err.message);
} finally {
    await pool.end();
}
