import { body, validationResult } from 'express-validator';
import Player from '../models/Player.js';

// Validation rules
export const createCharacterValidation = [
    body('name').isLength({ min: 4, max: 32 }),
    body('sex').isInt({ min: 0, max: 1 }),
    body('vocation').isInt(),
    body('city').isInt(),
    body('world').isInt()
];

// Create character
export const createCharacter = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, sex, vocation, city, world } = req.body;

        // Check character limit
        const maxChars = parseInt(process.env.MAX_CHARACTERS_PER_ACCOUNT) || 10;
        const count = await Player.countByAccount(req.user.id);

        if (count >= maxChars) {
            return res.status(400).json({ error: `Maximum ${maxChars} characters per account` });
        }

        // Check if name exists
        if (await Player.nameExists(name)) {
            return res.status(400).json({ error: 'Character name already exists' });
        }

        const player = await Player.create({
            accountId: req.user.id,
            name,
            sex,
            vocation,
            city,
            world
        });

        res.status(201).json({
            message: 'Character created successfully',
            character: player
        });
    } catch (error) {
        console.error('Create character error:', error);
        res.status(500).json({ error: 'Failed to create character' });
    }
};

// Get account characters
export const getAccountCharacters = async (req, res) => {
    try {
        const characters = await Player.getByAccount(req.user.id);
        res.json({ characters });
    } catch (error) {
        console.error('Get characters error:', error);
        res.status(500).json({ error: 'Failed to get characters' });
    }
};

// Get character by name
export const getCharacter = async (req, res) => {
    try {
        const { name } = req.params;
        const character = await Player.findByName(name);

        if (!character) {
            return res.status(404).json({ error: 'Character not found' });
        }

        res.json({ character });
    } catch (error) {
        console.error('Get character error:', error);
        res.status(500).json({ error: 'Failed to get character' });
    }
};

// Delete character
export const deleteCharacter = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await Player.delete(id, req.user.id);

        if (!deleted) {
            return res.status(404).json({ error: 'Character not found or not owned by you' });
        }

        res.json({ message: 'Character deleted successfully' });
    } catch (error) {
        console.error('Delete character error:', error);
        res.status(500).json({ error: 'Failed to delete character' });
    }
};

// Get online players
export const getOnlinePlayers = async (req, res) => {
    try {
        const players = await Player.getOnlinePlayers();
        res.json({ players, count: players.length });
    } catch (error) {
        console.error('Get online players error:', error);
        res.status(500).json({ error: 'Failed to get online players' });
    }
};

// Update character comment
export const updateComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { comment, hideChar } = req.body;

        // Verify ownership
        const belongs = await Player.belongsToAccount(id, req.user.id);
        if (!belongs) {
            return res.status(403).json({ error: 'Not your character' });
        }

        await Player.updateComment(id, comment, hideChar);

        res.json({ message: 'Comment updated successfully' });
    } catch (error) {
        console.error('Update comment error:', error);
        res.status(500).json({ error: 'Failed to update comment' });
    }
};
