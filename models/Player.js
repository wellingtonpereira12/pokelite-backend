import pool from '../config/database.js';

class Player {
    // Create new player
    static async create({ accountId, name, sex, vocation, city, world }) {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // Get sample character stats
            const sample = await client.query(
                'SELECT * FROM players WHERE name = $1',
                ['Pokemon Trainer Sample']
            );

            if (sample.rows.length === 0) {
                throw new Error('Sample character not found');
            }

            const sampleChar = sample.rows[0];

            // Create player
            const result = await client.query(
                `INSERT INTO players (
          account_id, name, world_id, sex, vocation, level, experience,
          health, healthmax, mana, manamax, maglevel, manaspent, soul,
          town_id, posx, posy, posz, cap
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
        RETURNING *`,
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

            const playerId = result.rows[0].id;

            // Copy skills from sample
            const sampleSkills = await client.query(
                'SELECT skillid, value, count FROM player_skills WHERE player_id = $1',
                [sampleChar.id]
            );

            for (const skill of sampleSkills.rows) {
                await client.query(
                    'INSERT INTO player_skills (player_id, skillid, value, count) VALUES ($1, $2, $3, $4)',
                    [playerId, skill.skillid, skill.value, skill.count]
                );
            }

            await client.query('COMMIT');
            return result.rows[0];

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    // Find player by name
    static async findByName(name) {
        const result = await pool.query(
            `SELECT p.*, a.nickname as account_nickname 
       FROM players p 
       JOIN accounts a ON p.account_id = a.id 
       WHERE p.name = $1`,
            [name]
        );
        return result.rows[0];
    }

    // Get players by account
    static async getByAccount(accountId) {
        const result = await pool.query(
            'SELECT * FROM players WHERE account_id = $1 ORDER BY name',
            [accountId]
        );
        return result.rows;
    }

    // Count players by account
    static async countByAccount(accountId) {
        const result = await pool.query(
            'SELECT COUNT(*) as count FROM players WHERE account_id = $1',
            [accountId]
        );
        return parseInt(result.rows[0].count);
    }

    // Delete player
    static async delete(playerId, accountId) {
        const result = await pool.query(
            'DELETE FROM players WHERE id = $1 AND account_id = $2 RETURNING id',
            [playerId, accountId]
        );
        return result.rows.length > 0;
    }

    // Get online players
    static async getOnlinePlayers() {
        const result = await pool.query(
            `SELECT p.name, p.level, p.vocation, p.world_id 
       FROM players p 
       WHERE p.online = 1 
       ORDER BY p.level DESC`
        );
        return result.rows;
    }

    // Update comment
    static async updateComment(playerId, comment, hideChar = false) {
        await pool.query(
            'UPDATE players SET comment = $1, hide_char = $2 WHERE id = $3',
            [comment, hideChar, playerId]
        );
    }

    // Check if name exists
    static async nameExists(name) {
        const result = await pool.query(
            'SELECT id FROM players WHERE name = $1',
            [name]
        );
        return result.rows.length > 0;
    }

    // Check if player belongs to account
    static async belongsToAccount(playerId, accountId) {
        const result = await pool.query(
            'SELECT id FROM players WHERE id = $1 AND account_id = $2',
            [playerId, accountId]
        );
        return result.rows.length > 0;
    }
}

export default Player;
