import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import Account from '../models/Account.js';
import Player from '../models/Player.js';

// Validation rules
export const registerValidation = [
    body('name').isLength({ min: 4, max: 32 }).isAlphanumeric(),
    body('password').isLength({ min: 4, max: 255 }),
    body('email').isEmail(),
    body('nickname').isLength({ min: 4, max: 32 }),
    body('characterName').isLength({ min: 4, max: 32 }),
    body('sex').isInt({ min: 0, max: 1 }),
    body('vocation').isInt(),
    body('city').isInt(),
    body('world').isInt()
];

export const loginValidation = [
    body('name').notEmpty(),
    body('password').notEmpty()
];

// Register new account
export const register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, password, email, nickname, characterName, sex, vocation, city, world } = req.body;

        // Check if account/email/nickname exists
        if (await Account.nameExists(name)) {
            return res.status(400).json({ error: 'Account name already exists' });
        }
        if (await Account.emailExists(email)) {
            return res.status(400).json({ error: 'Email already in use' });
        }
        if (await Account.nicknameExists(nickname)) {
            return res.status(400).json({ error: 'Nickname already exists' });
        }
        if (await Player.nameExists(characterName)) {
            return res.status(400).json({ error: 'Character name already exists' });
        }

        // Create account
        const account = await Account.create({ name, password, email, nickname });

        // Create first character
        const player = await Player.create({
            accountId: account.id,
            name: characterName,
            sex,
            vocation,
            city,
            world
        });

        // Generate JWT token
        const token = jwt.sign(
            { id: account.id, name: account.name },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.status(201).json({
            message: 'Account created successfully',
            token,
            account: {
                id: account.id,
                name: account.name,
                email: account.email,
                nickname: account.nickname
            },
            character: player
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Failed to create account' });
    }
};

// Login
export const login = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, password } = req.body;

        const account = await Account.validateLogin(name, password);
        if (!account) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: account.id, name: account.name },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.json({
            message: 'Login successful',
            token,
            account: {
                id: account.id,
                name: account.name,
                email: account.email,
                nickname: account.nickname
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
};

// Get current user
export const getCurrentUser = async (req, res) => {
    try {
        const account = await Account.findById(req.user.id);
        if (!account) {
            return res.status(404).json({ error: 'Account not found' });
        }

        res.json({ account });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user' });
    }
};

// Change password
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const account = await Account.findById(req.user.id);
        const isValid = await Account.validateLogin(account.name, currentPassword);

        if (!isValid) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        await Account.updatePassword(req.user.id, newPassword);

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
};
