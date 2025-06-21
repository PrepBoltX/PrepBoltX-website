const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    order: {
        type: Number,
        required: true
    },
    isGeneratedByAI: {
        type: Boolean,
        default: false
    }
});

const subjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        default: 'default_subject_icon.png'
    },
    topics: [topicSchema],
    quizzes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz'
    }]
}, { timestamps: true });

const Subject = mongoose.model('Subject', subjectSchema);

module.exports = Subject; 