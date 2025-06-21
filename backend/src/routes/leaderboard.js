const express = require('express');
const leaderboardController = require('../controllers/leaderboardController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Get global leaderboard
router.get('/', leaderboardController.getGlobalLeaderboard);

// Get quiz leaderboard
router.get('/quiz/:quizId', leaderboardController.getQuizLeaderboard);

// Get user's rank (protected)
router.get('/rank', authMiddleware.protect, leaderboardController.getUserRank);

module.exports = router; 