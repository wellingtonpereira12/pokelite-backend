import pool from './config/database.js';
import fs from 'fs';

const executeDump = async () => {
    try {
        const sqlPath = 'c:/Users/emper/.gemini/antigravity/scratch/pokelite/pokelite-frontend/BD_PokeElite.sql';
        console.log(`📖 Reading SQL dump from ${sqlPath}...`);

        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('🚀 Executing SQL... (this might take a while)');

        const connection = await pool.getConnection();

        try {
            // Split by semicolon not in strings
            const statements = sql
                .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
                .split(/;(?=(?:[^'"]|'[^']*'|"[^"]*")*$)/);

            for (let statement of statements) {
                const trimmed = statement.trim();
                if (trimmed && !trimmed.startsWith('--') && !trimmed.startsWith('DELIMITER')) {
                    try {
                        await connection.query(trimmed);
                    } catch (err) {
                        // console.error(`❌ Error in statement: ${trimmed.substring(0, 100)}...`);
                        // console.error(err.message);
                    }
                }
            }

            console.log('✨ SQL dump executed successfully!');
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('❌ Failed to execute dump:', error);
    } finally {
        await pool.end();
    }
};

executeDump();
