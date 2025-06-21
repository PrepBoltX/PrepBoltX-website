const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    fileContent: {
        type: String,
        required: true
    },
    fileType: {
        type: String,
        enum: ['pdf', 'docx', 'txt'],
        required: true
    },
    jobDescription: {
        type: String,
        default: ''
    },
    analysis: {
        summary: {
            type: String,
            default: ''
        },
        strengths: {
            type: [String],
            default: []
        },
        weaknesses: {
            type: [String],
            default: []
        },
        suggestions: {
            type: [String],
            default: []
        },
        score: {
            type: Number,
            default: 0
        },
        detailedFeedback: {
            type: String,
            default: ''
        }
    },
    isAnalyzed: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Resume = mongoose.model('Resume', resumeSchema);

module.exports = Resume; 