import pool from '../config/database.js';

class Highscore {
    // Get highscores by category
    static async getByCategory(category = 'level', limit = 100) {
        let orderBy = 'level DESC, experience DESC';

        if (category !== 'level' && category !== 'magic') {
            const skillCol = `skill_${category}`;
            const [rows] = await pool.query(
                `SELECT name, level, vocation, world_id, ${skillCol} as skill_value
                 FROM players
                 WHERE group_id <= 3
                 ORDER BY ${skillCol} DESC, level DESC
                 LIMIT ?`,
                [limit]
            );
            return rows;
        }

        if (category === 'magic') {
            orderBy = 'maglevel DESC, manaspent DESC';
        }

        const [rows] = await pool.query(
            `SELECT name, level, vocation, world_id, maglevel, experience
             FROM players
             WHERE group_id <= 3
             ORDER BY ${orderBy}
             LIMIT ?`,
            [limit]
        );

        return rows;
    }
}

export default Highscore;
