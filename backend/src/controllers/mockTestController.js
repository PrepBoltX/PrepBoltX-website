const MockTest = require('../models/MockTest');
const Subject = require('../models/Subject');
const User = require('../models/User');
const aiService = require('../services/aiService');

// Get all mock tests
exports.getAllMockTests = async (req, res) => {
    try {
        const mockTests = await MockTest.find()
            .populate('subjects', 'name') // Changed from 'subject' to 'subjects' to match schema
            .populate('createdBy', 'name')
            .select('title description duration totalMarks testType');

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
            .populate('subjects', 'name') // Changed from 'subject' to 'subjects' to match schema
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
        const { title, description, subjects, duration, totalMarks, sections } = req.body;

        // Check if subjects exist
        if (subjects && subjects.length > 0) {
            const subjectsExist = await Subject.find({ _id: { $in: subjects } });
            if (!subjectsExist || subjectsExist.length !== subjects.length) {
                return res.status(404).json({ message: 'One or more subjects not found' });
            }
        }

        const mockTest = new MockTest({
            title,
            description,
            subjects, // Changed from subject to subjects to match schema
            duration,
            totalMarks,
            sections,
            createdBy: req.user ? req.user.userId : null // Make createdBy optional for testing
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
        const { subjects, numberOfSections, questionsPerSection, duration, totalMarks } = req.body;

        // Check if at least one subject exists
        if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
            return res.status(400).json({ message: 'At least one subject must be provided' });
        }

        // Check if subjects exist
        const subjectsExist = await Subject.find({ _id: { $in: subjects } });
        if (!subjectsExist || subjectsExist.length === 0) {
            return res.status(404).json({ message: 'No valid subjects found' });
        }

        const sections = [];

        // Generate sections
        for (let i = 0; i < (numberOfSections || 3); i++) {
            const sectionTitle = `Section ${i + 1}`;
            
            // Choose a subject for this section (round-robin if multiple subjects)
            const subjectIndex = i % subjectsExist.length;
            const currentSubject = subjectsExist[subjectIndex];

            // Generate quiz for this section using AI service
            const generatedQuiz = await aiService.generateQuiz({
                subject: currentSubject.name,
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
                explanation: q.explanation,
                subject: currentSubject.name
            }));

            sections.push({
                title: sectionTitle,
                subjectRef: currentSubject._id,
                questions
            });
        }

        const mockTest = new MockTest({
            title: `${subjectsExist.map(s => s.name).join(', ')} Mock Test`,
            description: `AI-generated mock test for ${subjectsExist.map(s => s.name).join(', ')}`,
            subjects, // Changed from subject to subjects array
            duration: duration || 3600,
            totalMarks: totalMarks || 100,
            sections,
            isGeneratedByAI: true,
            createdBy: req.user ? req.user.userId : null // Make createdBy optional for testing
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

// Generate custom mock test
exports.generateCustomMockTest = async (req, res) => {
    try {
        const { subjects, numberOfQuestions, userId } = req.body;
        const currentUserId = req.user ? req.user.userId : userId;

        if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
            return res.status(400).json({ message: 'At least one subject must be selected' });
        }

        // Get subject details
        const subjectDocs = await Subject.find({ _id: { $in: subjects } });
        if (!subjectDocs || subjectDocs.length === 0) {
            return res.status(404).json({ message: 'No valid subjects found' });
        }

        // Create sections for each subject
        const sections = [];
        const questionsPerSubject = Math.ceil(numberOfQuestions / subjects.length);

        for (const subject of subjectDocs) {
            // Generate questions for this subject
            const questions = [];
            
            // In a real implementation, you would fetch questions from a database
            // or generate them using AI. For now, we'll create some placeholder questions.
            for (let i = 0; i < questionsPerSubject; i++) {
                questions.push({
                    question: `Sample ${subject.name} question ${i + 1}`,
                    options: [
                        `Option A for ${subject.name} question ${i + 1}`,
                        `Option B for ${subject.name} question ${i + 1}`,
                        `Option C for ${subject.name} question ${i + 1}`,
                        `Option D for ${subject.name} question ${i + 1}`
                    ],
                    correctAnswer: Math.floor(Math.random() * 4), // Random correct answer
                    marks: 1,
                    negativeMarks: 0.25,
                    explanation: `This is the explanation for ${subject.name} question ${i + 1}`,
                    subject: subject.name,
                    difficulty: 'medium'
                });
            }

            sections.push({
                title: subject.name,
                subjectRef: subject._id,
                description: `Questions from ${subject.name}`,
                questionsCount: questions.length,
                totalMarks: questions.length,
                questions
            });
        }

        // Create the mock test
        const mockTest = new MockTest({
            title: 'Custom Mock Test',
            description: `Custom mock test with ${subjectDocs.map(s => s.name).join(', ')}`,
            testType: 'custom',
            subjects,
            duration: 1800, // 30 minutes
            totalMarks: numberOfQuestions,
            sections,
            isGeneratedByAI: false,
            difficulty: 'mixed',
            createdBy: currentUserId
        });

        await mockTest.save();

        res.status(201).json({
            message: 'Custom mock test generated successfully',
            mockTest
        });
    } catch (error) {
        console.error('Generate custom mock test error:', error);
        res.status(500).json({ message: 'Server error while generating custom mock test' });
    }
};

// Submit mock test attempt
exports.submitMockTestAttempt = async (req, res) => {
    try {
        const { testId, answers, userId } = req.body;
        const currentUserId = req.user ? req.user.userId : userId; // Support both auth and non-auth for testing

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

        // Update user's mock test attempts if user is authenticated
        if (currentUserId) {
            const user = await User.findById(currentUserId);
            if (user) {
                user.mockTestAttempts.push({
                    testId,
                    score: scorePercentage,
                    completed: true
                });

                // Update user's total score
                user.score += scorePercentage / 2; // Mock tests contribute half the weight of regular quizzes

                await user.save();
            }
        }

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