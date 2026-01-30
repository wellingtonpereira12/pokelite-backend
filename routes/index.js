import express from 'express';
import { authMiddleware, optionalAuth } from '../middleware/auth.js';
import * as authController from '../controllers/authController.js';
import * as characterController from '../controllers/characterController.js';
import * as newsController from '../controllers/newsController.js';
import * as highscoreController from '../controllers/highscoreController.js';

const router = express.Router();

// Auth routes
router.post('/auth/register', authController.registerValidation, authController.register);
router.post('/auth/login', authController.loginValidation, authController.login);
router.get('/auth/me', authMiddleware, authController.getCurrentUser);
router.post('/auth/change-password', authMiddleware, authController.changePassword);

// Character routes
router.post('/characters', authMiddleware, characterController.createCharacterValidation, characterController.createCharacter);
router.get('/characters/my', authMiddleware, characterController.getAccountCharacters);
router.get('/characters/online', characterController.getOnlinePlayers);
router.get('/characters/:name', characterController.getCharacter);
router.delete('/characters/:id', authMiddleware, characterController.deleteCharacter);
router.put('/characters/:id/comment', authMiddleware, characterController.updateComment);

// News routes
router.get('/news', newsController.getAllNews);
router.get('/news/:id', newsController.getNews);
router.post('/news/:id/comments', authMiddleware, newsController.addComment);

// Highscores routes
router.get('/highscores/:category?', highscoreController.getHighscores);

export default router;
