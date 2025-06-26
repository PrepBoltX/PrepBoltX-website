const Topic = require('../models/Topic');
const Subject = require('../models/Subject');
const User = require('../models/User');

// Get all topics (with optional subject filter)
exports.getAllTopics = async (req, res) => {
    try {
        const { subject } = req.query;
        let query = {};
        
        // Filter by subject if provided
        if (subject) {
            query.subject = subject;
        }
        
        const topics = await Topic.find(query)
            .populate('subject', 'name category')
            .sort({ order: 1 });
            
        res.status(200).json({ topics });
    } catch (error) {
        console.error('Get all topics error:', error);
        res.status(500).json({ message: 'Server error while fetching topics' });
    }
};

// Get topic by ID
exports.getTopicById = async (req, res) => {
    try {
        const topic = await Topic.findById(req.params.id)
            .populate('subject', 'name category');
            
        if (!topic) {
            return res.status(404).json({ message: 'Topic not found' });
        }
        
        // Increment view count
        topic.completionCount += 1;
        await topic.save();
        
        res.status(200).json({ topic });
    } catch (error) {
        console.error('Get topic by ID error:', error);
        res.status(500).json({ message: 'Server error while fetching topic' });
    }
};

// Create a new topic
exports.createTopic = async (req, res) => {
    try {
        const { 
            title, 
            content, 
            subject,
            order, 
            contentType, 
            resources,
            estimatedReadTime 
        } = req.body;
        
        // Check if subject exists
        const subjectExists = await Subject.findById(subject);
        if (!subjectExists) {
            return res.status(404).json({ message: 'Subject not found' });
        }
        
        // Create new topic
        const topic = new Topic({
            title,
            content,
            subject,
            order: order || (subjectExists.totalTopics + 1),
            contentType: contentType || 'markdown',
            resources: resources || [],
            estimatedReadTime: estimatedReadTime || 5
        });
        
        // Save topic
        const savedTopic = await topic.save();
        
        // Update subject with reference to new topic
        subjectExists.topics.push(savedTopic._id);
        subjectExists.totalTopics += 1;
        await subjectExists.save();
        
        res.status(201).json({
            message: 'Topic created successfully',
            topic: {
                id: savedTopic._id,
                title: savedTopic.title
            }
        });
    } catch (error) {
        console.error('Create topic error:', error);
        res.status(500).json({ message: 'Server error while creating topic' });
    }
};

// Update a topic
exports.updateTopic = async (req, res) => {
    try {
        const { 
            title,
            content,
            contentType,
            resources,
            estimatedReadTime
        } = req.body;
        
        const topic = await Topic.findById(req.params.id);
        
        if (!topic) {
            return res.status(404).json({ message: 'Topic not found' });
        }
        
        // Update fields if provided
        if (title) topic.title = title;
        if (content) topic.content = content;
        if (contentType) topic.contentType = contentType;
        if (resources) topic.resources = resources;
        if (estimatedReadTime) topic.estimatedReadTime = estimatedReadTime;
        
        // Save updated topic
        const updatedTopic = await topic.save();
        
        res.status(200).json({
            message: 'Topic updated successfully',
            topic: {
                id: updatedTopic._id,
                title: updatedTopic.title
            }
        });
    } catch (error) {
        console.error('Update topic error:', error);
        res.status(500).json({ message: 'Server error while updating topic' });
    }
};

// Delete a topic
exports.deleteTopic = async (req, res) => {
    try {
        const topic = await Topic.findById(req.params.id);
        
        if (!topic) {
            return res.status(404).json({ message: 'Topic not found' });
        }
        
        // Remove topic from subject
        const subject = await Subject.findById(topic.subject);
        if (subject) {
            subject.topics = subject.topics.filter(
                topicId => topicId.toString() !== topic._id.toString()
            );
            subject.totalTopics -= 1;
            await subject.save();
        }
        
        // Delete topic
        await topic.remove();
        
        res.status(200).json({
            message: 'Topic deleted successfully'
        });
    } catch (error) {
        console.error('Delete topic error:', error);
        res.status(500).json({ message: 'Server error while deleting topic' });
    }
};

// Mark topic as completed for user
exports.markTopicAsCompleted = async (req, res) => {
    try {
        const topicId = req.params.id;
        const userId = req.user.userId;
        
        // Check if topic exists
        const topic = await Topic.findById(topicId);
        if (!topic) {
            return res.status(404).json({ message: 'Topic not found' });
        }
        
        // Find user and update their completed topics
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Find subject in user's subjects array
        const subjectIndex = user.subjects.findIndex(
            s => s.subjectId.toString() === topic.subject.toString()
        );
        
        if (subjectIndex !== -1) {
            // Check if topic is already completed
            const isAlreadyCompleted = user.subjects[subjectIndex].topicsCompleted.some(
                t => t.toString() === topicId
            );
            
            if (!isAlreadyCompleted) {
                // Add topic to completed topics
                user.subjects[subjectIndex].topicsCompleted.push(topicId);
                
                // Update subject progress
                const subject = await Subject.findById(topic.subject);
                if (subject) {
                    user.subjects[subjectIndex].progress = 
                        (user.subjects[subjectIndex].topicsCompleted.length / subject.totalTopics) * 100;
                }
                
                // Update last activity time
                user.subjects[subjectIndex].lastActivity = new Date();
            }
        } else {
            // Create new subject entry in user's subjects array
            const subject = await Subject.findById(topic.subject);
            
            user.subjects.push({
                subjectId: topic.subject,
                progress: subject ? (1 / subject.totalTopics) * 100 : 0,
                topicsCompleted: [topicId],
                lastActivity: new Date()
            });
        }
        
        // Add to daily topics completed
        user.dailyTopicsCompleted.push({
            topic: topicId,
            completedDate: new Date()
        });
        
        // Save user
        await user.save();
        
        res.status(200).json({
            message: 'Topic marked as completed successfully'
        });
    } catch (error) {
        console.error('Mark topic as completed error:', error);
        res.status(500).json({ message: 'Server error while marking topic as completed' });
    }
}; 