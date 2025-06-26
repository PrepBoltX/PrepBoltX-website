const express = require('express');
const topicController = require('../controllers/topicController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Get all topics (with optional subject filter)
router.get('/', topicController.getAllTopics);

// Get topic by ID
router.get('/:id', topicController.getTopicById);

// Create a new topic
router.post('/', topicController.createTopic);

// Update a topic
router.put('/:id', topicController.updateTopic);

// Delete a topic (admin only)
router.delete('/:id',
    authMiddleware.protect,
    authMiddleware.restrictTo('admin'),
    topicController.deleteTopic
);

// Mark topic as completed for user
router.post('/:id/complete', 
    authMiddleware.protect, 
    topicController.markTopicAsCompleted
);

module.exports = router; 