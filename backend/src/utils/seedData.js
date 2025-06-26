const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Subject = require('../models/Subject');
const Quiz = require('../models/Quiz');
const aiService = require('../services/aiService');
const externalQuizService = require('../services/externalQuizService');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Connect to MongoDB using environment variable
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB for seeding'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

// Subject data definitions - topics for each subject
const subjectTopics = {
    'DBMS': [
        'Introduction to DBMS',
        'SQL Basics',
        'Normalization',
        'Transactions and ACID Properties',
        'Indexing and Query Optimization'
    ],
    'OOPs': [
        'Introduction to OOP',
        'Classes and Objects',
        'Inheritance',
        'Polymorphism',
        'Abstraction and Encapsulation'
    ],
    'System Design': [
        'Introduction to System Design',
        'Scalability',
        'Load Balancing',
        'Caching',
        'Database Sharding'
    ],
    'Aptitude': [
        'Quantitative Aptitude',
        'Logical Reasoning',
        'Verbal Ability',
        'Data Interpretation',
        'Problem Solving'
    ],
    'Operating System': [
        'Process Management',
        'Memory Management',
        'File Systems',
        'CPU Scheduling',
        'Deadlocks'
    ]
};

// Subject descriptions and categories
const subjectDetails = {
    'DBMS': {
        description: 'Database Management Systems - Learn about relational databases, SQL, normalization, transactions, and more.',
        category: 'Technical',
        type: 'DBMS',
        icon: 'database-icon.png'
    },
    'OOPs': {
        description: 'Object-Oriented Programming - Learn about classes, inheritance, polymorphism, encapsulation, and abstraction.',
        category: 'Technical',
        type: 'OOPs',
        icon: 'code-icon.png'
    },
    'System Design': {
        description: 'Learn how to design scalable systems, architecture patterns, distributed systems, and more.',
        category: 'Technical',
        type: 'System Design',
        icon: 'architecture-icon.png'
    },
    'Aptitude': {
        description: 'Quantitative aptitude, logical reasoning, and problem-solving skills for placement exams.',
        category: 'Non-Technical',
        type: 'Aptitude',
        icon: 'math-icon.png'
    },
    'Operating System': {
        description: 'Learn about OS concepts like process management, memory management, file systems and concurrency.',
        category: 'Technical',
        type: 'Operating System',
        icon: 'os-icon.png'
    }
};

// Function to add delay between API calls to avoid rate limiting
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Create subjects if they don't exist
const createSubjectsIfNeeded = async () => {
    try {
        console.log('Checking and creating subjects if needed...');
        const subjects = Object.keys(subjectTopics);

        for (const subjectName of subjects) {
            // Check if subject already exists
            let subject = await Subject.findOne({ name: subjectName });
            
            if (!subject) {
                console.log(`Creating subject: ${subjectName}`);
                const details = subjectDetails[subjectName];
                
                subject = new Subject({
                    name: subjectName,
                    description: details.description,
                    category: details.category,
                    type: details.type,
                    icon: details.icon
                });
                
                await subject.save();
                console.log(`Created subject: ${subjectName}`);
            } else {
                // Update existing subject with new schema if needed
                if (!subject.type || subject.type !== subjectDetails[subjectName].type) {
                    subject.type = subjectDetails[subjectName].type;
                    subject.category = subjectDetails[subjectName].category;
                    await subject.save();
                    console.log(`Updated subject ${subjectName} with new type and category`);
                }
            }
        }
        
        console.log('Subject creation complete!');
    } catch (error) {
        console.error('Error creating subjects:', error);
    }
};

// Generate topics for a subject
const generateTopicsForSubject = async (subject) => {
    try {
        const subjectDoc = await Subject.findOne({ name: subject });
        if (!subjectDoc) {
            console.log(`Subject ${subject} not found`);
            return;
        }

        const topics = subjectTopics[subject];
        console.log(`Generating topics for ${subject}...`);

        for (const topicTitle of topics) {
            // Check if topic already exists
            const existingTopic = subjectDoc.topics.find(t => t.title === topicTitle);
            if (existingTopic) {
                console.log(`Topic ${topicTitle} already exists for ${subject}`);
                continue;
            }

            console.log(`Generating content for topic: ${topicTitle}`);
            const topicContent = await aiService.generateTopicContent({
                subject,
                topic: topicTitle
            });

            if (!topicContent) {
                console.log(`Failed to generate content for topic: ${topicTitle}`);
                continue;
            }

            // Add topic to subject
            subjectDoc.topics.push({
                title: topicTitle,
                content: topicContent.content,
                order: subjectDoc.topics.length + 1,
                isGeneratedByAI: true
            });

            await subjectDoc.save();
            console.log(`Added topic ${topicTitle} to ${subject}`);
            await delay(2000); // 2 second delay between API calls
        }

        console.log(`Finished generating topics for ${subject}`);
    } catch (error) {
        console.error(`Error generating topics for ${subject}:`, error);
    }
};

// Generate quizzes for a subject using AI
const generateQuizzesForSubject = async (subject) => {
    try {
        const subjectDoc = await Subject.findOne({ name: subject });
        if (!subjectDoc) {
            console.log(`Subject ${subject} not found`);
            return;
        }

        // Create one quiz per difficulty level
        const difficulties = ['easy', 'medium', 'hard'];
        
        console.log(`Generating quizzes for ${subject}...`);

        for (const difficulty of difficulties) {
            // Check if quiz already exists
            const existingQuiz = await Quiz.findOne({ subject: subjectDoc._id, difficulty, isGeneratedByAI: true });
            if (existingQuiz) {
                console.log(`${difficulty} AI-generated quiz already exists for ${subject}`);
                continue;
            }

            console.log(`Generating ${difficulty} quiz for ${subject}`);
            const generatedQuiz = await aiService.generateQuiz({
                subject: subject,
                category: subjectDoc.type, // Use type here as the quiz category
                difficulty,
                numberOfQuestions: 5
            });

            if (!generatedQuiz) {
                console.log(`Failed to generate ${difficulty} quiz for ${subject}`);
                continue;
            }

            const quiz = new Quiz({
                title: generatedQuiz.title || `${subject} ${difficulty} Quiz`,
                description: generatedQuiz.description || `Test your knowledge of ${subject} concepts with this ${difficulty} quiz`,
                subject: subjectDoc._id,
                category: subjectDoc.type, // Use type here as the quiz category
                difficulty,
                questions: generatedQuiz.questions,
                isGeneratedByAI: true
            });

            await quiz.save();

            // Add quiz reference to subject
            subjectDoc.quizzes.push(quiz._id);
            await subjectDoc.save();

            console.log(`Created ${difficulty} quiz for ${subject}`);
            await delay(2000); // 2 second delay between API calls
        }

        console.log(`Finished generating quizzes for ${subject}`);
    } catch (error) {
        console.error(`Error generating quizzes for ${subject}:`, error);
    }
};

// Generate quizzes for a subject using external API
const generateExternalQuizzesForSubject = async (subject) => {
    try {
        const subjectDoc = await Subject.findOne({ name: subject });
        if (!subjectDoc) {
            console.log(`Subject ${subject} not found`);
            return;
        }

        // Create one quiz per difficulty level
        const difficulties = ['easy', 'medium', 'hard'];
        
        console.log(`Generating external API quizzes for ${subject}...`);

        for (const difficulty of difficulties) {
            // Check if quiz already exists
            const existingQuiz = await Quiz.findOne({ subject: subjectDoc._id, difficulty, isExternalGenerated: true });
            if (existingQuiz) {
                console.log(`${difficulty} external API quiz already exists for ${subject}`);
                continue;
            }

            console.log(`Generating ${difficulty} external API quiz for ${subject}`);
            
            // Get questions from external API service
            const questions = await externalQuizService.getQuestionsForSubject(
                subject, 
                5, // 5 questions per quiz
                difficulty
            );

            if (!questions || questions.length === 0) {
                console.log(`Failed to fetch external API questions for ${subject}`);
                continue;
            }

            const quiz = new Quiz({
                title: `${subject} ${difficulty} Quiz (External)`,
                description: `Test your knowledge of ${subject} concepts with this ${difficulty} quiz from external sources`,
                subject: subjectDoc._id,
                category: subjectDoc.type, // Use type here as the quiz category
                difficulty,
                questions,
                isExternalGenerated: true
            });

            await quiz.save();

            // Add quiz reference to subject
            subjectDoc.quizzes.push(quiz._id);
            await subjectDoc.save();

            console.log(`Created ${difficulty} external API quiz for ${subject}`);
            await delay(2000); // 2 second delay between API calls
        }

        console.log(`Finished generating external API quizzes for ${subject}`);
    } catch (error) {
        console.error(`Error generating external API quizzes for ${subject}:`, error);
    }
};

// Main function to seed all data
const seedData = async () => {
    try {
        // First create subjects if they don't exist
        await createSubjectsIfNeeded();
        
        // Get all subjects
        const subjects = Object.keys(subjectTopics);

        // Generate topics for each subject
        for (const subject of subjects) {
            await generateTopicsForSubject(subject);
            await delay(3000); // 3 second delay between subjects
        }

        // Then generate quizzes for each subject using AI
        for (const subject of subjects) {
            await generateQuizzesForSubject(subject);
            await delay(3000); // 3 second delay between subjects
        }

        // Generate quizzes using external APIs
        for (const subject of subjects) {
            await generateExternalQuizzesForSubject(subject);
            await delay(3000); // 3 second delay between subjects
        }

        console.log('Data seeding complete!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

// Run the seeding function
seedData(); 