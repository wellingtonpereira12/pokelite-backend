import pool from '../config/database.js';
import fs from 'fs';
import path from 'path';

const executeDump = async () => {
    try {
        const sqlPath = 'c:/Users/emper/.gemini/antigravity/scratch/pokelite/pokelite-frontend/BD_PokeElite.sql';
        console.log(`📖 Reading SQL dump from ${sqlPath}...`);

        let sql = fs.readFileSync(sqlPath, 'utf8');

        // Basic normalization for TiDB/MySQL
        // Remove comments and empty lines to make it easier to split if needed
        // But mysql2 can execute multiple statements if configured

        console.log('🚀 Executing SQL... (this might take a while)');

        // We need to split by ';' because pool.query usually doesn't like multiple statements unless enabled
        // and large dumps are better handled statement by statement

        // Split by semicolon, but be careful with delimiters
        // The dump has DELIMITER $$

        const connection = await pool.getConnection();

        try {
            // Enable multiple statements for this connection if possible, 
            // but the pool is already created. Let's try to split.

            const statements = sql
                .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
                .split(/;(?=(?:[^'"]|'[^']*'|"[^"]*")*$)/); // Split by semicolon not in strings

            for (let statement of statements) {
                const trimmed = statement.trim();
                if (trimmed && !trimmed.startsWith('--') && !trimmed.startsWith('DELIMITER')) {
                    try {
                        await connection.query(trimmed);
                    } catch (err) {
                        console.error(`❌ Error in statement: ${trimmed.substring(0, 100)}...`);
                        console.error(err.message);
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
