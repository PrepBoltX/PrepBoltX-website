const express = require('express');
const subjectController = require('../controllers/subjectController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Get all subjects
router.get('/', subjectController.getAllSubjects);

// Get subject by ID
router.get('/:id', subjectController.getSubjectById);

// Create a new subject (temporarily removed auth for testing)
router.post('/', subjectController.createSubject);

// Add topic to subject (temporarily removed auth for testing)
router.post('/:id/topics', subjectController.addTopic);

// Generate topic content using AI (admin only)
router.post('/:id/generate-topic',
    authMiddleware.protect,
    authMiddleware.restrictTo('admin'),
    subjectController.generateTopicContent
);

// Get topic by ID
router.get('/:subjectId/topics/:topicId', subjectController.getTopicById);

module.exports = router;
