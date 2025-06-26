const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    options: {
        type: [String],
        required: true,
        validate: {
            validator: function (options) {
                return options.length >= 2;
            },
            message: 'Quiz questions must have at least 2 options'
        }
    },
    correctAnswer: {
        type: Number,  // Index of the correct option
        required: true,
        validate: {
            validator: function (correctAnswer) {
                return correctAnswer >= 0 && correctAnswer < this.options.length;
            },
            message: 'Correct answer index must be valid within options array'
        }
    },
    explanation: {
        type: String,
        default: ''
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    tags: [{
        type: String
    }]
});

const quizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
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
        ref: 'Topic'
    },
    category: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['timed', 'practice', 'adaptive'],
        default: 'practice'
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    timeLimit: {
        type: Number,
        default: 600  // 10 minutes in seconds
    },
    questions: {
        type: [questionSchema],
        required: true,
        validate: {
            validator: function (questions) {
                return questions.length > 0;
            },
            message: 'Quiz must have at least one question'
        }
    },
    featuredOrder: {
        type: Number,
        default: 9999  // Lower numbers show first in featured lists
    },
    isGeneratedByAI: {
        type: Boolean,
        default: false
    },
    isExternalGenerated: {
        type: Boolean,
        default: false
    },
    attemptCount: {
        type: Number,
        default: 0
    },
    avgScore: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz; 