import Highscore from '../models/Highscore.js';

// Get highscores
export const getHighscores = async (req, res) => {
    try {
        const { category = 'level' } = req.params;
        const limit = parseInt(req.query.limit) || 100;

        const validCategories = ['level', 'magic', 'fist', 'club', 'sword', 'axe', 'distance', 'shielding', 'fishing'];

        if (!validCategories.includes(category)) {
            return res.status(400).json({ error: 'Invalid category' });
        }

        const highscores = await Highscore.getByCategory(category, limit);

        res.json({
            category,
            highscores,
            count: highscores.length
        });
    } catch (error) {
        console.error('Get highscores error:', error);
        res.status(500).json({ error: 'Failed to get highscores' });
    }
};
