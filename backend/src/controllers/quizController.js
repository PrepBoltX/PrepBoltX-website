const Quiz = require('../models/Quiz');
const Subject = require('../models/Subject');
const User = require('../models/User');
const aiService = require('../services/aiService');

// Get all quizzes
exports.getAllQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find()
            .populate('subject', 'name')
            .populate('createdBy', 'name')
            .select('title description difficulty category timeLimit');

        res.status(200).json({ quizzes });
    } catch (error) {
        console.error('Get all quizzes error:', error);
        res.status(500).json({ message: 'Server error while fetching quizzes' });
    }
};

// Get quiz by ID
exports.getQuizById = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id)
            .populate('subject', 'name')
            .populate('createdBy', 'name');

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        res.status(200).json({ quiz });
    } catch (error) {
        console.error('Get quiz by ID error:', error);
        res.status(500).json({ message: 'Server error while fetching quiz' });
    }
};

// Create a new quiz
exports.createQuiz = async (req, res) => {
    try {
        const { title, description, subject, category, difficulty, timeLimit, questions } = req.body;

        // Check if subject exists
        const subjectExists = await Subject.findById(subject);
        if (!subjectExists) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        const quiz = new Quiz({
            title,
            description,
            subject,
            category,
            difficulty,
            timeLimit,
            questions,
            createdBy: req.user.userId
        });

        await quiz.save();

        // Add quiz to subject
        subjectExists.quizzes.push(quiz._id);
        await subjectExists.save();

        res.status(201).json({
            message: 'Quiz created successfully',
            quiz: {
                id: quiz._id,
                title: quiz.title
            }
        });
    } catch (error) {
        console.error('Create quiz error:', error);
        res.status(500).json({ message: 'Server error while creating quiz' });
    }
};

// Generate quiz using AI
exports.generateQuiz = async (req, res) => {
    try {
        const { subject, category, difficulty, numberOfQuestions, topic } = req.body;

        // Check if subject exists
        const subjectExists = await Subject.findById(subject);
        if (!subjectExists) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        // Generate quiz using AI service
        const generatedQuiz = await aiService.generateQuiz({
            subject: subjectExists.name,
            category,
            difficulty,
            numberOfQuestions: numberOfQuestions || 5,
            topic
        });

        if (!generatedQuiz) {
            return res.status(500).json({ message: 'Failed to generate quiz' });
        }

        const quiz = new Quiz({
            title: generatedQuiz.title,
            description: generatedQuiz.description,
            subject,
            category,
            difficulty,
            questions: generatedQuiz.questions,
            isGeneratedByAI: true,
            createdBy: req.user.userId
        });

        await quiz.save();

        // Add quiz to subject
        subjectExists.quizzes.push(quiz._id);
        await subjectExists.save();

        res.status(201).json({
            message: 'Quiz generated successfully',
            quiz: {
                id: quiz._id,
                title: quiz.title
            }
        });
    } catch (error) {
        console.error('Generate quiz error:', error);
        res.status(500).json({ message: 'Server error while generating quiz' });
    }
};

// Submit quiz attempt
exports.submitQuizAttempt = async (req, res) => {
    try {
        const { quizId, answers } = req.body;

        // Get quiz
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        // Calculate score
        let score = 0;
        const results = [];

        answers.forEach((answer, index) => {
            const question = quiz.questions[index];
            const isCorrect = question.correctAnswer === answer;

            if (isCorrect) {
                score++;
            }

            results.push({
                question: question.question,
                userAnswer: answer,
                correctAnswer: question.correctAnswer,
                isCorrect,
                explanation: question.explanation
            });
        });

        const scorePercentage = (score / quiz.questions.length) * 100;

        // Update user's quiz attempts
        const user = await User.findById(req.user.userId);
        user.quizAttempts.push({
            quizId,
            score: scorePercentage,
            completed: true
        });

        // Update user's total score
        user.score += scorePercentage;

        await user.save();

        res.status(200).json({
            message: 'Quiz submitted successfully',
            score: scorePercentage,
            results
        });
    } catch (error) {
        console.error('Submit quiz error:', error);
        res.status(500).json({ message: 'Server error while submitting quiz' });
    }
}; 