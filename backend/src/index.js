const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const quizRoutes = require('./routes/quiz');
const subjectRoutes = require('./routes/subject');
const topicRoutes = require('./routes/topic');
const flashcardRoutes = require('./routes/flashcard');
const interviewRoutes = require('./routes/interview');
const mockTestRoutes = require('./routes/mockTest');
const resumeRoutes = require('./routes/resume');
const leaderboardRoutes = require('./routes/leaderboard');
const dailyTopicRoutes = require('./routes/dailyTopic');
const userRoutes = require('./routes/user');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

console.log('MongoDB URI available:', !!process.env.MONGODB_URI);
console.log('JWT Secret available:', !!process.env.JWT_SECRET);
console.log('Google API Key available:', !!process.env.GOOGLE_API_KEY);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/subject', subjectRoutes);
app.use('/api/topic', topicRoutes);
app.use('/api/flashcard', flashcardRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/mock-test', mockTestRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/daily-topic', dailyTopicRoutes);
app.use('/api/user', userRoutes);

// Root route
app.get('/', (req, res) => {
    res.send('PrepBoltX API is running');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 