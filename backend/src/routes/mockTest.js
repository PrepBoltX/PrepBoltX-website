const express = require('express');
const mockTestController = require('../controllers/mockTestController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Get all mock tests
router.get('/', mockTestController.getAllMockTests);

// Get mock test by ID
router.get('/:id', mockTestController.getMockTestById);

// Create a new mock test (protected)
router.post('/', authMiddleware.protect, mockTestController.createMockTest);

// Generate mock test using AI (protected)
router.post('/generate', authMiddleware.protect, mockTestController.generateMockTest);

// Submit mock test attempt (protected)
router.post('/submit', authMiddleware.protect, mockTestController.submitMockTestAttempt);

module.exports = router; 