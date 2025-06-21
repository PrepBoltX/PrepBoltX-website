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
        type: String,
        required: true,
        validate: {
            validator: function (correctAnswer) {
                return this.options.includes(correctAnswer);
            },
            message: 'Correct answer must be included in the options'
        }
    },
    explanation: {
        type: String,
        default: ''
    }
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
    category: {
        type: String,
        required: true
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
    isGeneratedByAI: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz; 