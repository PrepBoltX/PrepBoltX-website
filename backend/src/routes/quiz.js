const express = require('express');
const quizController = require('../controllers/quizController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Get all quizzes
router.get('/', quizController.getAllQuizzes);

// Get quiz by ID
router.get('/:id', quizController.getQuizById);

// Create a new quiz (temporarily removed auth for testing)
router.post('/', quizController.createQuiz);

// Generate quiz using AI (temporarily removed auth for testing)
router.post('/generate', quizController.generateQuiz);

// Generate quiz using external APIs (temporarily removed auth for testing)
router.post('/generate-external', quizController.generateExternalQuiz);

// Submit quiz attempt (temporarily removed auth for testing)
router.post('/submit', quizController.submitQuizAttempt);

module.exports = router; 