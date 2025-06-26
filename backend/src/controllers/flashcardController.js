const Flashcard = require('../models/Flashcard');
const Subject = require('../models/Subject');
const Topic = require('../models/Topic');
const aiService = require('../services/aiService');

// Get all flashcards (with optional filters)
exports.getAllFlashcards = async (req, res) => {
    try {
        const { subject, topic, difficulty, tags } = req.query;
        let query = {};
        
        // Apply filters if provided
        if (subject) query.subject = subject;
        if (topic) query.topic = topic;
        if (difficulty) query.difficulty = difficulty;
        if (tags) {
            query.tags = { $in: Array.isArray(tags) ? tags : [tags] };
        }
        
        const flashcards = await Flashcard.find(query)
            .populate('subject', 'name')
            .populate('topic', 'title');
            
        res.status(200).json({ flashcards });
    } catch (error) {
        console.error('Get all flashcards error:', error);
        res.status(500).json({ message: 'Server error while fetching flashcards' });
    }
};

// Get flashcard by ID
exports.getFlashcardById = async (req, res) => {
    try {
        const flashcard = await Flashcard.findById(req.params.id)
            .populate('subject', 'name')
            .populate('topic', 'title');
            
        if (!flashcard) {
            return res.status(404).json({ message: 'Flashcard not found' });
        }
        
        res.status(200).json({ flashcard });
    } catch (error) {
        console.error('Get flashcard by ID error:', error);
        res.status(500).json({ message: 'Server error while fetching flashcard' });
    }
};

// Get flashcards by subject
exports.getFlashcardsBySubject = async (req, res) => {
    try {
        const { subjectId } = req.params;
        
        // Verify subject exists
        const subject = await Subject.findById(subjectId);
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }
        
        const flashcards = await Flashcard.find({ subject: subjectId })
            .populate('topic', 'title');
            
        res.status(200).json({ 
            flashcards,
            subject: {
                id: subject._id,
                name: subject.name
            }
        });
    } catch (error) {
        console.error('Get flashcards by subject error:', error);
        res.status(500).json({ message: 'Server error while fetching flashcards' });
    }
};

// Get flashcards by topic
exports.getFlashcardsByTopic = async (req, res) => {
    try {
        const { topicId } = req.params;
        
        // Verify topic exists
        const topic = await Topic.findById(topicId);
        if (!topic) {
            return res.status(404).json({ message: 'Topic not found' });
        }
        
        const flashcards = await Flashcard.find({ topic: topicId })
            .populate('subject', 'name');
            
        res.status(200).json({
            flashcards,
            topic: {
                id: topic._id,
                title: topic.title
            }
        });
    } catch (error) {
        console.error('Get flashcards by topic error:', error);
        res.status(500).json({ message: 'Server error while fetching flashcards' });
    }
};

// Create a new flashcard
exports.createFlashcard = async (req, res) => {
    try {
        const { front, back, subject, topic, difficulty, tags } = req.body;
        
        // Verify subject exists
        const subjectExists = await Subject.findById(subject);
        if (!subjectExists) {
            return res.status(404).json({ message: 'Subject not found' });
        }
        
        // Verify topic exists and belongs to subject
        const topicExists = await Topic.findOne({ _id: topic, subject });
        if (!topicExists) {
            return res.status(404).json({ message: 'Topic not found or does not belong to the specified subject' });
        }
        
        const flashcard = new Flashcard({
            front,
            back,
            subject,
            topic,
            difficulty: difficulty || 'medium',
            tags: tags || []
        });
        
        const savedFlashcard = await flashcard.save();
        
        // Add flashcard to subject
        subjectExists.flashcards.push(savedFlashcard._id);
        await subjectExists.save();
        
        res.status(201).json({
            message: 'Flashcard created successfully',
            flashcard: {
                id: savedFlashcard._id,
                front: savedFlashcard.front
            }
        });
    } catch (error) {
        console.error('Create flashcard error:', error);
        res.status(500).json({ message: 'Server error while creating flashcard' });
    }
};

// Update a flashcard
exports.updateFlashcard = async (req, res) => {
    try {
        const { front, back, difficulty, tags } = req.body;
        
        const flashcard = await Flashcard.findById(req.params.id);
        if (!flashcard) {
            return res.status(404).json({ message: 'Flashcard not found' });
        }
        
        // Update fields if provided
        if (front) flashcard.front = front;
        if (back) flashcard.back = back;
        if (difficulty) flashcard.difficulty = difficulty;
        if (tags) flashcard.tags = tags;
        
        const updatedFlashcard = await flashcard.save();
        
        res.status(200).json({
            message: 'Flashcard updated successfully',
            flashcard: {
                id: updatedFlashcard._id,
                front: updatedFlashcard.front
            }
        });
    } catch (error) {
        console.error('Update flashcard error:', error);
        res.status(500).json({ message: 'Server error while updating flashcard' });
    }
};

// Delete a flashcard
exports.deleteFlashcard = async (req, res) => {
    try {
        const flashcard = await Flashcard.findById(req.params.id);
        if (!flashcard) {
            return res.status(404).json({ message: 'Flashcard not found' });
        }
        
        // Remove flashcard from subject
        await Subject.findByIdAndUpdate(flashcard.subject, {
            $pull: { flashcards: flashcard._id }
        });
        
        await flashcard.remove();
        
        res.status(200).json({
            message: 'Flashcard deleted successfully'
        });
    } catch (error) {
        console.error('Delete flashcard error:', error);
        res.status(500).json({ message: 'Server error while deleting flashcard' });
    }
};

// Generate flashcards with AI
exports.generateFlashcards = async (req, res) => {
    try {
        const { subject, topic, numberOfCards } = req.body;
        
        // Verify subject exists
        const subjectExists = await Subject.findById(subject);
        if (!subjectExists) {
            return res.status(404).json({ message: 'Subject not found' });
        }
        
        // Verify topic if provided
        let topicObj = null;
        if (topic) {
            topicObj = await Topic.findOne({ _id: topic, subject });
            if (!topicObj) {
                return res.status(404).json({ message: 'Topic not found or does not belong to the specified subject' });
            }
        }
        
        // Generate flashcards using AI service
        const generatedCards = await aiService.generateFlashcards({
            subject: subjectExists.name,
            topic: topicObj?.title,
            count: numberOfCards || 5
        });
        
        if (!generatedCards || generatedCards.length === 0) {
            return res.status(500).json({ message: 'Failed to generate flashcards' });
        }
        
        // Create and save all flashcards
        const flashcardsToCreate = generatedCards.map(card => ({
            front: card.front,
            back: card.back,
            subject,
            topic: topicObj?._id || null,
            tags: [subjectExists.name.toLowerCase()],
            isGeneratedByAI: true
        }));
        
        const savedFlashcards = await Flashcard.insertMany(flashcardsToCreate);
        
        // Add flashcards to subject
        const flashcardIds = savedFlashcards.map(card => card._id);
        subjectExists.flashcards.push(...flashcardIds);
        await subjectExists.save();
        
        res.status(201).json({
            message: 'Flashcards generated successfully',
            count: savedFlashcards.length,
            flashcards: savedFlashcards.map(card => ({
                id: card._id,
                front: card.front
            }))
        });
    } catch (error) {
        console.error('Generate flashcards error:', error);
        res.status(500).json({ message: 'Server error while generating flashcards' });
    }
};

// Mark flashcard as reviewed (for spaced repetition)
exports.reviewFlashcard = async (req, res) => {
    try {
        const { difficulty } = req.body; // 1-5 scale, 1=hard, 5=easy
        const flashcardId = req.params.id;
        
        const flashcard = await Flashcard.findById(flashcardId);
        if (!flashcard) {
            return res.status(404).json({ message: 'Flashcard not found' });
        }
        
        // Update last reviewed date
        flashcard.lastReviewed = new Date();
        
        // Calculate next review date using SM-2 algorithm (simplified)
        const difficultyScore = Math.min(Math.max(1, difficulty || 3), 5); // Ensure between 1-5
        
        // Update repetition level based on difficulty score
        if (difficultyScore < 3) {
            flashcard.repetitionLevel = 0; // Reset if difficult
        } else {
            flashcard.repetitionLevel += 1; // Increment otherwise
        }
        
        // Calculate days until next review
        const daysUntilReview = calculateReviewInterval(flashcard.repetitionLevel, difficultyScore);
        
        // Set next review date
        const nextReviewDate = new Date();
        nextReviewDate.setDate(nextReviewDate.getDate() + daysUntilReview);
        flashcard.nextReviewDate = nextReviewDate;
        
        await flashcard.save();
        
        res.status(200).json({
            message: 'Flashcard reviewed successfully',
            nextReview: flashcard.nextReviewDate
        });
    } catch (error) {
        console.error('Review flashcard error:', error);
        res.status(500).json({ message: 'Server error while reviewing flashcard' });
    }
};

// Helper function to calculate spaced repetition interval
function calculateReviewInterval(repetitionLevel, difficultyScore) {
    // SM-2 algorithm (simplified)
    if (repetitionLevel === 0) return 1; // Tomorrow
    if (repetitionLevel === 1) return 3; // 3 days
    
    // Calculate ease factor (between 1.3 and 2.5)
    const easeFactor = 1.3 + (difficultyScore - 1) * 0.3;
    
    // Calculate days based on repetition level and ease factor
    return Math.round(Math.pow(easeFactor, repetitionLevel - 1) * 5);
} 