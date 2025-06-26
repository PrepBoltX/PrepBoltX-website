const mongoose = require('mongoose');

const leaderboardEntrySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    score: {
        type: Number,
        required: true,
        default: 0
    },
    rank: {
        type: Number,
        default: 0
    },
    // Performance metrics
    quizzesCompleted: {
        type: Number,
        default: 0
    },
    mockTestsCompleted: {
        type: Number,
        default: 0
    },
    avgQuizScore: {
        type: Number,
        default: 0
    },
    avgMockTestScore: {
        type: Number,
        default: 0
    },
    streak: {
        type: Number,
        default: 0
    },
    subjectCoverage: {
        type: Number,  // percentage of available subjects covered
        default: 0
    },
    lastActive: {
        type: Date,
        default: Date.now
    }
});

const leaderboardSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'allTime'],
        required: true
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject'
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    entries: [leaderboardEntrySchema],
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Create a compound index on type and dates for efficient querying
leaderboardSchema.index({ type: 1, startDate: 1, endDate: 1 });

const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);

module.exports = Leaderboard; 