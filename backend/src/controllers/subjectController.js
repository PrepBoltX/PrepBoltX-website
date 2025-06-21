const Subject = require('../models/Subject');
const aiService = require('../services/aiService');

// Get all subjects
exports.getAllSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find().select('name description category icon');
        res.status(200).json({ subjects });
    } catch (error) {
        console.error('Get all subjects error:', error);
        res.status(500).json({ message: 'Server error while fetching subjects' });
    }
};

// Get subject by ID
exports.getSubjectById = async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id)
            .populate('quizzes', 'title description difficulty');

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
        const { name, description, category, icon } = req.body;

        // Check if subject with same name already exists
        const existingSubject = await Subject.findOne({ name });
        if (existingSubject) {
            return res.status(400).json({ message: 'Subject with this name already exists' });
        }

        const subject = new Subject({
            name,
            description,
            category,
            icon
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
        const { title, content, order } = req.body;
        const subjectId = req.params.id;

        const subject = await Subject.findById(subjectId);
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        subject.topics.push({
            title,
            content,
            order: order || subject.topics.length + 1
        });

        await subject.save();

        res.status(201).json({
            message: 'Topic added successfully',
            topic: {
                title,
                order: order || subject.topics.length
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

        subject.topics.push({
            title: generatedContent.title,
            content: generatedContent.content,
            order: subject.topics.length + 1,
            isGeneratedByAI: true
        });

        await subject.save();

        res.status(201).json({
            message: 'Topic content generated successfully',
            topic: {
                title: generatedContent.title,
                order: subject.topics.length
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
        const { subjectId, topicId } = req.params;

        const subject = await Subject.findById(subjectId);
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        const topic = subject.topics.id(topicId);
        if (!topic) {
            return res.status(404).json({ message: 'Topic not found' });
        }

        res.status(200).json({ topic });
    } catch (error) {
        console.error('Get topic by ID error:', error);
        res.status(500).json({ message: 'Server error while fetching topic' });
    }
}; 