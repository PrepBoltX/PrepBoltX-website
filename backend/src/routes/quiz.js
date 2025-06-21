const express = require('express');
const quizController = require('../controllers/quizController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Get all quizzes
router.get('/', quizController.getAllQuizzes);

// Get quiz by ID
router.get('/:id', quizController.getQuizById);

// Create a new quiz (protected)
router.post('/', authMiddleware.protect, quizController.createQuiz);

// Generate quiz using AI (protected)
router.post('/generate', authMiddleware.protect, quizController.generateQuiz);

// Submit quiz attempt (protected)
router.post('/submit', authMiddleware.protect, quizController.submitQuizAttempt);

module.exports = router; 