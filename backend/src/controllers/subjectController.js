const Subject = require('../models/Subject');
const Topic = require('../models/Topic');
const aiService = require('../services/aiService');

// Get all subjects
exports.getAllSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find().select('name description category type icon color totalTopics');
        res.status(200).json({ subjects });
    } catch (error) {
        console.error('Get all subjects error:', error);
        res.status(500).json({ message: 'Server error while fetching subjects' });
    }
};

// Get subjects by category
exports.getSubjectsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const subjects = await Subject.find({ category }).select('name description type icon color totalTopics');
        res.status(200).json({ subjects });
    } catch (error) {
        console.error('Get subjects by category error:', error);
        res.status(500).json({ message: 'Server error while fetching subjects by category' });
    }
};

// Get subject by ID
exports.getSubjectById = async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id)
            .populate('topics', 'title content order')
            .populate('quizzes', 'title description difficulty')
            .populate('mockTests', 'title description')
            .populate('interviews', 'title description');

        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        res.status(200).json({ subject });
    } catch (error) {
        console.error('Get subject by ID error:', error);
        res.status(500).json({ message: 'Server error while fetching subject' });
    }
};

// Create a new subject
exports.createSubject = async (req, res) => {
    try {
        const { name, description, category, type, icon, color } = req.body;

        // Check if subject with same name already exists
        const existingSubject = await Subject.findOne({ name });
        if (existingSubject) {
            return res.status(400).json({ message: 'Subject with this name already exists' });
        }

        const subject = new Subject({
            name,
            description,
            category,
            type,
            icon,
            color: color || 'bg-blue-500',
            totalTopics: 0
        });

        await subject.save();

        res.status(201).json({
            message: 'Subject created successfully',
            subject: {
                id: subject._id,
                name: subject.name
            }
        });
    } catch (error) {
        console.error('Create subject error:', error);
        res.status(500).json({ message: 'Server error while creating subject' });
    }
};

// Add topic to subject
exports.addTopic = async (req, res) => {
    try {
        const { title, content, order, contentType, resources, estimatedReadTime } = req.body;
        const subjectId = req.params.id;

        const subject = await Subject.findById(subjectId);
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        // Create the new topic as a separate document
        const topic = new Topic({
            title,
            content,
            order: order || (subject.totalTopics + 1),
            subject: subjectId,
            contentType: contentType || 'markdown',
            resources: resources || [],
            estimatedReadTime: estimatedReadTime || 5
        });

        // Save the topic
        const savedTopic = await topic.save();

        // Update the subject with reference to the new topic
        subject.topics.push(savedTopic._id);
        subject.totalTopics += 1;
        
        await subject.save();

        res.status(201).json({
            message: 'Topic added successfully',
            topic: {
                id: savedTopic._id,
                title: savedTopic.title,
                order: savedTopic.order
            }
        });
    } catch (error) {
        console.error('Add topic error:', error);
        res.status(500).json({ message: 'Server error while adding topic' });
    }
};

// Generate topic content using AI
exports.generateTopicContent = async (req, res) => {
    try {
        const { topic } = req.body;
        const subjectId = req.params.id;

        const subject = await Subject.findById(subjectId);
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        // Generate topic content using AI service
        const generatedContent = await aiService.generateTopicContent({
            subject: subject.name,
            topic
        });

        if (!generatedContent) {
            return res.status(500).json({ message: 'Failed to generate topic content' });
        }

        // Create new topic with generated content
        const newTopic = new Topic({
            title: generatedContent.title,
            content: generatedContent.content,
            order: subject.totalTopics + 1,
            subject: subjectId,
            isGeneratedByAI: true,
            contentType: 'markdown'
        });

        // Save the topic
        const savedTopic = await newTopic.save();

        // Update the subject with reference to the new topic
        subject.topics.push(savedTopic._id);
        subject.totalTopics += 1;
        
        await subject.save();

        res.status(201).json({
            message: 'Topic content generated successfully',
            topic: {
                id: savedTopic._id,
                title: generatedContent.title,
                order: savedTopic.order
            }
        });
    } catch (error) {
        console.error('Generate topic content error:', error);
        res.status(500).json({ message: 'Server error while generating topic content' });
    }
};

// Get topic by ID
exports.getTopicById = async (req, res) => {
    try {
        const { topicId } = req.params;

        const topic = await Topic.findById(topicId);
        if (!topic) {
            return res.status(404).json({ message: 'Topic not found' });
        }

        res.status(200).json({ topic });
    } catch (error) {
        console.error('Get topic by ID error:', error);
        res.status(500).json({ message: 'Server error while fetching topic' });
    }
}; 