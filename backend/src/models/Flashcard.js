const mongoose = require('mongoose');

const flashcardSchema = new mongoose.Schema({
    front: {
        type: String,
        required: true
    },
    back: {
        type: String,
        required: true
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    },
    topic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topic',
        required: true
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    tags: [{
        type: String
    }],
    isGeneratedByAI: {
        type: Boolean,
        default: false
    },
    // For spaced repetition learning
    lastReviewed: {
        type: Date,
        default: null
    },
    nextReviewDate: {
        type: Date,
        default: null
    },
    repetitionLevel: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

const Flashcard = mongoose.model('Flashcard', flashcardSchema);

module.exports = Flashcard; 