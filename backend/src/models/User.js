const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    profilePicture: {
        type: String,
        default: ''
    },
    authProvider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local'
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'mentor'],
        default: 'user'
    },
    score: {
        type: Number,
        default: 0
    },
    level: {
        type: Number,
        default: 1
    },
    streak: {
        currentStreak: {
            type: Number,
            default: 0
        },
        longestStreak: {
            type: Number,
            default: 0
        },
        lastActiveDate: {
            type: Date,
            default: null
        }
    },
    badges: [{
        name: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        icon: {
            type: String,
            default: 'default_badge.png'
        },
        earnedAt: {
            type: Date,
            default: Date.now
        }
    }],
    preferences: {
        theme: {
            type: String,
            enum: ['light', 'dark', 'system'],
            default: 'system'
        },
        emailNotifications: {
            type: Boolean,
            default: true
        },
        studyReminders: {
            type: Boolean,
            default: true
        },
        showProgressOnProfile: {
            type: Boolean,
            default: true
        }
    },
    quizAttempts: [{
        quizId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Quiz'
        },
        score: Number,
        totalQuestions: Number,
        correctAnswers: Number,
        timeTaken: Number,
        completed: Boolean,
        date: {
            type: Date,
            default: Date.now
        }
    }],
    mockTestAttempts: [{
        testId: {
            type: mongoose.Schema.Types.Mixed, // Changed from ObjectId to Mixed to support both ObjectId and String
            ref: 'MockTest'
        },
        score: Number,
        totalScore: Number, // Added to match what's being saved in the controller
        totalQuestions: Number,
        correctAnswers: Number,
        timeTaken: Number,
        sectionWiseScores: [{
            section: String,
            score: Number,
            totalQuestions: Number,
            correctAnswers: Number // Added to match what's being saved in the controller
        }],
        completed: Boolean,
        date: {
            type: Date,
            default: Date.now
        }
    }],
    interviewAttempts: [{
        interviewId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Interview'
        },
        feedback: String,
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        strengths: [String],
        areasToImprove: [String],
        completed: Boolean,
        date: {
            type: Date,
            default: Date.now
        }
    }],
    resumeUploads: [{
        resumeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Resume'
        },
        feedback: String,
        score: Number,
        date: {
            type: Date,
            default: Date.now
        }
    }],
    subjects: [{
        subjectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subject'
        },
        progress: {
            type: Number,
            default: 0
        },
        topicsCompleted: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Topic'
        }],
        quizzesCompleted: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Quiz'
        }],
        lastActivity: {
            type: Date,
            default: null
        }
    }],
    dailyTopicsCompleted: [{
        topic: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Topic'
        },
        completedDate: {
            type: Date,
            default: Date.now
        }
    }]
}, { timestamps: true });

// Pre-save hook to hash password
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        // Skip password hashing for Google users
        if (this.authProvider === 'google') {
            next();
            return;
        }
        
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    // If user is authenticated via Google, don't compare password
    if (this.authProvider === 'google') {
        return false;
    }
    
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User; 