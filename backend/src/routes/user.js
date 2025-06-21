const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// All user routes are protected
router.use(authMiddleware.protect);

// Get user profile
router.get('/profile', userController.getProfile);

// Update user profile
router.put('/profile', userController.updateProfile);

// Change password
router.put('/change-password', userController.changePassword);

// Get user's quiz history
router.get('/quiz-history', userController.getQuizHistory);

// Get user's mock test history
router.get('/mock-test-history', userController.getMockTestHistory);

module.exports = router; 