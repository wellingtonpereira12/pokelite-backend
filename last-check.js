import pool from './config/database.js';

const checkData = async () => {
    try {
        const [rows] = await pool.query('SELECT name, email FROM accounts LIMIT 1');
        console.log('Account found:', rows[0]);
    } catch (err) {
        console.error('Error checking data:', err.message);
    } finally {
        await pool.end();
    }
};

checkData();
