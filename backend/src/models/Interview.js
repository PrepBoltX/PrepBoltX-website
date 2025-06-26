const mongoose = require('mongoose');

const interviewQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    expectedAnswer: {
        type: String,
        required: true
    },
    tips: {
        type: String,
        default: ''
    },
    difficulty: {
        type: String,
        enum: ['entry', 'junior', 'mid', 'senior', 'lead'],
        default: 'mid'
    },
    questionType: {
        type: String,
        enum: ['technical', 'behavioral', 'problem-solving', 'domain-specific', 'hr'],
        default: 'technical'
    },
    timeToAnswer: {
        type: Number, // in seconds
        default: 120
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject'
    }
});

const interviewSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    jobRole: {
        type: String,
        required: true
    },
    company: {
        type: String,
        default: 'Generic'
    },
    experienceLevel: {
        type: String,
        enum: ['entry', 'junior', 'mid', 'senior', 'lead'],
        default: 'mid'
    },
    subjects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject'
    }],
    duration: {
        type: Number,
        default: 1800 // 30 minutes in seconds
    },
    questions: [interviewQuestionSchema],
    isGeneratedByAI: {
        type: Boolean,
        default: false
    },
    feedbackModel: {
        type: String,
        enum: ['basic', 'detailed', 'expert'],
        default: 'detailed'
    },
    attemptCount: {
        type: Number,
        default: 0
    },
    avgRating: {
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

const Interview = mongoose.model('Interview', interviewSchema);

module.exports = Interview; 