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
    fileSize: {
        type: Number,  // in bytes
        required: true
    },
    fileUrl: {
        type: String,  // URL to access the file
        default: ''
    },
    jobDescription: {
        type: String,
        default: ''
    },
    targetRole: {
        type: String, 
        default: ''
    },
    targetCompany: {
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
        atsCompatibility: {
            type: Number,
            default: 0
        },
        keywordMatches: [{
            keyword: String,
            count: Number,
            importance: Number  // 1-10 scale of importance
        }],
        sectionScores: {
            education: {
                type: Number,
                default: 0
            },
            experience: {
                type: Number,
                default: 0
            },
            skills: {
                type: Number,
                default: 0
            },
            projects: {
                type: Number,
                default: 0
            },
            overall: {
                type: Number,
                default: 0
            }
        },
        detailedFeedback: {
            type: String,
            default: ''
        }
    },
    improvedResumeUrl: {
        type: String,
        default: ''
    },
    isAnalyzed: {
        type: Boolean,
        default: false
    },
    analysisDate: {
        type: Date,
        default: null
    }
}, { timestamps: true });

const Resume = mongoose.model('Resume', resumeSchema);

module.exports = Resume; 