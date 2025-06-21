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
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    score: {
        type: Number,
        default: 0
    },
    quizAttempts: [{
        quizId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Quiz'
        },
        score: Number,
        completed: Boolean,
        date: {
            type: Date,
            default: Date.now
        }
    }],
    mockTestAttempts: [{
        testId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MockTest'
        },
        score: Number,
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
        }
    }]
}, { timestamps: true });

// Pre-save hook to hash password
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User; 