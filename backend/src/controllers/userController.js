const User = require('../models/User');
const bcrypt = require('bcrypt');

// Get user profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ user });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Server error while fetching profile' });
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, email, profilePicture } = req.body;

        // Check if email already exists
        if (email) {
            const existingUser = await User.findOne({ email, _id: { $ne: req.user.userId } });
            if (existingUser) {
                return res.status(400).json({ message: 'Email already in use' });
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user.userId,
            {
                name: name || undefined,
                email: email || undefined,
                profilePicture: profilePicture || undefined
            },
            { new: true, runValidators: true }
        ).select('-password');

        res.status(200).json({
            message: 'Profile updated successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error while updating profile' });
    }
};

// Change password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Validate input
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current password and new password are required' });
        }

        // Get user with password
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Server error while changing password' });
    }
};

// Get user's quiz history
exports.getQuizHistory = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
            .select('quizAttempts')
            .populate({
                path: 'quizAttempts.quizId',
                select: 'title description difficulty'
            });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ quizHistory: user.quizAttempts });
    } catch (error) {
        console.error('Get quiz history error:', error);
        res.status(500).json({ message: 'Server error while fetching quiz history' });
    }
};

// Get user's mock test history
exports.getMockTestHistory = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
            .select('mockTestAttempts')
            .populate({
                path: 'mockTestAttempts.testId',
                select: 'title description'
            });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ mockTestHistory: user.mockTestAttempts });
    } catch (error) {
        console.error('Get mock test history error:', error);
        res.status(500).json({ message: 'Server error while fetching mock test history' });
    }
}; 