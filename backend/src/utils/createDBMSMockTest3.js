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

const hardSQLQuestions = [
  {
    question: `Given table: Employees(id INT, name VARCHAR, manager_id INT, salary INT)
Which query returns the names of employees who earn more than their manager?`,
    options: [
      'SELECT e1.name FROM Employees e1 JOIN Employees e2 ON e1.manager_id = e2.id WHERE e1.salary > e2.salary;',
      'SELECT name FROM Employees WHERE salary > manager_id;',
      'SELECT name FROM Employees WHERE salary > (SELECT salary FROM Employees WHERE id = manager_id);',
      'SELECT e1.name FROM Employees e1 WHERE e1.salary > (SELECT salary FROM Employees WHERE id = e1.manager_id);'
    ],
    correctAnswer: 0,
    explanation: 'Self-join is required to compare each employee with their manager.',
    marks: 3,
    negativeMarks: 1,
    subject: 'DBMS',
    difficulty: 'hard'
  },
  {
    question: `Given table: Orders(order_id INT, customer_id INT, amount INT)
Which query finds customers who placed more than 3 orders?`,
    options: [
      'SELECT customer_id FROM Orders GROUP BY customer_id HAVING COUNT(*) > 3;',
      'SELECT customer_id FROM Orders WHERE COUNT(order_id) > 3;',
      'SELECT DISTINCT customer_id FROM Orders WHERE COUNT(*) > 3;',
      'SELECT customer_id FROM Orders GROUP BY customer_id WHERE COUNT(*) > 3;'
    ],
    correctAnswer: 0,
    explanation: 'GROUP BY with HAVING COUNT(*) > 3 finds such customers.',
    marks: 3,
    negativeMarks: 1,
    subject: 'DBMS',
    difficulty: 'hard'
  },
  {
    question: `Given table: Sales(id INT, region VARCHAR, amount INT)
Which query returns the region with the second highest total sales?`,
    options: [
      'SELECT region FROM (SELECT region, SUM(amount) AS total FROM Sales GROUP BY region ORDER BY total DESC LIMIT 1 OFFSET 1) t;',
      'SELECT region FROM Sales GROUP BY region ORDER BY SUM(amount) DESC LIMIT 1 OFFSET 1;',
      'SELECT region FROM Sales WHERE amount = (SELECT MAX(amount) FROM Sales);',
      'SELECT region FROM Sales GROUP BY region HAVING SUM(amount) = (SELECT MAX(SUM(amount)) FROM Sales GROUP BY region);'
    ],
    correctAnswer: 1,
    explanation: 'ORDER BY SUM(amount) DESC LIMIT 1 OFFSET 1 gives the second highest.',
    marks: 3,
    negativeMarks: 1,
    subject: 'DBMS',
    difficulty: 'hard'
  },
  {
    question: `Given table: Students(id INT, name VARCHAR, marks INT)
Which query returns the average marks of students who scored above the overall average?`,
    options: [
      'SELECT AVG(marks) FROM Students WHERE marks > (SELECT AVG(marks) FROM Students);',
      'SELECT AVG(marks) FROM Students WHERE marks >= (SELECT AVG(marks) FROM Students);',
      'SELECT AVG(marks) FROM Students;',
      'SELECT AVG(marks) FROM Students WHERE marks < (SELECT AVG(marks) FROM Students);'
    ],
    correctAnswer: 0,
    explanation: 'Subquery computes overall average, outer query filters above that.',
    marks: 3,
    negativeMarks: 1,
    subject: 'DBMS',
    difficulty: 'hard'
  },
  {
    question: `Given table: Products(id INT, name VARCHAR, price INT)
Which query returns the product(s) with the highest price?`,
    options: [
      'SELECT * FROM Products WHERE price = (SELECT MAX(price) FROM Products);',
      'SELECT * FROM Products ORDER BY price DESC LIMIT 1;',
      'SELECT name FROM Products WHERE price = MAX(price);',
      'SELECT name FROM Products WHERE price > ALL (SELECT price FROM Products);'
    ],
    correctAnswer: 0,
    explanation: 'WHERE price = (SELECT MAX(price)...) finds all products with the max price.',
    marks: 3,
    negativeMarks: 1,
    subject: 'DBMS',
    difficulty: 'hard'
  },
  {
    question: `Given table: Attendance(student_id INT, date DATE, present BOOLEAN)
Which query finds students who were present every day?`,
    options: [
      'SELECT student_id FROM Attendance GROUP BY student_id HAVING SUM(present) = COUNT(*);',
      'SELECT student_id FROM Attendance WHERE present = TRUE;',
      'SELECT DISTINCT student_id FROM Attendance WHERE present = TRUE;',
      'SELECT student_id FROM Attendance GROUP BY student_id HAVING COUNT(present) = COUNT(*);'
    ],
    correctAnswer: 0,
    explanation: 'SUM(present) = COUNT(*) only if present is TRUE for all dates.',
    marks: 3,
    negativeMarks: 1,
    subject: 'DBMS',
    difficulty: 'hard'
  },
  {
    question: `Given table: Employees(id INT, name VARCHAR, department VARCHAR, salary INT)
Which query returns the department with the highest average salary?`,
    options: [
      'SELECT department FROM Employees GROUP BY department ORDER BY AVG(salary) DESC LIMIT 1;',
      'SELECT department FROM Employees WHERE salary = (SELECT MAX(salary) FROM Employees);',
      'SELECT department FROM Employees GROUP BY department HAVING AVG(salary) = MAX(salary);',
      'SELECT department FROM Employees GROUP BY department WHERE AVG(salary) = (SELECT MAX(AVG(salary)) FROM Employees GROUP BY department);'
    ],
    correctAnswer: 0,
    explanation: 'ORDER BY AVG(salary) DESC LIMIT 1 gives the department with highest average.',
    marks: 3,
    negativeMarks: 1,
    subject: 'DBMS',
    difficulty: 'hard'
  },
  {
    question: `Given table: Transactions(id INT, user_id INT, amount INT, type VARCHAR)
Which query finds users who have only made deposits (type = 'deposit')?`,
    options: [
      "SELECT user_id FROM Transactions GROUP BY user_id HAVING SUM(type != 'deposit') = 0;",
      "SELECT user_id FROM Transactions WHERE type = 'deposit';",
      "SELECT DISTINCT user_id FROM Transactions WHERE type = 'deposit';",
      "SELECT user_id FROM Transactions GROUP BY user_id HAVING COUNT(type = 'deposit') = COUNT(*);"
    ],
    correctAnswer: 0,
    explanation: "SUM(type != 'deposit') = 0 means all types are 'deposit' for that user.",
    marks: 3,
    negativeMarks: 1,
    subject: 'DBMS',
    difficulty: 'hard'
  },
  {
    question: `Given table: ExamScores(student_id INT, subject VARCHAR, score INT)
Which query returns students who scored above 90 in all subjects?`,
    options: [
      'SELECT student_id FROM ExamScores GROUP BY student_id HAVING MIN(score) > 90;',
      'SELECT student_id FROM ExamScores WHERE score > 90;',
      'SELECT DISTINCT student_id FROM ExamScores WHERE score > 90;',
      'SELECT student_id FROM ExamScores GROUP BY student_id HAVING MAX(score) > 90;'
    ],
    correctAnswer: 0,
    explanation: 'MIN(score) > 90 means all scores for that student are above 90.',
    marks: 3,
    negativeMarks: 1,
    subject: 'DBMS',
    difficulty: 'hard'
  },
  {
    question: `Given table: Projects(id INT, team_id INT, budget INT)
Which query finds the team with the largest total project budget?`,
    options: [
      'SELECT team_id FROM Projects GROUP BY team_id ORDER BY SUM(budget) DESC LIMIT 1;',
      'SELECT team_id FROM Projects WHERE budget = (SELECT MAX(budget) FROM Projects);',
      'SELECT team_id FROM Projects GROUP BY team_id HAVING SUM(budget) = MAX(budget);',
      'SELECT team_id FROM Projects GROUP BY team_id WHERE SUM(budget) = (SELECT MAX(SUM(budget)) FROM Projects GROUP BY team_id);'
    ],
    correctAnswer: 0,
    explanation: 'ORDER BY SUM(budget) DESC LIMIT 1 gives the team with the largest total budget.',
    marks: 3,
    negativeMarks: 1,
    subject: 'DBMS',
    difficulty: 'hard'
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
    console.log(`Added ${questions.length} hard SQL questions to the DBMS mock test`);
    return mockTest;
  } catch (error) {
    console.error('Error adding questions to mock test:', error);
    process.exit(1);
  }
};

const main = async () => {
  try {
    const { mockTest, dbmsSubject } = await findOrCreateDBMSMockTest();
    await addQuestionsToMockTest(mockTest, dbmsSubject, hardSQLQuestions);
    console.log('Successfully added hard SQL questions to DBMS mock test');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error in main execution:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

main(); 