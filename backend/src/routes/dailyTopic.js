const express = require('express');
const dailyTopicController = require('../controllers/dailyTopicController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Get today's topic
router.get('/today', dailyTopicController.getTodayTopic);

// Get topics by date range
router.get('/range', dailyTopicController.getTopicsByDateRange);

// Get all daily topics (admin only)
router.get('/',
    authMiddleware.protect,
    authMiddleware.restrictTo('admin'),
    dailyTopicController.getAllDailyTopics
);

// Get topic by ID
router.get('/:id', dailyTopicController.getDailyTopicById);

// Create a new daily topic (admin only)
router.post('/',
    authMiddleware.protect,
    authMiddleware.restrictTo('admin'),
    dailyTopicController.createDailyTopic
);

// Update a daily topic (admin only)
router.put('/:id',
    authMiddleware.protect,
    authMiddleware.restrictTo('admin'),
    dailyTopicController.updateDailyTopic
);

// Delete a daily topic (admin only)
router.delete('/:id',
    authMiddleware.protect,
    authMiddleware.restrictTo('admin'),
    dailyTopicController.deleteDailyTopic
);

// Generate a daily topic using AI (admin only)
router.post('/generate',
    authMiddleware.protect,
    authMiddleware.restrictTo('admin'),
    dailyTopicController.generateDailyTopic
);

// Mark daily topic as viewed by user
router.post('/:id/view',
    authMiddleware.protect,
    dailyTopicController.markDailyTopicAsViewed
);

// Mark daily topic as completed by user (after quiz)
router.post('/:id/complete',
    authMiddleware.protect,
    dailyTopicController.markDailyTopicAsCompleted
);

module.exports = router; 