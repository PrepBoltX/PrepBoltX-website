const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const quizRoutes = require('./routes/quiz');
const subjectRoutes = require('./routes/subject');
const interviewRoutes = require('./routes/interview');
const mockTestRoutes = require('./routes/mockTest');
const resumeRoutes = require('./routes/resume');
const leaderboardRoutes = require('./routes/leaderboard');
const userRoutes = require('./routes/user');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Initialize Express app
const app = express();
const PORT = 3000; // Changed to 3000 to avoid conflicts

// Middleware
app.use(cors());
app.use(express.json());

// Hardcoded connection string to avoid env issues
const MONGODB_URI = 'mongodb+srv://kashishug22:KokkwjeMkMtj4qW0@cluster0.midoehx.mongodb.net/prepboltx?retryWrites=true&w=majority';
// Set global environment variables manually
process.env.GOOGLE_API_KEY = 'AIzaSyDgyj-qSj-kENW-iym2dL5_owWvaoQx8-g';
process.env.JWT_SECRET = '756d9ac217eb5cf51be491f8de78937ed37564e5fcc16f44';

console.log('MongoDB URI:', MONGODB_URI);
console.log('Google API Key available:', !!process.env.GOOGLE_API_KEY);
console.log('JWT Secret available:', !!process.env.JWT_SECRET);

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/subject', subjectRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/mock-test', mockTestRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/user', userRoutes);

// Root route
app.get('/', (req, res) => {
    res.send('PrepBoltX API is running');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 