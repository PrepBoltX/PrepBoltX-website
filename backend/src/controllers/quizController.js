const Quiz = require('../models/Quiz');
const Subject = require('../models/Subject');
const Topic = require('../models/Topic');
const User = require('../models/User');
const aiService = require('../services/aiService');
const externalQuizService = require('../services/externalQuizService');

// Get all quizzes
exports.getAllQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find()
            .populate('subject', 'name')
            .populate('topic', 'title')
            .populate('createdBy', 'name')
            .select('title description difficulty category type timeLimit');

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
            .populate('topic', 'title')
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
        const { title, description, subject, topic, category, type, difficulty, timeLimit, questions } = req.body;

        // Check if subject exists
        const subjectExists = await Subject.findById(subject);
        if (!subjectExists) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        // Validate topic if provided
        if (topic) {
            const topicExists = await Topic.findOne({ _id: topic, subject });
            if (!topicExists) {
                return res.status(404).json({ message: 'Topic not found or does not belong to the specified subject' });
            }
        }

        // Ensure questions have correctAnswer as a number index
        const formattedQuestions = questions.map(q => {
            // If correctAnswer is already a number, use it; otherwise find the index
            const correctAnswerIndex = typeof q.correctAnswer === 'number' 
                ? q.correctAnswer 
                : q.options.findIndex(opt => opt === q.correctAnswer);

            return {
                ...q,
                correctAnswer: correctAnswerIndex >= 0 ? correctAnswerIndex : 0
            };
        });

        const quiz = new Quiz({
            title,
            description,
            subject,
            topic,
            category,
            type: type || 'practice',
            difficulty,
            timeLimit,
            questions: formattedQuestions,
            createdBy: req.user ? req.user.userId : null // Make createdBy optional for testing
        });

        const savedQuiz = await quiz.save();

        // Add quiz to subject
        subjectExists.quizzes.push(savedQuiz._id);
        await subjectExists.save();

        res.status(201).json({
            message: 'Quiz created successfully',
            quiz: {
                id: savedQuiz._id,
                title: savedQuiz.title
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
        const { subject, topic, category, difficulty, numberOfQuestions, quizType } = req.body;

        // Check if subject exists
        const subjectExists = await Subject.findById(subject);
        if (!subjectExists) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        // Check topic if provided
        let topicObj = null;
        if (topic) {
            topicObj = await Topic.findOne({ _id: topic, subject });
            if (!topicObj) {
                return res.status(404).json({ message: 'Topic not found or does not belong to the specified subject' });
            }
        }

        // Generate quiz using AI service
        const generatedQuiz = await aiService.generateQuiz({
            subject: subjectExists.name,
            topic: topicObj?.title || null,
            category,
            difficulty,
            numberOfQuestions: numberOfQuestions || 5
        });

        if (!generatedQuiz) {
            return res.status(500).json({ message: 'Failed to generate quiz' });
        }

        // Convert correctAnswer from string to index in options array
        const formattedQuestions = generatedQuiz.questions.map(q => {
            const correctAnswerIndex = q.options.findIndex(opt => opt === q.correctAnswer);
            return {
                ...q,
                correctAnswer: correctAnswerIndex >= 0 ? correctAnswerIndex : 0
            };
        });

        const quiz = new Quiz({
            title: generatedQuiz.title,
            description: generatedQuiz.description,
            subject,
            topic: topicObj?._id || null,
            category,
            type: quizType || 'practice',
            difficulty,
            questions: formattedQuestions,
            isGeneratedByAI: true,
            createdBy: req.user ? req.user.userId : null
        });

        const savedQuiz = await quiz.save();

        // Add quiz to subject
        subjectExists.quizzes.push(savedQuiz._id);
        await subjectExists.save();

        res.status(201).json({
            message: 'Quiz generated successfully',
            quiz: {
                id: savedQuiz._id,
                title: savedQuiz.title
            }
        });
    } catch (error) {
        console.error('Generate quiz error:', error);
        res.status(500).json({ message: 'Server error while generating quiz' });
    }
};

// Generate quiz using external API
exports.generateExternalQuiz = async (req, res) => {
    try {
        const { subject, topic, difficulty, numberOfQuestions, quizType } = req.body;

        // Check if subject exists
        const subjectExists = await Subject.findById(subject);
        if (!subjectExists) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        // Check topic if provided
        let topicObj = null;
        if (topic) {
            topicObj = await Topic.findOne({ _id: topic, subject });
            if (!topicObj) {
                return res.status(404).json({ message: 'Topic not found or does not belong to the specified subject' });
            }
        }

        // Get questions from external API service
        const externalQuestions = await externalQuizService.getQuestionsForSubject(
            subjectExists.name, 
            topicObj?.title,
            numberOfQuestions || 5, 
            difficulty || 'medium'
        );

        if (!externalQuestions || externalQuestions.length === 0) {
            return res.status(500).json({ message: 'Failed to fetch questions from external API' });
        }

        // Transform external questions to match our schema with correctAnswer as index
        const questions = externalQuestions.map(q => {
            const correctAnswerIndex = q.options.findIndex(opt => opt === q.correctAnswer);
            return {
                ...q,
                correctAnswer: correctAnswerIndex >= 0 ? correctAnswerIndex : 0
            };
        });

        const quiz = new Quiz({
            title: `${subjectExists.name} Quiz - ${topicObj?.title || 'General'}`,
            description: `A ${difficulty || 'medium'} difficulty quiz on ${subjectExists.name} ${topicObj ? `focusing on ${topicObj.title}` : ''}`,
            subject,
            topic: topicObj?._id || null,
            category: (topicObj?.title || subjectExists.name).toLowerCase(),
            type: quizType || 'practice',
            difficulty: difficulty || 'medium',
            questions,
            isExternalGenerated: true,
            createdBy: req.user ? req.user.userId : null
        });

        const savedQuiz = await quiz.save();

        // Add quiz to subject
        subjectExists.quizzes.push(savedQuiz._id);
        await subjectExists.save();

        res.status(201).json({
            message: 'Quiz generated successfully from external API',
            quiz: {
                id: savedQuiz._id,
                title: savedQuiz.title
            }
        });
    } catch (error) {
        console.error('Generate external quiz error:', error);
        res.status(500).json({ message: 'Server error while generating quiz from external API' });
    }
};

// Submit quiz attempt
exports.submitQuizAttempt = async (req, res) => {
    try {
        const { quizId, answers, timeTaken } = req.body;
        const userId = req.user ? req.user.userId : req.body.userId; // Support both auth and non-auth for testing

        // Get quiz
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        // Calculate score
        let score = 0;
        let correctAnswers = 0;
        const results = [];

        // For each question, check if the user's answer matches the correct answer
        quiz.questions.forEach((question, index) => {
            const userAnswer = answers[question._id] !== undefined ? answers[question._id] : answers[index];
            const isCorrect = userAnswer === question.correctAnswer;
            
            if (isCorrect) {
                score++;
                correctAnswers++;
            }

            results.push({
                questionId: question._id,
                userAnswer,
                correctAnswer: question.correctAnswer,
                isCorrect
            });
        });

        // Calculate percentage score
        const percentageScore = (score / quiz.questions.length) * 100;

        // Update quiz attempt count and average score
        quiz.attemptCount += 1;
        quiz.avgScore = ((quiz.avgScore * (quiz.attemptCount - 1)) + percentageScore) / quiz.attemptCount;
        await quiz.save();

        // If user is authenticated, update their quiz attempts
        if (userId) {
            const user = await User.findById(userId);
            if (user) {
                user.quizAttempts.push({
                    quizId,
                    score: percentageScore,
                    totalQuestions: quiz.questions.length,
                    correctAnswers,
                    timeTaken: timeTaken || 0,
                    completed: true,
                    date: new Date()
                });

                // Update the user's overall score
                user.score += percentageScore;
                
                // Update subject progress if needed
                const subjectIndex = user.subjects.findIndex(
                    s => s.subjectId.toString() === quiz.subject.toString()
                );
                
                if (subjectIndex !== -1) {
                    const quizCompleted = user.subjects[subjectIndex].quizzesCompleted || [];
                    if (!quizCompleted.includes(quizId)) {
                        user.subjects[subjectIndex].quizzesCompleted.push(quizId);
                    }
                } else {
                    user.subjects.push({
                        subjectId: quiz.subject,
                        progress: 0,
                        quizzesCompleted: [quizId]
                    });
                }

                await user.save();
            }
        }

        res.status(200).json({
            message: 'Quiz submitted successfully',
            results: {
                score: percentageScore,
                correctAnswers,
                totalQuestions: quiz.questions.length,
                details: results
            }
        });
    } catch (error) {
        console.error('Submit quiz attempt error:', error);
        res.status(500).json({ message: 'Server error while submitting quiz attempt' });
    }
}; 