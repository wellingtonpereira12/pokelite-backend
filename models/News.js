import pool from '../config/database.js';

class News {
    // Get all news with pagination
    static async getAll(limit = 10, offset = 0) {
        const result = await pool.query(
            'SELECT * FROM news ORDER BY date DESC LIMIT $1 OFFSET $2',
            [limit, offset]
        );
        return result.rows;
    }

    // Get total count
    static async getCount() {
        const result = await pool.query('SELECT COUNT(*) as count FROM news');
        return parseInt(result.rows[0].count);
    }

    // Get news by ID
    static async getById(id) {
        const result = await pool.query(
            'SELECT * FROM news WHERE id = $1',
            [id]
        );
        return result.rows[0];
    }

    // Get comments for news
    static async getComments(newsId, limit = 10, offset = 0) {
        const result = await pool.query(
            'SELECT * FROM news_comments WHERE news_id = $1 ORDER BY date DESC LIMIT $2 OFFSET $3',
            [newsId, limit, offset]
        );
        return result.rows;
    }

    // Add comment
    static async addComment(newsId, author, body) {
        const result = await pool.query(
            'INSERT INTO news_comments (news_id, author, body, date) VALUES ($1, $2, $3, $4) RETURNING *',
            [newsId, author, body, Math.floor(Date.now() / 1000)]
        );
        return result.rows[0];
    }

    // Delete comment
    static async deleteComment(commentId) {
        await pool.query('DELETE FROM news_comments WHERE id = $1', [commentId]);
    }
}

export default News;
