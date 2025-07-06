const express = require('express');
const quizController = require('../controllers/quizController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Get all quizzes
router.get('/', quizController.getAllQuizzes);

// Get quiz by ID
router.get('/:id', quizController.getQuizById);

// Create a new quiz (requires auth)
router.post('/', authMiddleware.protect, quizController.createQuiz);

// Generate quiz using AI (requires auth)
router.post('/generate', authMiddleware.protect, quizController.generateQuiz);

// Generate quiz using external APIs (requires auth)
router.post('/generate-external', authMiddleware.protect, quizController.generateExternalQuiz);

// Submit quiz attempt (requires auth)
router.post('/submit', authMiddleware.protect, quizController.submitQuizAttempt);

module.exports = router; 