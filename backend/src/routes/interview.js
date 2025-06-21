const express = require('express');
const interviewController = require('../controllers/interviewController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Get all interviews
router.get('/', interviewController.getAllInterviews);

// Get interview by ID
router.get('/:id', interviewController.getInterviewById);

// Create a new interview (protected)
router.post('/', authMiddleware.protect, interviewController.createInterview);

// Generate interview using AI (protected)
router.post('/generate', authMiddleware.protect, interviewController.generateInterview);

// Submit interview attempt (protected)
router.post('/submit', authMiddleware.protect, interviewController.submitInterviewAttempt);

module.exports = router; 