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
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    },
    isGeneratedByAI: {
        type: Boolean,
        default: false
    },
    // For handling rich content like code snippets, images, etc.
    contentType: {
        type: String,
        enum: ['text', 'markdown', 'code', 'image'],
        default: 'markdown'
    },
    // Associated resources like images, videos, code examples
    resources: [{
        type: {
            type: String,
            enum: ['image', 'video', 'code', 'file'],
            required: true
        },
        url: {
            type: String,
            required: true
        },
        description: {
            type: String,
            default: ''
        }
    }],
    // For tracking user completion and progress
    completionCount: {
        type: Number,
        default: 0
    },
    estimatedReadTime: {
        type: Number,  // in minutes
        default: 5
    }
}, { timestamps: true });

const Topic = mongoose.model('Topic', topicSchema);

module.exports = Topic; 