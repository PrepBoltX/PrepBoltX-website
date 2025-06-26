const DailyTopic = require('../models/DailyTopic');
const Subject = require('../models/Subject');
const User = require('../models/User');
const aiService = require('../services/aiService');

// Get today's topic
exports.getTodayTopic = async (req, res) => {
    try {
        // Get current date (start of day)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Find a topic published today
        let topic = await DailyTopic.findOne({
            publishDate: {
                $gte: today,
                $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            }
        }).populate('subject', 'name category');
        
        // If no topic for today, get the most recent topic
        if (!topic) {
            topic = await DailyTopic.findOne()
                .sort({ publishDate: -1 })
                .populate('subject', 'name category');
        }
        
        // If still no topic, return 404
        if (!topic) {
            return res.status(404).json({ message: 'No daily topics available' });
        }
        
        // Increment view count
        topic.viewCount += 1;
        await topic.save();
        
        res.status(200).json({ topic });
    } catch (error) {
        console.error('Get today topic error:', error);
        res.status(500).json({ message: 'Server error while fetching today\'s topic' });
    }
};

// Get topics by date range
exports.getTopicsByDateRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'Start and end dates are required' });
        }
        
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        // Validate dates
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ message: 'Invalid date format' });
        }
        
        // Set time to start and end of days
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        
        const topics = await DailyTopic.find({
            publishDate: {
                $gte: start,
                $lte: end
            }
        }).populate('subject', 'name category')
          .sort({ publishDate: 1 });
          
        res.status(200).json({ topics });
    } catch (error) {
        console.error('Get topics by date range error:', error);
        res.status(500).json({ message: 'Server error while fetching topics by date range' });
    }
};

// Get all daily topics (admin only)
exports.getAllDailyTopics = async (req, res) => {
    try {
        const topics = await DailyTopic.find()
            .populate('subject', 'name category')
            .sort({ publishDate: -1 });
            
        res.status(200).json({ topics });
    } catch (error) {
        console.error('Get all daily topics error:', error);
        res.status(500).json({ message: 'Server error while fetching daily topics' });
    }
};

// Get daily topic by ID
exports.getDailyTopicById = async (req, res) => {
    try {
        const topic = await DailyTopic.findById(req.params.id)
            .populate('subject', 'name category')
            .populate('relatedTopics', 'title')
            .populate('relatedQuiz', 'title');
            
        if (!topic) {
            return res.status(404).json({ message: 'Daily topic not found' });
        }
        
        // Increment view count
        topic.viewCount += 1;
        await topic.save();
        
        res.status(200).json({ topic });
    } catch (error) {
        console.error('Get daily topic by ID error:', error);
        res.status(500).json({ message: 'Server error while fetching daily topic' });
    }
};

// Create a new daily topic
exports.createDailyTopic = async (req, res) => {
    try {
        const { 
            title, 
            content, 
            subject, 
            publishDate, 
            readTime, 
            difficulty, 
            tags, 
            relatedQuiz, 
            relatedTopics 
        } = req.body;
        
        // Verify subject exists
        const subjectExists = await Subject.findById(subject);
        if (!subjectExists) {
            return res.status(404).json({ message: 'Subject not found' });
        }
        
        const dailyTopic = new DailyTopic({
            title,
            content,
            subject,
            publishDate: publishDate || new Date(),
            readTime: readTime || 2,
            difficulty: difficulty || 'intermediate',
            tags: tags || [],
            relatedQuiz,
            relatedTopics: relatedTopics || [],
            createdBy: req.user.userId
        });
        
        const savedTopic = await dailyTopic.save();
        
        res.status(201).json({
            message: 'Daily topic created successfully',
            topic: {
                id: savedTopic._id,
                title: savedTopic.title,
                publishDate: savedTopic.publishDate
            }
        });
    } catch (error) {
        console.error('Create daily topic error:', error);
        res.status(500).json({ message: 'Server error while creating daily topic' });
    }
};

// Update a daily topic
exports.updateDailyTopic = async (req, res) => {
    try {
        const { 
            title, 
            content, 
            publishDate, 
            readTime, 
            difficulty, 
            tags, 
            relatedQuiz, 
            relatedTopics 
        } = req.body;
        
        const topic = await DailyTopic.findById(req.params.id);
        if (!topic) {
            return res.status(404).json({ message: 'Daily topic not found' });
        }
        
        // Update fields if provided
        if (title) topic.title = title;
        if (content) topic.content = content;
        if (publishDate) topic.publishDate = publishDate;
        if (readTime) topic.readTime = readTime;
        if (difficulty) topic.difficulty = difficulty;
        if (tags) topic.tags = tags;
        if (relatedQuiz !== undefined) topic.relatedQuiz = relatedQuiz;
        if (relatedTopics) topic.relatedTopics = relatedTopics;
        
        const updatedTopic = await topic.save();
        
        res.status(200).json({
            message: 'Daily topic updated successfully',
            topic: {
                id: updatedTopic._id,
                title: updatedTopic.title,
                publishDate: updatedTopic.publishDate
            }
        });
    } catch (error) {
        console.error('Update daily topic error:', error);
        res.status(500).json({ message: 'Server error while updating daily topic' });
    }
};

// Delete a daily topic
exports.deleteDailyTopic = async (req, res) => {
    try {
        const topic = await DailyTopic.findById(req.params.id);
        if (!topic) {
            return res.status(404).json({ message: 'Daily topic not found' });
        }
        
        await topic.remove();
        
        res.status(200).json({
            message: 'Daily topic deleted successfully'
        });
    } catch (error) {
        console.error('Delete daily topic error:', error);
        res.status(500).json({ message: 'Server error while deleting daily topic' });
    }
};

// Generate a daily topic using AI
exports.generateDailyTopic = async (req, res) => {
    try {
        const { subject, publishDate, difficulty } = req.body;
        
        // Verify subject exists
        const subjectExists = await Subject.findById(subject);
        if (!subjectExists) {
            return res.status(404).json({ message: 'Subject not found' });
        }
        
        // Generate topic content using AI
        const generatedTopic = await aiService.generateDailyTopic({
            subject: subjectExists.name,
            difficulty: difficulty || 'intermediate'
        });
        
        if (!generatedTopic) {
            return res.status(500).json({ message: 'Failed to generate daily topic' });
        }
        
        // Create new daily topic
        const dailyTopic = new DailyTopic({
            title: generatedTopic.title,
            content: generatedTopic.content,
            subject,
            publishDate: publishDate || new Date(),
            readTime: generatedTopic.readTime || 2,
            difficulty: difficulty || 'intermediate',
            tags: generatedTopic.tags || [subjectExists.name.toLowerCase()],
            isGeneratedByAI: true,
            createdBy: req.user.userId
        });
        
        const savedTopic = await dailyTopic.save();
        
        res.status(201).json({
            message: 'Daily topic generated successfully',
            topic: {
                id: savedTopic._id,
                title: savedTopic.title,
                publishDate: savedTopic.publishDate
            }
        });
    } catch (error) {
        console.error('Generate daily topic error:', error);
        res.status(500).json({ message: 'Server error while generating daily topic' });
    }
};

// Mark daily topic as viewed by user
exports.markDailyTopicAsViewed = async (req, res) => {
    try {
        const topicId = req.params.id;
        const userId = req.user.userId;
        
        // Check if topic exists
        const topic = await DailyTopic.findById(topicId);
        if (!topic) {
            return res.status(404).json({ message: 'Daily topic not found' });
        }
        
        // This endpoint just tracks that a user viewed the topic
        // No need to update user records for simple views
        
        res.status(200).json({
            message: 'Daily topic view recorded'
        });
    } catch (error) {
        console.error('Mark daily topic as viewed error:', error);
        res.status(500).json({ message: 'Server error while marking daily topic as viewed' });
    }
};

// Mark daily topic as completed by user
exports.markDailyTopicAsCompleted = async (req, res) => {
    try {
        const topicId = req.params.id;
        const userId = req.user.userId;
        
        // Check if topic exists
        const topic = await DailyTopic.findById(topicId);
        if (!topic) {
            return res.status(404).json({ message: 'Daily topic not found' });
        }
        
        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Check if topic already completed by user
        const alreadyCompleted = user.dailyTopicsCompleted.some(
            item => item.topic.toString() === topicId
        );
        
        if (!alreadyCompleted) {
            // Add to user's completed topics
            user.dailyTopicsCompleted.push({
                topic: topicId,
                completedDate: new Date()
            });
            
            // Update user's streak
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            // If user was last active yesterday, increment streak
            if (user.streak.lastActiveDate) {
                const lastActive = new Date(user.streak.lastActiveDate);
                lastActive.setHours(0, 0, 0, 0);
                
                const dayDiff = Math.floor((today - lastActive) / (24 * 60 * 60 * 1000));
                
                if (dayDiff === 1) {
                    // Increment streak if last active yesterday
                    user.streak.currentStreak += 1;
                    
                    // Update longest streak if current is higher
                    if (user.streak.currentStreak > user.streak.longestStreak) {
                        user.streak.longestStreak = user.streak.currentStreak;
                    }
                } else if (dayDiff > 1) {
                    // Reset streak if more than 1 day passed
                    user.streak.currentStreak = 1;
                }
            } else {
                // First time completing a topic
                user.streak.currentStreak = 1;
                user.streak.longestStreak = 1;
            }
            
            // Update last active date
            user.streak.lastActiveDate = today;
            
            // Increment topic completion count
            topic.completionCount += 1;
            await topic.save();
            
            await user.save();
        }
        
        res.status(200).json({
            message: 'Daily topic marked as completed',
            streak: {
                current: user.streak.currentStreak,
                longest: user.streak.longestStreak
            }
        });
    } catch (error) {
        console.error('Mark daily topic as completed error:', error);
        res.status(500).json({ message: 'Server error while marking daily topic as completed' });
    }
}; 