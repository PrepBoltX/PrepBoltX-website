const User = require('../models/User');

// Get global leaderboard
exports.getGlobalLeaderboard = async (req, res) => {
    try {
        const leaderboard = await User.find()
            .select('name profilePicture score')
            .sort({ score: -1 })
            .limit(20);

        res.status(200).json({ leaderboard });
    } catch (error) {
        console.error('Get global leaderboard error:', error);
        res.status(500).json({ message: 'Server error while fetching leaderboard' });
    }
};

// Get quiz leaderboard
exports.getQuizLeaderboard = async (req, res) => {
    try {
        const quizId = req.params.quizId;

        // Find users who have attempted this quiz
        const users = await User.find({ 'quizAttempts.quizId': quizId })
            .select('name profilePicture quizAttempts');

        // Extract scores for this quiz and sort by highest score
        const leaderboard = users.map(user => {
            const attempt = user.quizAttempts.find(
                attempt => attempt.quizId.toString() === quizId
            );

            return {
                userId: user._id,
                name: user.name,
                profilePicture: user.profilePicture,
                score: attempt ? attempt.score : 0,
                date: attempt ? attempt.date : null
            };
        })
            .sort((a, b) => b.score - a.score)
            .slice(0, 20);

        res.status(200).json({ leaderboard });
    } catch (error) {
        console.error('Get quiz leaderboard error:', error);
        res.status(500).json({ message: 'Server error while fetching quiz leaderboard' });
    }
};

// Get user's rank
exports.getUserRank = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Get user score
        const user = await User.findById(userId).select('score');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Count users with higher score
        const higherScores = await User.countDocuments({ score: { $gt: user.score } });

        // User's rank is the number of users with higher scores + 1
        const rank = higherScores + 1;

        res.status(200).json({
            rank,
            score: user.score
        });
    } catch (error) {
        console.error('Get user rank error:', error);
        res.status(500).json({ message: 'Server error while fetching user rank' });
    }
}; 