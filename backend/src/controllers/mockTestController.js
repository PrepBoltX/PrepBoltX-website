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

// Get seeded mock tests by subject
exports.getSeededMockTestsBySubject = async (req, res) => {
    try {
        const { subjectId } = req.params;
        
        if (!subjectId) {
            return res.status(400).json({ message: 'Subject ID is required' });
        }
        
        // Find mock tests for this subject that are not AI-generated
        const mockTests = await MockTest.find({ 
            subjects: subjectId,
            isGeneratedByAI: false
        })
        .populate('subjects', 'name')
        .populate('createdBy', 'name')
        .select('title description duration totalMarks testType difficulty')
        .limit(30); // Limit to 30 mock tests per subject
            
        // Return the mock tests
        res.status(200).json({ 
            mockTests,
            count: mockTests.length
        });
    } catch (error) {
        console.error('Get seeded mock tests by subject error:', error);
        res.status(500).json({ message: 'Server error while fetching seeded mock tests' });
    }
};

// Get mock test by ID
exports.getMockTestById = async (req, res) => {
    try {
        console.log(`Fetching mock test with ID: ${req.params.id}`);
        
        const mockTest = await MockTest.findById(req.params.id)
            .populate('subjects', 'name') // Changed from 'subject' to 'subjects' to match schema
            .populate('createdBy', 'name');

        if (!mockTest) {
            console.error(`Mock test not found with ID: ${req.params.id}`);
            return res.status(404).json({ message: 'Mock test not found' });
        }

        console.log(`Found mock test: ${mockTest.title} with ${mockTest.sections?.length || 0} sections`);
        if (mockTest.sections) {
            mockTest.sections.forEach((section, index) => {
                console.log(`Section ${index + 1}: ${section.title} has ${section.questions?.length || 0} questions`);
            });
        }

        res.status(200).json({ mockTest });
    } catch (error) {
        console.error('Get mock test by ID error:', error);
        res.status(500).json({ message: 'Server error while fetching mock test' });
    }
};

// Get mock tests by subject
exports.getMockTestsBySubject = async (req, res) => {
    try {
        const subjectId = req.params.subjectId;
        
        if (!subjectId) {
            return res.status(400).json({ message: 'Subject ID is required' });
        }
        
        // Find mock tests that have this subject in their subjects array
        const mockTests = await MockTest.find({ subjects: subjectId })
            .populate('subjects', 'name')
            .populate('createdBy', 'name')
            .select('title description duration totalMarks testType');
            
        // If no mock tests found, we should return an empty array, not an error
        res.status(200).json({ mockTests });
    } catch (error) {
        console.error('Get mock tests by subject error:', error);
        res.status(500).json({ message: 'Server error while fetching mock tests by subject' });
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
            try {
                // Find mock tests for this subject that are not AI-generated
                const subjectTests = await MockTest.find({ 
                    subjects: subject._id,
                    isGeneratedByAI: false
                }).limit(5);
                
                if (!subjectTests || subjectTests.length === 0) {
                    console.log(`No tests found for subject: ${subject.name}`);
                    continue;
                }
                
                // Select a random test from available tests
                const randomTest = subjectTests[Math.floor(Math.random() * subjectTests.length)];
                
                if (!randomTest || !randomTest.sections || randomTest.sections.length === 0) {
                    console.log(`Invalid test structure for subject: ${subject.name}`);
                    continue;
                }
                
                // Collect all questions from all sections of this test
                const allQuestions = [];
                randomTest.sections.forEach(section => {
                    if (section.questions && section.questions.length > 0) {
                        section.questions.forEach(question => {
                            allQuestions.push({
                                ...question,
                                subject: subject.name
                            });
                        });
                    }
                });
                
                // If we have questions, shuffle them and take what we need
                if (allQuestions.length > 0) {
                    // Shuffle the questions
                    for (let i = allQuestions.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
                    }
                    
                    // Take the number of questions we need
                    const selectedQuestions = allQuestions.slice(0, questionsPerSubject);
                    
                    sections.push({
                        title: subject.name,
                        subjectRef: subject._id,
                        description: `Questions from ${subject.name}`,
                        questionsCount: selectedQuestions.length,
                        totalMarks: selectedQuestions.length * 4, // 4 marks per question
                        questions: selectedQuestions
                    });
                    
                    console.log(`Added ${selectedQuestions.length} questions from ${subject.name}`);
                } else {
                    console.log(`No questions found in tests for subject: ${subject.name}`);
                }
            } catch (err) {
                console.error(`Error processing subject ${subject.name}:`, err);
                // Continue with other subjects if one fails
            }
        }
        
        // If we couldn't find any real questions, create some placeholder questions as fallback
        if (sections.length === 0) {
            console.log('No real questions found, creating placeholder questions');
            for (const subject of subjectDocs) {
                const questions = [];
                
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
                        marks: 4, // 4 marks per question
                        negativeMarks: 1, // 1 mark negative marking
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
                    totalMarks: questions.length * 4, // 4 marks per question
                    questions
                });
            }
        }

        // Calculate total duration based on number of questions (60 seconds per question)
        const totalQuestions = sections.reduce((sum, section) => sum + section.questionsCount, 0);
        const duration = totalQuestions * 60; // 60 seconds (1 minute) per question

        // Create the mock test
        const mockTest = new MockTest({
            title: 'Custom Mock Test',
            description: `Custom mock test with ${subjectDocs.map(s => s.name).join(', ')}`,
            testType: 'custom',
            subjects,
            duration: duration, // 1 minute per question
            totalMarks: totalQuestions * 4, // 4 marks per question
            totalQuestions: totalQuestions, // Store the total questions count
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
        const { testId, answers, userId, timeTaken, scoreData } = req.body;
        const currentUserId = req.user ? req.user.userId : userId; // Support both auth and non-auth for testing

        // Constants for standardized marking
        const MARKS_PER_QUESTION = 4; // Always +4 for correct
        const NEGATIVE_MARKS = 1; // Always -1 for wrong

        console.log('Received mock test submission:');
        console.log('Test ID:', testId);
        console.log('Answers format:', JSON.stringify(answers));
        console.log('Time taken:', timeTaken);
        console.log('Score data from frontend:', scoreData);

        // Check if this is a custom test (ID starts with "custom-")
        const isCustomTest = testId && testId.startsWith('custom-');
        
        let mockTest;
        if (!isCustomTest) {
            // Get mock test from database
            mockTest = await MockTest.findById(testId);
            if (!mockTest) {
                return res.status(404).json({ message: 'Mock test not found' });
            }
        } else {
            // For custom tests, we'll use the score data directly since the test doesn't exist in the database
            console.log('Processing custom test submission');
        }

        // Use scoreData from frontend if available, otherwise calculate
        let totalScore = 0;
        let correctAnswersCount = 0;
        let totalQuestionsCount = 0;
        let scorePercentage = 0;
        const results = [];

        if (scoreData && typeof scoreData === 'object') {
            console.log('Using score data from frontend');
            totalScore = Number(scoreData.score) || 0;
            correctAnswersCount = Number(scoreData.correctAnswers) || 0;
            totalQuestionsCount = Number(scoreData.totalQuestions) || 0;
            scorePercentage = Number(scoreData.percentage) || 0;
            
            console.log('Parsed score data:', {
                totalScore,
                correctAnswersCount,
                totalQuestionsCount,
                scorePercentage
            });
            
            // For custom tests, we may not have the test in the database
            if (isCustomTest && !mockTest) {
                // Create a basic result structure based on the score data
                results.push({
                    sectionTitle: 'Custom Test Results',
                    questions: []
                });
            } else if (mockTest && mockTest.sections) {
                // Process the answers to get the results for the response
                mockTest.sections.forEach((section, sectionIndex) => {
                    if (!section || !section.questions) {
                        console.log(`Section ${sectionIndex} is missing or has no questions`);
                        return;
                    }
                    
                    const sectionResults = [];
                    const sectionAnswers = answers[sectionIndex] || [];
                    
                    console.log(`Processing section ${sectionIndex}: ${section.title}`);
                    console.log(`Section has ${section.questions.length} questions`);
                    console.log(`Answers for this section:`, sectionAnswers);
                    
                    section.questions.forEach((question, questionIndex) => {
                        if (questionIndex >= sectionAnswers.length) {
                            console.log(`No answer for question ${questionIndex}`);
                            return;
                        }
                        
                        const userAnswer = sectionAnswers[questionIndex];
                        const isCorrect = question.correctAnswer === userAnswer;
                        
                        // Use standardized marking: +4 for correct, -1 for wrong
                        let questionScore = 0;
                        if (isCorrect) {
                            questionScore = MARKS_PER_QUESTION;
                        } else if (userAnswer !== null && userAnswer !== undefined) {
                            questionScore = -NEGATIVE_MARKS;
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
            }
        } else if (mockTest && mockTest.sections) {
            console.log('Calculating score from answers');
            // Process each section
            mockTest.sections.forEach((section, sectionIndex) => {
                if (!section || !section.questions) {
                    console.log(`Section ${sectionIndex} is missing or has no questions`);
                    return;
                }
                
                const sectionResults = [];
                const sectionAnswers = answers[sectionIndex] || [];
                
                // Count total questions in this section
                totalQuestionsCount += section.questions.length;

                console.log(`Processing section ${sectionIndex}: ${section.title}`);
                console.log(`Section has ${section.questions.length} questions`);
                console.log(`Answers for this section:`, sectionAnswers);

                // Process each question in this section
                section.questions.forEach((question, questionIndex) => {
                    if (questionIndex >= sectionAnswers.length) {
                        console.log(`No answer for question ${questionIndex}`);
                        return;
                    }
                    
                    const userAnswer = sectionAnswers[questionIndex];
                    console.log(`Question ${questionIndex}: User answer = ${userAnswer}, Correct answer = ${question.correctAnswer}`);
                    
                    const isCorrect = question.correctAnswer === userAnswer;

                    // Count correct answers
                    if (isCorrect) {
                        correctAnswersCount++;
                        console.log(`Question ${questionIndex} is correct!`);
                    }

                    // Use standardized marking: +4 for correct, -1 for wrong
                    let questionScore = 0;
                    if (isCorrect) {
                        questionScore = MARKS_PER_QUESTION;
                        totalScore += questionScore;
                    } else if (userAnswer !== null && userAnswer !== undefined) { // If answered but incorrect
                        questionScore = -NEGATIVE_MARKS;
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
            const totalPossibleMarks = totalQuestionsCount * MARKS_PER_QUESTION;
            scorePercentage = (totalScore / totalPossibleMarks) * 100;
        } else if (isCustomTest) {
            // For custom tests without a mockTest object, use the scoreData directly
            console.log('Using score data for custom test without mockTest object');
            totalScore = Number(scoreData?.score) || 0;
            correctAnswersCount = Number(scoreData?.correctAnswers) || 0;
            totalQuestionsCount = Number(scoreData?.totalQuestions) || 30;
            scorePercentage = Number(scoreData?.percentage) || 0;
        }

        // Ensure values are valid numbers
        totalScore = isNaN(totalScore) ? 0 : totalScore;
        correctAnswersCount = isNaN(correctAnswersCount) ? 0 : correctAnswersCount;
        totalQuestionsCount = isNaN(totalQuestionsCount) ? 0 : totalQuestionsCount;
        scorePercentage = isNaN(scorePercentage) ? 0 : Math.max(0, scorePercentage);

        console.log(`Final score values: Total score: ${totalScore}, Percentage: ${scorePercentage}%`);
        console.log(`Correct answers: ${correctAnswersCount} out of ${totalQuestionsCount}`);

        // Update user's mock test attempts if user is authenticated
        if (currentUserId) {
            const user = await User.findById(currentUserId);
            if (user) {
                console.log(`Updating user ${currentUserId} mock test attempts`);
                
                // Create section-wise scores
                let sectionWiseScores = [];
                
                if (mockTest && mockTest.sections) {
                    sectionWiseScores = mockTest.sections.map((section, sectionIndex) => {
                        if (!section || !section.questions) {
                            return {
                                section: `Section ${sectionIndex}`,
                                score: 0,
                                totalQuestions: 0,
                                correctAnswers: 0
                            };
                        }
                        
                        let sectionScore = 0;
                        let sectionCorrect = 0;
                        const sectionAnswers = answers[sectionIndex] || [];
                        
                        section.questions.forEach((question, questionIndex) => {
                            if (questionIndex >= sectionAnswers.length) {
                                return;
                            }
                            
                            const userAnswer = sectionAnswers[questionIndex];
                            const isCorrect = question.correctAnswer === userAnswer;
                            
                            // Use standardized marking: +4 for correct, -1 for wrong
                            if (isCorrect) {
                                sectionScore += MARKS_PER_QUESTION;
                                sectionCorrect++;
                            } else if (userAnswer !== null && userAnswer !== undefined) {
                                sectionScore -= NEGATIVE_MARKS;
                            }
                        });
                        
                        return {
                            section: section.title || `Section ${sectionIndex}`,
                            score: sectionScore,
                            totalQuestions: section.questions.length,
                            correctAnswers: sectionCorrect
                        };
                    });
                } else if (isCustomTest) {
                    // For custom tests, create a simple section score
                    sectionWiseScores = [{
                        section: 'Custom Test',
                        score: totalScore,
                        totalQuestions: totalQuestionsCount,
                        correctAnswers: correctAnswersCount
                    }];
                }
                
                // Generate a custom test ID if needed
                const customTestId = isCustomTest ? testId : null;
                
                try {
                    // Add the mock test attempt with all required fields
                    // For custom tests, store the string ID directly; for regular tests, store the ObjectId
                    user.mockTestAttempts.push({
                        testId: isCustomTest ? customTestId : testId, // Don't try to convert custom IDs to ObjectId
                        score: scorePercentage,
                        totalScore: totalScore,
                        totalQuestions: totalQuestionsCount,
                        correctAnswers: correctAnswersCount,
                        timeTaken: timeTaken || 0, // Use provided time or default to 0
                        sectionWiseScores: sectionWiseScores,
                        completed: true,
                        date: new Date()
                    });

                    // Update user's total score
                    user.score += Math.max(0, scorePercentage / 2); // Mock tests contribute half the weight of regular quizzes, ensure non-negative

                    // If we have a mockTest object (not a custom test), update its stats
                    if (mockTest) {
                        // Update mock test attempt count
                        mockTest.attemptCount = (mockTest.attemptCount || 0) + 1;
                        
                        // Update average score for the mock test
                        const attemptCount = mockTest.attemptCount || 1;
                        const prevAvgScore = mockTest.avgScore || 0;
                        const newTotalScore = (prevAvgScore * (attemptCount - 1) + scorePercentage) / attemptCount;
                        mockTest.avgScore = newTotalScore;
                        
                        // Save both user and mock test
                        await Promise.all([user.save(), mockTest.save()]);
                    } else {
                        // Just save the user for custom tests
                        await user.save();
                    }
                    
                    console.log('User data saved successfully');
                } catch (saveError) {
                    console.error('Error saving user data:', saveError);
                    return res.status(500).json({ 
                        message: 'Error saving test results',
                        error: saveError.message 
                    });
                }
            }
        }

        res.status(200).json({
            message: 'Mock test submitted successfully',
            score: totalScore,
            percentage: scorePercentage,
            correctAnswers: correctAnswersCount,
            totalQuestions: totalQuestionsCount,
            results
        });
    } catch (error) {
        console.error('Submit mock test error:', error);
        res.status(500).json({ 
            message: 'Server error while submitting mock test',
            error: error.message
        });
    }
}; 