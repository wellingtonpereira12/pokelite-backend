import pool from '../config/database.js';

class News {
    // Get all news with pagination
    static async getAll(limit = 10, offset = 0) {
        const [rows] = await pool.query(
            'SELECT id, titulo as title, texto as body, date_created as date FROM noticias WHERE status = "T" ORDER BY date_created DESC LIMIT ? OFFSET ?',
            [limit, offset]
        );
        return rows;
    }

    // Get total count
    static async getCount() {
        const [rows] = await pool.query('SELECT COUNT(*) as count FROM noticias WHERE status = "T"');
        return parseInt(rows[0].count);
    }

    // Get news by ID
    static async getById(id) {
        const [rows] = await pool.query(
            'SELECT id, titulo as title, texto as body, date_created as date FROM noticias WHERE id = ?',
            [id]
        );
        return rows[0];
    }
}

export default News;
