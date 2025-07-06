const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Register new user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

// Google Authentication
router.post('/google', authController.googleAuth);

// Get user profile (protected route)
router.get('/profile', authMiddleware.protect, authController.getProfile);

module.exports = router; 