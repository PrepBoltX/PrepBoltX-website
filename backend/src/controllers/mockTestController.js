const MockTest = require('../models/MockTest');
const Subject = require('../models/Subject');
const User = require('../models/User');
const aiService = require('../services/aiService');

// Get all mock tests
exports.getAllMockTests = async (req, res) => {
    try {
        const mockTests = await MockTest.find()
            .populate('subject', 'name')
            .populate('createdBy', 'name')
            .select('title description duration totalMarks');

        res.status(200).json({ mockTests });
    } catch (error) {
        console.error('Get all mock tests error:', error);
        res.status(500).json({ message: 'Server error while fetching mock tests' });
    }
};

// Get mock test by ID
exports.getMockTestById = async (req, res) => {
    try {
        const mockTest = await MockTest.findById(req.params.id)
            .populate('subject', 'name')
            .populate('createdBy', 'name');

        if (!mockTest) {
            return res.status(404).json({ message: 'Mock test not found' });
        }

        res.status(200).json({ mockTest });
    } catch (error) {
        console.error('Get mock test by ID error:', error);
        res.status(500).json({ message: 'Server error while fetching mock test' });
    }
};

// Create a new mock test
exports.createMockTest = async (req, res) => {
    try {
        const { title, description, subject, duration, totalMarks, sections } = req.body;

        // Check if subject exists
        const subjectExists = await Subject.findById(subject);
        if (!subjectExists) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        const mockTest = new MockTest({
            title,
            description,
            subject,
            duration,
            totalMarks,
            sections,
            createdBy: req.user.userId
        });

        await mockTest.save();

        res.status(201).json({
            message: 'Mock test created successfully',
            mockTest: {
                id: mockTest._id,
                title: mockTest.title
            }
        });
    } catch (error) {
        console.error('Create mock test error:', error);
        res.status(500).json({ message: 'Server error while creating mock test' });
    }
};

// Generate mock test using AI
exports.generateMockTest = async (req, res) => {
    try {
        const { subject, numberOfSections, questionsPerSection, duration, totalMarks } = req.body;

        // Check if subject exists
        const subjectExists = await Subject.findById(subject);
        if (!subjectExists) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        const sections = [];

        // Generate sections
        for (let i = 0; i < (numberOfSections || 3); i++) {
            const sectionTitle = `Section ${i + 1}`;

            // Generate quiz for this section using AI service
            const generatedQuiz = await aiService.generateQuiz({
                subject: subjectExists.name,
                category: 'Mock Test',
                difficulty: i === 0 ? 'easy' : i === 1 ? 'medium' : 'hard',
                numberOfQuestions: questionsPerSection || 5,
                topic: `Section ${i + 1}`
            });

            if (!generatedQuiz) {
                return res.status(500).json({ message: 'Failed to generate mock test' });
            }

            // Format questions for mock test
            const questions = generatedQuiz.questions.map(q => ({
                question: q.question,
                options: q.options,
                correctAnswer: q.correctAnswer,
                marks: i === 0 ? 1 : i === 1 ? 2 : 3,
                negativeMarks: i === 0 ? 0 : i === 1 ? 0.5 : 1,
                explanation: q.explanation
            }));

            sections.push({
                title: sectionTitle,
                questions
            });
        }

        const mockTest = new MockTest({
            title: `${subjectExists.name} Mock Test`,
            description: `AI-generated mock test for ${subjectExists.name}`,
            subject,
            duration: duration || 3600,
            totalMarks: totalMarks || 100,
            sections,
            isGeneratedByAI: true,
            createdBy: req.user.userId
        });

        await mockTest.save();

        res.status(201).json({
            message: 'Mock test generated successfully',
            mockTest: {
                id: mockTest._id,
                title: mockTest.title
            }
        });
    } catch (error) {
        console.error('Generate mock test error:', error);
        res.status(500).json({ message: 'Server error while generating mock test' });
    }
};

// Submit mock test attempt
exports.submitMockTestAttempt = async (req, res) => {
    try {
        const { testId, answers } = req.body;

        // Get mock test
        const mockTest = await MockTest.findById(testId);
        if (!mockTest) {
            return res.status(404).json({ message: 'Mock test not found' });
        }

        // Calculate score
        let totalScore = 0;
        const results = [];

        // Process each section
        mockTest.sections.forEach((section, sectionIndex) => {
            const sectionResults = [];

            // Process each question in this section
            section.questions.forEach((question, questionIndex) => {
                const userAnswer = answers[sectionIndex] ? answers[sectionIndex][questionIndex] : null;
                const isCorrect = question.correctAnswer === userAnswer;

                let questionScore = 0;
                if (isCorrect) {
                    questionScore = question.marks;
                    totalScore += questionScore;
                } else if (userAnswer) { // If answered but incorrect
                    questionScore = -question.negativeMarks;
                    totalScore += questionScore;
                }

                sectionResults.push({
                    question: question.question,
                    userAnswer,
                    correctAnswer: question.correctAnswer,
                    isCorrect,
                    score: questionScore,
                    explanation: question.explanation
                });
            });

            results.push({
                sectionTitle: section.title,
                questions: sectionResults
            });
        });

        // Calculate percentage score
        const scorePercentage = (totalScore / mockTest.totalMarks) * 100;

        // Update user's mock test attempts
        const user = await User.findById(req.user.userId);
        user.mockTestAttempts.push({
            testId,
            score: scorePercentage,
            completed: true
        });

        // Update user's total score
        user.score += scorePercentage / 2; // Mock tests contribute half the weight of regular quizzes

        await user.save();

        res.status(200).json({
            message: 'Mock test submitted successfully',
            score: totalScore,
            percentage: scorePercentage,
            results
        });
    } catch (error) {
        console.error('Submit mock test error:', error);
        res.status(500).json({ message: 'Server error while submitting mock test' });
    }
}; 