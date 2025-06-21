const mongoose = require('mongoose');

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
    questions: [{
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
        }
    }],
    isGeneratedByAI: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

const Interview = mongoose.model('Interview', interviewSchema);

module.exports = Interview; 