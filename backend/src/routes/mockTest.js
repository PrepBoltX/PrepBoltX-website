const express = require('express');
const mockTestController = require('../controllers/mockTestController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Get all mock tests
router.get('/', mockTestController.getAllMockTests);

// Get mock tests by subject - must come before the :id route
router.get('/by-subject/:subjectId', mockTestController.getMockTestsBySubject);

// Get seeded mock tests by subject - must come before the :id route
router.get('/seeded-by-subject/:subjectId', mockTestController.getSeededMockTestsBySubject);

// Get mock test by ID
router.get('/:id', mockTestController.getMockTestById);

// Create a new mock test (temporarily removed auth for testing)
router.post('/', mockTestController.createMockTest);

// Generate mock test using AI (temporarily removed auth for testing)
router.post('/generate', mockTestController.generateCustomMockTest);

// Generate custom mock test (temporarily removed auth for testing)
router.post('/generate-custom', mockTestController.generateCustomMockTest);

// Generate full SDE mock test (temporarily removed auth for testing)
router.post('/generate-full-sde', mockTestController.generateFullSDEMockTest);

// Submit mock test attempt (temporarily removed auth for testing)
router.post('/submit', mockTestController.submitMockTestAttempt);

module.exports = router; 