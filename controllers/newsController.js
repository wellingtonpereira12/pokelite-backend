import News from '../models/News.js';
import Player from '../models/Player.js';

// Get all news
export const getAllNews = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const news = await News.getAll(limit, offset);
        const total = await News.getCount();

        res.json({
            news,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get news error:', error);
        res.status(500).json({ error: 'Failed to get news' });
    }
};

// Get single news
export const getNews = async (req, res) => {
    try {
        const { id } = req.params;
        const news = await News.getById(id);

        if (!news) {
            return res.status(404).json({ error: 'News not found' });
        }

        const comments = await News.getComments(id);

        res.json({ news, comments });
    } catch (error) {
        console.error('Get news error:', error);
        res.status(500).json({ error: 'Failed to get news' });
    }
};

// Add comment to news
export const addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { characterName, body } = req.body;

        // Verify character belongs to user
        const character = await Player.findByName(characterName);
        if (!character || character.account_id !== req.user.id) {
            return res.status(403).json({ error: 'Invalid character' });
        }

        const comment = await News.addComment(id, characterName, body);

        res.status(201).json({
            message: 'Comment added successfully',
            comment
        });
    } catch (error) {
        console.error('Add comment error:', error);
        res.status(500).json({ error: 'Failed to add comment' });
    }
};
