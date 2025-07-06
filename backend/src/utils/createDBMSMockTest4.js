const mongoose = require('mongoose');
const MockTest = require('../models/MockTest');
const Subject = require('../models/Subject');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const findOrCreateDBMSMockTest = async () => {
  try {
    const dbmsSubject = await Subject.findOne({ type: 'DBMS' });
    if (!dbmsSubject) {
      console.error('DBMS subject not found');
      process.exit(1);
    }
    let mockTest = await MockTest.findOne({
      title: 'DBMS Mock Test - Set 1',
      subjects: dbmsSubject._id
    });
    if (!mockTest) {
      console.error('DBMS Mock Test - Set 1 not found. Please run createDBMSMockTest1.js first.');
      process.exit(1);
    }
    return { mockTest, dbmsSubject };
  } catch (error) {
    console.error('Error finding DBMS mock test:', error);
    process.exit(1);
  }
};

const sqlTestbookQuestions = [
  {
    question: 'Which SQL clause is used to remove duplicate rows from the result set of a SELECT query?',
    options: [
      'UNIQUE',
      'DISTINCT',
      'REMOVE',
      'DELETE'
    ],
    correctAnswer: 1,
    explanation: 'DISTINCT removes duplicate rows in SELECT queries.',
    marks: 2,
    negativeMarks: 0.5,
    subject: 'DBMS',
    difficulty: 'medium'
  },
  {
    question: 'What will be the output of: SELECT LENGTH("TestBook")?',
    options: [
      '7',
      '8',
      '9',
      '6'
    ],
    correctAnswer: 1,
    explanation: 'LENGTH("TestBook") returns 8, the number of characters.',
    marks: 2,
    negativeMarks: 0.5,
    subject: 'DBMS',
    difficulty: 'medium'
  },
  {
    question: 'Which SQL function returns the current date and time?',
    options: [
      'CURDATE()',
      'NOW()',
      'SYSDATE()',
      'GETDATE()'
    ],
    correctAnswer: 1,
    explanation: 'NOW() returns the current date and time in most SQL dialects.',
    marks: 2,
    negativeMarks: 0.5,
    subject: 'DBMS',
    difficulty: 'medium'
  },
  {
    question: 'Which of the following is used to change the structure of a table in SQL?',
    options: [
      'MODIFY',
      'UPDATE',
      'ALTER',
      'CHANGE'
    ],
    correctAnswer: 2,
    explanation: 'ALTER is used to change the structure of a table (add/drop/modify columns).',
    marks: 2,
    negativeMarks: 0.5,
    subject: 'DBMS',
    difficulty: 'medium'
  },
  {
    question: 'Which SQL keyword is used to sort the result-set?',
    options: [
      'SORT BY',
      'ORDER BY',
      'GROUP BY',
      'ARRANGE BY'
    ],
    correctAnswer: 1,
    explanation: 'ORDER BY is used to sort the result-set.',
    marks: 2,
    negativeMarks: 0.5,
    subject: 'DBMS',
    difficulty: 'medium'
  },
  {
    question: 'Which of the following is not a valid SQL aggregate function?',
    options: [
      'SUM()',
      'AVG()',
      'TOTAL()',
      'COUNT()'
    ],
    correctAnswer: 2,
    explanation: 'TOTAL() is not a standard SQL aggregate function.',
    marks: 2,
    negativeMarks: 0.5,
    subject: 'DBMS',
    difficulty: 'medium'
  },
  {
    question: 'Which SQL statement is used to extract data from a database?',
    options: [
      'GET',
      'SELECT',
      'EXTRACT',
      'OPEN'
    ],
    correctAnswer: 1,
    explanation: 'SELECT is used to extract data from a database.',
    marks: 2,
    negativeMarks: 0.5,
    subject: 'DBMS',
    difficulty: 'easy'
  },
  {
    question: 'Which SQL clause is used to filter the results of a GROUP BY in a SELECT statement?',
    options: [
      'WHERE',
      'HAVING',
      'ORDER BY',
      'GROUP BY'
    ],
    correctAnswer: 1,
    explanation: 'HAVING is used to filter groups after aggregation.',
    marks: 2,
    negativeMarks: 0.5,
    subject: 'DBMS',
    difficulty: 'medium'
  },
  {
    question: 'Which of the following is used to remove all records from a table but not the table itself?',
    options: [
      'DROP',
      'DELETE',
      'TRUNCATE',
      'REMOVE'
    ],
    correctAnswer: 2,
    explanation: 'TRUNCATE removes all records but keeps the table structure.',
    marks: 2,
    negativeMarks: 0.5,
    subject: 'DBMS',
    difficulty: 'medium'
  },
  {
    question: 'Which SQL keyword is used to prevent duplicate values in a column?',
    options: [
      'UNIQUE',
      'PRIMARY KEY',
      'DISTINCT',
      'CHECK'
    ],
    correctAnswer: 0,
    explanation: 'UNIQUE constraint ensures all values in a column are different.',
    marks: 2,
    negativeMarks: 0.5,
    subject: 'DBMS',
    difficulty: 'medium'
  },
  {
    question: 'Which SQL clause is used to combine rows from two or more tables, based on a related column?',
    options: [
      'JOIN',
      'UNION',
      'INTERSECT',
      'MERGE'
    ],
    correctAnswer: 0,
    explanation: 'JOIN combines rows from two or more tables based on a related column.',
    marks: 2,
    negativeMarks: 0.5,
    subject: 'DBMS',
    difficulty: 'medium'
  },
  {
    question: 'Which SQL function is used to count the number of rows in a table?',
    options: [
      'COUNT()',
      'SUM()',
      'TOTAL()',
      'NUMBER()'
    ],
    correctAnswer: 0,
    explanation: 'COUNT() returns the number of rows in a table.',
    marks: 2,
    negativeMarks: 0.5,
    subject: 'DBMS',
    difficulty: 'easy'
  },
  {
    question: 'Which SQL clause is used to combine the result-set of two or more SELECT statements?',
    options: [
      'JOIN',
      'UNION',
      'INTERSECT',
      'MERGE'
    ],
    correctAnswer: 1,
    explanation: 'UNION combines the result-set of two or more SELECT statements.',
    marks: 2,
    negativeMarks: 0.5,
    subject: 'DBMS',
    difficulty: 'medium'
  }
];

const addQuestionsToMockTest = async (mockTest, dbmsSubject, questions) => {
  try {
    let section = mockTest.sections.find(s => s.title === 'DBMS Section');
    if (!section) {
      section = {
        title: 'DBMS Section',
        subjectRef: dbmsSubject._id,
        description: 'Core DBMS MCQs',
        questionsCount: 0,
        totalMarks: 0,
        questions: []
      };
      mockTest.sections.push(section);
    }
    section.questions.push(...questions);
    section.questionsCount = section.questions.length;
    section.totalMarks = section.questions.reduce((sum, q) => sum + (q.marks || 1), 0);
    mockTest.totalMarks = mockTest.sections.reduce((sum, sec) => sum + (sec.totalMarks || 0), 0);
    await mockTest.save();
    console.log(`Added ${questions.length} SQL Testbook questions to the DBMS mock test`);
    return mockTest;
  } catch (error) {
    console.error('Error adding questions to mock test:', error);
    process.exit(1);
  }
};

const main = async () => {
  try {
    const { mockTest, dbmsSubject } = await findOrCreateDBMSMockTest();
    await addQuestionsToMockTest(mockTest, dbmsSubject, sqlTestbookQuestions);
    console.log('Successfully added SQL Testbook questions to DBMS mock test');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error in main execution:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

main(); 