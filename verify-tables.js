import pool from './config/database.js';

const listTables = async () => {
    try {
        const [rows] = await pool.query('SHOW TABLES');
        console.log('Tables found in TiDB:');
        rows.forEach(row => console.log(' - ' + Object.values(row)[0]));
    } catch (err) {
        console.error('Error listing tables:', err.message);
    } finally {
        await pool.end();
    }
};

listTables();
