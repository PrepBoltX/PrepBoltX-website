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

// Standard time limit for all quizzes (20 minutes in seconds)
const STANDARD_TIME_LIMIT = 1200;

// Submit quiz attempt
exports.submitQuizAttempt = async (req, res) => {
    try {
        const { quizId, answers, timeTaken, questionCount } = req.body;
        const userId = req.user.userId;
        
        console.log('Submitting quiz attempt:', { quizId, userId, timeTaken, questionCount });
        
        // Get quiz
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        // Calculate score
        let score = 0;
        let correctAnswers = 0;
        const results = [];
        
        // Process answers - we're using the answers object directly since it contains
        // the mapping between question IDs and user answers
        Object.keys(answers).forEach(questionId => {
            // Find the question in the quiz
            const questionIndex = quiz.questions.findIndex(q => 
                q._id.toString() === questionId || q._id === questionId
            );
            
            if (questionIndex !== -1) {
                const question = quiz.questions[questionIndex];
                const userAnswer = answers[questionId];
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
            }
        });

        // Use the actual number of questions attempted from the request
        // This is the number of randomly selected questions
        const actualQuestionCount = questionCount || Object.keys(answers).length;
        
        // Calculate percentage score based on actual questions
        const percentageScore = (score / actualQuestionCount) * 100;

        // Update quiz attempt count and average score
        quiz.attemptCount += 1;
        quiz.avgScore = ((quiz.avgScore * (quiz.attemptCount - 1)) + percentageScore) / quiz.attemptCount;
        await quiz.save();

        // Update user's quiz attempts
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        console.log('Found user:', user.name);
        
        // Calculate actual time taken, using the standard time limit if not provided
        const actualTimeTaken = timeTaken !== null && timeTaken !== undefined 
            ? timeTaken 
            : STANDARD_TIME_LIMIT;
        
        // Add quiz attempt to user with actual question count
        user.quizAttempts.push({
            quizId,
            score: percentageScore,
            totalQuestions: actualQuestionCount, // Use the actual number of questions attempted
            correctAnswers,
            timeTaken: actualTimeTaken,
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
            if (!user.subjects[subjectIndex].quizzesCompleted) {
                user.subjects[subjectIndex].quizzesCompleted = [];
            }
            
            if (!user.subjects[subjectIndex].quizzesCompleted.includes(quizId)) {
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
        console.log('Updated user with quiz attempt');

        res.status(200).json({
            message: 'Quiz submitted successfully',
            results: {
                score: percentageScore,
                correctAnswers,
                totalQuestions: actualQuestionCount, // Use the actual number of questions attempted
                details: results
            }
        });
    } catch (error) {
        console.error('Submit quiz attempt error:', error);
        res.status(500).json({ message: 'Server error while submitting quiz attempt' });
    }
}; 