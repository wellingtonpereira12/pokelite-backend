import pool from '../config/database.js';

class Highscore {
    // Get highscores by category
    static async getByCategory(category = 'level', limit = 100) {
        let orderBy = 'level DESC, experience DESC';

        switch (category) {
            case 'magic':
                orderBy = 'maglevel DESC, manaspent DESC';
                break;
            case 'fist':
            case 'club':
            case 'sword':
            case 'axe':
            case 'distance':
            case 'shielding':
            case 'fishing':
                // For skills, we need to join with player_skills
                const skillId = this.getSkillId(category);
                const result = await pool.query(
                    `SELECT p.name, p.level, p.vocation, p.world_id, ps.value as skill_value
           FROM players p
           JOIN player_skills ps ON p.id = ps.player_id
           WHERE ps.skillid = $1 AND p.group_id <= 3
           ORDER BY ps.value DESC, ps.count DESC
           LIMIT $2`,
                    [skillId, limit]
                );
                return result.rows;
        }

        // For level and magic
        const result = await pool.query(
            `SELECT name, level, vocation, world_id, maglevel, experience
       FROM players
       WHERE group_id <= 3
       ORDER BY ${orderBy}
       LIMIT $1`,
            [limit]
        );

        return result.rows;
    }

    // Helper to get skill ID
    static getSkillId(skillName) {
        const skillMap = {
            'fist': 0,
            'club': 1,
            'sword': 2,
            'axe': 3,
            'distance': 4,
            'shielding': 5,
            'fishing': 6
        };
        return skillMap[skillName] || 0;
    }
}

export default Highscore;
