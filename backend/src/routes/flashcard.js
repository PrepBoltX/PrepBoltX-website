const express = require('express');
const flashcardController = require('../controllers/flashcardController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Get all flashcards (with optional subject filter)
router.get('/', flashcardController.getAllFlashcards);

// Get flashcard by ID
router.get('/:id', flashcardController.getFlashcardById);

// Get flashcards by subject
router.get('/subject/:subjectId', flashcardController.getFlashcardsBySubject);

// Get flashcards by topic
router.get('/topic/:topicId', flashcardController.getFlashcardsByTopic);

// Create a new flashcard
router.post('/', 
    authMiddleware.protect,
    flashcardController.createFlashcard
);

// Update a flashcard
router.put('/:id', 
    authMiddleware.protect,
    flashcardController.updateFlashcard
);

// Delete a flashcard
router.delete('/:id', 
    authMiddleware.protect,
    authMiddleware.restrictTo('admin'),
    flashcardController.deleteFlashcard
);

// Generate flashcards with AI
router.post('/generate', 
    authMiddleware.protect,
    flashcardController.generateFlashcards
);

// Mark flashcard as reviewed
router.post('/:id/review', 
    authMiddleware.protect,
    flashcardController.reviewFlashcard
);

module.exports = router; 