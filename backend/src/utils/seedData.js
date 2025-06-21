require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Subject = require('../models/Subject');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

// Seed users
const seedUsers = async () => {
    try {
        // Clear existing users
        await User.deleteMany({});

        // Create admin user
        const adminUser = new User({
            name: 'Admin User',
            email: 'admin@prepboltx.com',
            password: 'admin123', // Will be hashed by pre-save hook
            role: 'admin'
        });

        await adminUser.save();
        console.log('Admin user created');

        // Create regular user
        const regularUser = new User({
            name: 'Demo User',
            email: 'user@prepboltx.com',
            password: 'user123', // Will be hashed by pre-save hook
            role: 'user'
        });

        await regularUser.save();
        console.log('Regular user created');

        return { adminUser, regularUser };
    } catch (error) {
        console.error('Error seeding users:', error);
        process.exit(1);
    }
};

// Seed subjects
const seedSubjects = async (adminId) => {
    try {
        // Clear existing subjects
        await Subject.deleteMany({});

        // Create subjects
        const subjects = [
            {
                name: 'Computer Science',
                description: 'Fundamental concepts of computer science including data structures, algorithms, and programming languages.',
                category: 'Technical',
                topics: [
                    {
                        title: 'Data Structures',
                        content: '<h2>Introduction to Data Structures</h2><p>Data structures are specialized formats for organizing and storing data. They provide a means to manage large amounts of data efficiently for uses such as large databases and internet indexing services.</p><h3>Common Data Structures</h3><ul><li>Arrays</li><li>Linked Lists</li><li>Stacks</li><li>Queues</li><li>Trees</li><li>Graphs</li><li>Hash Tables</li></ul>',
                        order: 1
                    },
                    {
                        title: 'Algorithms',
                        content: '<h2>Introduction to Algorithms</h2><p>An algorithm is a step-by-step procedure for calculations. They are used for data processing, automated reasoning, and other tasks.</p><h3>Common Algorithms</h3><ul><li>Sorting Algorithms</li><li>Search Algorithms</li><li>Graph Algorithms</li><li>Dynamic Programming</li></ul>',
                        order: 2
                    }
                ]
            },
            {
                name: 'Mathematics',
                description: 'Essential mathematical concepts including algebra, calculus, statistics, and discrete mathematics.',
                category: 'Academic',
                topics: [
                    {
                        title: 'Algebra',
                        content: '<h2>Introduction to Algebra</h2><p>Algebra is the study of mathematical symbols and the rules for manipulating these symbols. It is a unifying thread of almost all of mathematics.</p><h3>Key Topics</h3><ul><li>Equations and Inequalities</li><li>Functions</li><li>Polynomials</li><li>Matrices</li></ul>',
                        order: 1
                    },
                    {
                        title: 'Calculus',
                        content: '<h2>Introduction to Calculus</h2><p>Calculus is the mathematical study of continuous change. It has two major branches: differential calculus and integral calculus.</p><h3>Key Topics</h3><ul><li>Limits</li><li>Derivatives</li><li>Integrals</li><li>Series</li></ul>',
                        order: 2
                    }
                ]
            },
            {
                name: 'Interview Preparation',
                description: 'Comprehensive guide to ace technical and behavioral interviews at top companies.',
                category: 'Career',
                topics: [
                    {
                        title: 'Technical Interview Tips',
                        content: '<h2>Technical Interview Preparation</h2><p>Technical interviews assess your problem-solving skills, coding ability, and technical knowledge.</p><h3>Key Tips</h3><ul><li>Practice coding problems regularly</li><li>Study data structures and algorithms</li><li>Review systems design concepts</li><li>Do mock interviews</li></ul>',
                        order: 1
                    },
                    {
                        title: 'Behavioral Interview Strategies',
                        content: '<h2>Behavioral Interview Preparation</h2><p>Behavioral interviews assess your soft skills, teamwork, and past experiences.</p><h3>Key Strategies</h3><ul><li>Use the STAR method (Situation, Task, Action, Result)</li><li>Prepare stories about your achievements</li><li>Research the company culture</li><li>Practice common behavioral questions</li></ul>',
                        order: 2
                    }
                ]
            }
        ];

        for (const subjectData of subjects) {
            const subject = new Subject(subjectData);
            await subject.save();
            console.log(`Subject created: ${subject.name}`);
        }

        console.log('Subjects created successfully');
    } catch (error) {
        console.error('Error seeding subjects:', error);
        process.exit(1);
    }
};

// Main function to run all seed operations
const seedAll = async () => {
    try {
        const { adminUser } = await seedUsers();
        await seedSubjects(adminUser._id);

        console.log('Seed data inserted successfully');
        mongoose.connection.close();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

// Run the seed function
seedAll(); 