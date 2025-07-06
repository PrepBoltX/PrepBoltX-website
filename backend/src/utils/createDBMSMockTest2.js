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

const sqlQueryQuestions = [
  {
    question: 'What will be the output of: SELECT COUNT(DISTINCT department) FROM Employees;',
    options: [
      'Counts all employees',
      'Counts unique departments',
      'Counts all rows including duplicates',
      'Counts only NULL departments'
    ],
    correctAnswer: 1,
    explanation: 'COUNT(DISTINCT department) counts the number of unique department values.',
    marks: 2,
    negativeMarks: 0.5,
    subject: 'DBMS',
    difficulty: 'medium'
  },
  {
    question: 'Which query returns the names of employees who do not have a manager?',
    options: [
      'SELECT name FROM Employees WHERE manager_id IS NULL;',
      'SELECT name FROM Employees WHERE manager_id = 0;',
      'SELECT name FROM Employees WHERE manager_id = "";',
      'SELECT name FROM Employees WHERE manager_id = NOT NULL;'
    ],
    correctAnswer: 0,
    explanation: 'IS NULL checks for NULL values in SQL.',
    marks: 2,
    negativeMarks: 0.5,
    subject: 'DBMS',
    difficulty: 'medium'
  },
  {
    question: 'Given: SELECT * FROM Orders WHERE order_date BETWEEN "2023-01-01" AND "2023-12-31"; What does this query do?',
    options: [
      'Selects orders placed in 2023',
      'Selects orders before 2023',
      'Selects orders after 2023',
      'Selects all orders regardless of date'
    ],
    correctAnswer: 0,
    explanation: 'BETWEEN ... AND ... selects values within the specified range, inclusive.',
    marks: 2,
    negativeMarks: 0.5,
    subject: 'DBMS',
    difficulty: 'medium'
  },
  {
    question: 'Which SQL query finds the maximum salary in each department?',
    options: [
      'SELECT department, MAX(salary) FROM Employees GROUP BY department;',
      'SELECT MAX(salary) FROM Employees;',
      'SELECT department, salary FROM Employees WHERE salary = MAX(salary);',
      'SELECT department, salary FROM Employees GROUP BY department;'
    ],
    correctAnswer: 0,
    explanation: 'GROUP BY department with MAX(salary) gives the max salary per department.',
    marks: 2,
    negativeMarks: 0.5,
    subject: 'DBMS',
    difficulty: 'medium'
  },
  {
    question: 'What is the result of: SELECT name FROM Students WHERE marks IN (90, 95, 100);',
    options: [
      'Names of students with marks 90, 95, or 100',
      'Names of students with marks less than 90',
      'Names of students with marks greater than 100',
      'All students except those with marks 90, 95, or 100'
    ],
    correctAnswer: 0,
    explanation: 'IN (90, 95, 100) matches any of the listed values.',
    marks: 2,
    negativeMarks: 0.5,
    subject: 'DBMS',
    difficulty: 'medium'
  },
  {
    question: 'Which query will return the first 5 rows from the Products table?',
    options: [
      'SELECT * FROM Products LIMIT 5;',
      'SELECT TOP 5 * FROM Products;',
      'SELECT * FROM Products WHERE ROWNUM <= 5;',
      'All of the above, depending on SQL dialect'
    ],
    correctAnswer: 3,
    explanation: 'LIMIT (MySQL), TOP (SQL Server), and ROWNUM (Oracle) are all used in different SQL dialects.',
    marks: 2,
    negativeMarks: 0.5,
    subject: 'DBMS',
    difficulty: 'hard'
  },
  {
    question: 'What does the following query do? SELECT department, AVG(salary) FROM Employees GROUP BY department HAVING AVG(salary) > 50000;',
    options: [
      'Lists departments with average salary above 50000',
      'Lists all employees with salary above 50000',
      'Lists all departments',
      'Lists employees with average salary below 50000'
    ],
    correctAnswer: 0,
    explanation: 'HAVING is used to filter groups after aggregation.',
    marks: 2,
    negativeMarks: 0.5,
    subject: 'DBMS',
    difficulty: 'hard'
  },
  {
    question: 'Which query will return employees whose names start with "S"?',
    options: [
      'SELECT * FROM Employees WHERE name LIKE "S%";',
      'SELECT * FROM Employees WHERE name = "S";',
      'SELECT * FROM Employees WHERE name LIKE "%S";',
      'SELECT * FROM Employees WHERE name = "%S%";'
    ],
    correctAnswer: 0,
    explanation: 'LIKE "S%" matches names starting with S.',
    marks: 2,
    negativeMarks: 0.5,
    subject: 'DBMS',
    difficulty: 'medium'
  },
  {
    question: 'What is the output of: SELECT department, COUNT(*) FROM Employees GROUP BY department HAVING COUNT(*) > 10;',
    options: [
      'Departments with more than 10 employees',
      'All employees in each department',
      'Departments with less than 10 employees',
      'All departments regardless of size'
    ],
    correctAnswer: 0,
    explanation: 'HAVING COUNT(*) > 10 filters groups with more than 10 employees.',
    marks: 2,
    negativeMarks: 0.5,
    subject: 'DBMS',
    difficulty: 'hard'
  },
  {
    question: 'Which query will return the total price for each order in the Orders table?',
    options: [
      'SELECT order_id, SUM(price) FROM Orders GROUP BY order_id;',
      'SELECT SUM(price) FROM Orders;',
      'SELECT order_id, price FROM Orders;',
      'SELECT * FROM Orders WHERE price = SUM(price);'
    ],
    correctAnswer: 0,
    explanation: 'SUM(price) with GROUP BY order_id gives total price per order.',
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
    console.log(`Added ${questions.length} SQL query questions to the DBMS mock test`);
    return mockTest;
  } catch (error) {
    console.error('Error adding questions to mock test:', error);
    process.exit(1);
  }
};

const main = async () => {
  try {
    const { mockTest, dbmsSubject } = await findOrCreateDBMSMockTest();
    await addQuestionsToMockTest(mockTest, dbmsSubject, sqlQueryQuestions);
    console.log('Successfully added SQL query-based questions to DBMS mock test');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error in main execution:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

main(); 