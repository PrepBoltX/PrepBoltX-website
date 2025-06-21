const Interview = require('../models/Interview');
const User = require('../models/User');
const aiService = require('../services/aiService');

// Get all interviews
exports.getAllInterviews = async (req, res) => {
    try {
        const interviews = await Interview.find()
            .select('title description jobRole company experienceLevel')
            .populate('createdBy', 'name');

        res.status(200).json({ interviews });
    } catch (error) {
        console.error('Get all interviews error:', error);
        res.status(500).json({ message: 'Server error while fetching interviews' });
    }
};

// Get interview by ID
exports.getInterviewById = async (req, res) => {
    try {
        const interview = await Interview.findById(req.params.id)
            .populate('createdBy', 'name');

        if (!interview) {
            return res.status(404).json({ message: 'Interview not found' });
        }

        res.status(200).json({ interview });
    } catch (error) {
        console.error('Get interview by ID error:', error);
        res.status(500).json({ message: 'Server error while fetching interview' });
    }
};

// Create a new interview
exports.createInterview = async (req, res) => {
    try {
        const { title, description, jobRole, company, experienceLevel, questions } = req.body;

        const interview = new Interview({
            title,
            description,
            jobRole,
            company,
            experienceLevel,
            questions,
            createdBy: req.user.userId
        });

        await interview.save();

        res.status(201).json({
            message: 'Interview created successfully',
            interview: {
                id: interview._id,
                title: interview.title
            }
        });
    } catch (error) {
        console.error('Create interview error:', error);
        res.status(500).json({ message: 'Server error while creating interview' });
    }
};

// Generate interview using AI
exports.generateInterview = async (req, res) => {
    try {
        const { jobRole, experienceLevel, numberOfQuestions, company } = req.body;

        // Generate interview questions using AI service
        const generatedQuestions = await aiService.generateInterviewQuestions({
            jobRole,
            experienceLevel,
            numberOfQuestions: numberOfQuestions || 5
        });

        if (!generatedQuestions) {
            return res.status(500).json({ message: 'Failed to generate interview questions' });
        }

        const interview = new Interview({
            title: `${jobRole} Interview - ${experienceLevel} Level`,
            description: `AI-generated interview questions for ${jobRole} position at ${experienceLevel} level${company ? ` for ${company}` : ''}`,
            jobRole,
            company: company || 'Generic',
            experienceLevel,
            questions: generatedQuestions.questions,
            isGeneratedByAI: true,
            createdBy: req.user.userId
        });

        await interview.save();

        res.status(201).json({
            message: 'Interview generated successfully',
            interview: {
                id: interview._id,
                title: interview.title
            }
        });
    } catch (error) {
        console.error('Generate interview error:', error);
        res.status(500).json({ message: 'Server error while generating interview' });
    }
};

// Submit interview attempt
exports.submitInterviewAttempt = async (req, res) => {
    try {
        const { interviewId, answers } = req.body;

        // Get interview
        const interview = await Interview.findById(interviewId);
        if (!interview) {
            return res.status(404).json({ message: 'Interview not found' });
        }

        // Process the answers (no scoring, just feedback)
        const feedback = [];

        answers.forEach((answer, index) => {
            const question = interview.questions[index];

            feedback.push({
                question: question.question,
                userAnswer: answer,
                expectedAnswer: question.expectedAnswer,
                tips: question.tips
            });
        });

        // Update user's interview attempts
        const user = await User.findById(req.user.userId);
        user.interviewAttempts.push({
            interviewId,
            feedback: JSON.stringify(feedback),
            completed: true
        });

        await user.save();

        res.status(200).json({
            message: 'Interview submitted successfully',
            feedback
        });
    } catch (error) {
        console.error('Submit interview error:', error);
        res.status(500).json({ message: 'Server error while submitting interview' });
    }
}; 