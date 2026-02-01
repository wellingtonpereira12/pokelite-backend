import pool from '../config/database.js';

class Player {
    // Create new player
    static async create({ accountId, name, sex, vocation, city, world }) {
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            // Get sample character stats
            const [samples] = await connection.query(
                'SELECT * FROM players WHERE name LIKE ? LIMIT 1',
                ['%Sample%']
            );

            const sampleChar = samples[0] || {
                level: 1, experience: 0, health: 150, healthmax: 150,
                mana: 0, manamax: 0, maglevel: 0, manaspent: 0, soul: 0,
                posx: 50, posy: 50, posz: 7, cap: 400
            };

            // Create player
            const [result] = await connection.query(
                `INSERT INTO players (
                  account_id, name, world_id, sex, vocation, level, experience,
                  health, healthmax, mana, manamax, maglevel, manaspent, soul,
                  town_id, posx, posy, posz, cap
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    accountId, name, world, sex, vocation,
                    sampleChar.level, sampleChar.experience,
                    sampleChar.health, sampleChar.healthmax,
                    sampleChar.mana, sampleChar.manamax,
                    sampleChar.maglevel, sampleChar.manaspent,
                    sampleChar.soul, city,
                    sampleChar.posx, sampleChar.posy, sampleChar.posz,
                    sampleChar.cap
                ]
            );

            const playerId = result.insertId;

            await connection.commit();

            const [newPlayer] = await pool.query('SELECT * FROM players WHERE id = ?', [playerId]);
            return newPlayer[0];

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Find player by name
    static async findByName(name) {
        const [rows] = await pool.query(
            `SELECT p.*, a.name as account_nickname 
             FROM players p 
             JOIN accounts a ON p.account_id = a.id 
             WHERE p.name = ?`,
            [name]
        );
        return rows[0];
    }

    // Get players by account
    static async getByAccount(accountId) {
        const [rows] = await pool.query(
            'SELECT * FROM players WHERE account_id = ? ORDER BY name',
            [accountId]
        );
        return rows;
    }

    // Count players by account
    static async countByAccount(accountId) {
        const [rows] = await pool.query(
            'SELECT COUNT(*) as count FROM players WHERE account_id = ?',
            [accountId]
        );
        return parseInt(rows[0].count);
    }

    // Delete player
    static async delete(playerId, accountId) {
        const [result] = await pool.query(
            'DELETE FROM players WHERE id = ? AND account_id = ?',
            [playerId, accountId]
        );
        return result.affectedRows > 0;
    }

    // Get online players
    static async getOnlinePlayers() {
        // In some schemas there is a players_online table or an online flag in players
        const [rows] = await pool.query(
            `SELECT p.name, p.level, p.vocation, p.world_id 
             FROM players p 
             WHERE p.lastlogin > p.lastlogout
             ORDER BY p.level DESC`
        );
        return rows;
    }

    // Update comment
    static async updateComment(playerId, comment, hideChar = false) {
        // Old schemas might not have comment/hide_char, but we'll try to find similar or use description
        await pool.query(
            'UPDATE players SET description = ? WHERE id = ?',
            [comment, playerId]
        );
    }

    // Check if name exists
    static async nameExists(name) {
        const [rows] = await pool.query(
            'SELECT id FROM players WHERE name = ?',
            [name]
        );
        return rows.length > 0;
    }

    // Check if player belongs to account
    static async belongsToAccount(playerId, accountId) {
        const [rows] = await pool.query(
            'SELECT id FROM players WHERE id = ? AND account_id = ?',
            [playerId, accountId]
        );
        return rows.length > 0;
    }
}

export default Player;
