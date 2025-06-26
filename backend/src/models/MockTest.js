const mongoose = require('mongoose');

const mockTestQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    options: {
        type: [String],
        required: true
    },
    correctAnswer: {
        type: Number,  // Index of correct option
        required: true
    },
    marks: {
        type: Number,
        required: true,
        default: 1
    },
    negativeMarks: {
        type: Number,
        default: 0
    },
    explanation: {
        type: String,
        default: ''
    },
    subject: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    }
});

const mockTestSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    testType: {
        type: String,
        enum: ['timed', 'subject', 'full', 'custom'],
        default: 'timed'
    },
    subjects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject'
    }],
    duration: {
        type: Number,
        required: true,
        default: 3600  // 1 hour in seconds
    },
    totalMarks: {
        type: Number,
        required: true,
        default: 100
    },
    passingMarks: {
        type: Number,
        default: 40 // Default passing percentage
    },
    sections: [{
        title: {
            type: String,
            required: true
        },
        subjectRef: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subject'
        },
        description: {
            type: String,
            default: ''
        },
        questionsCount: {
            type: Number,
            default: 0
        },
        totalMarks: {
            type: Number,
            default: 0
        },
        questions: [mockTestQuestionSchema]
    }],
    isGeneratedByAI: {
        type: Boolean,
        default: false
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard', 'mixed'],
        default: 'medium'
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
    },
    featured: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const MockTest = mongoose.model('MockTest', mockTestSchema);

module.exports = MockTest; 