const mongoose = require('mongoose');

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
        required: true,
        enum: ['Technical', 'Non-Technical'],
        default: 'Technical'
    },
    type: {
        type: String,
        required: true,
        enum: ['DBMS', 'OOPs', 'System Design', 'Aptitude', 'Operating System']
    },
    icon: {
        type: String,
        default: 'default_subject_icon.png'
    },
    color: {
        type: String,
        default: 'bg-blue-500'
    },
    topics: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topic'
    }],
    quizzes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz'
    }],
    mockTests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MockTest'
    }],
    interviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Interview'
    }],
    flashcards: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Flashcard'
    }],
    totalTopics: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

const Subject = mongoose.model('Subject', subjectSchema);

module.exports = Subject; 