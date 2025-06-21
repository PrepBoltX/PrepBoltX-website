const mongoose = require('mongoose');

const mockTestSchema = new mongoose.Schema({
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
    duration: {
        type: Number,
        required: true,
        default: 3600 // 1 hour in seconds
    },
    totalMarks: {
        type: Number,
        required: true,
        default: 100
    },
    sections: [{
        title: {
            type: String,
            required: true
        },
        questions: [{
            question: {
                type: String,
                required: true
            },
            options: {
                type: [String],
                required: true
            },
            correctAnswer: {
                type: String,
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
            }
        }]
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

const MockTest = mongoose.model('MockTest', mockTestSchema);

module.exports = MockTest; 