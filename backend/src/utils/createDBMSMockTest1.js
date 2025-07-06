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
      console.log('No DBMS mock test found. Creating a new one...');
      mockTest = new MockTest({
        title: 'DBMS Mock Test - Set 1',
        description: 'Mock test on Database Management Systems with a mix of conceptual and practical MCQs.',
        testType: 'subject',
        subjects: [dbmsSubject._id],
        duration: 1800, // 30 minutes
        totalMarks: 34,
        passingMarks: 12,
        sections: [],
        difficulty: 'medium',
        featured: true
      });
      await mockTest.save();
      dbmsSubject.mockTests.push(mockTest._id);
      await dbmsSubject.save();
      console.log('Created new DBMS mock test');
    } else {
      console.log('Found existing DBMS mock test. Adding questions to it...');
    }
    return { mockTest, dbmsSubject };
  } catch (error) {
    console.error('Error finding/creating DBMS mock test:', error);
    process.exit(1);
  }
};

const dbmsMockTestQuestions = [
  {
    question: 'What does DBMS stand for?',
    options: [
      'Database Management Software',
      'Database Modeling System',
      'Database Management System',
      'Database Model Software'
    ],
    correctAnswer: 2,
    explanation: 'DBMS stands for Database Management System, which is software for managing databases.',
    marks: 2,
    negativeMarks: 0.5,
    subject: 'DBMS',
    difficulty: 'easy'
  },
  {
    question: 'Which of the following is a type of DBMS model?',
    options: [
      'Relational',
      'Network',
      'Hierarchical',
      'All of the above'
    ],
    correctAnswer: 3,
    explanation: 'All listed options are types of DBMS models: Relational, Network, and Hierarchical.',
    marks: 2,
    negativeMarks: 0.5,
    subject: 'DBMS',
    difficulty: 'easy'
  },
  {
    question: 'Which of the following is NOT a component of DBMS?',
    options: [
      'Query Processor',
      'Database Engine',
      'Database Table',
      'Indexing Engine'
    ],
    correctAnswer: 2,
    explanation: 'Database Table is a data structure, not a DBMS component. The others are core DBMS components.',
    marks: 2,
    negativeMarks: 0.5,
    subject: 'DBMS',
    difficulty: 'medium'
  },
  {
    question: 'Which of the following is used to organize a database in DBMS?',
    options: [
      'Table',
      'Views',
      'Query',
      'All of the above'
    ],
    correctAnswer: 3,
    explanation: 'Tables, views, and queries are all used to organize and interact with data in a DBMS.',
    marks: 2,
    negativeMarks: 0.5,
    subject: 'DBMS',
    difficulty: 'easy'
  },
  {
    question: 'Which model uses a tree structure to represent relationships among data?',
    options: [
      'Relational Model',
      'Network Model',
      'Hierarchical Model',
      'Object-Oriented Model'
    ],
    correctAnswer: 2,
    explanation: 'The Hierarchical Model uses a tree structure for data relationships.',
    marks: 2,
    negativeMarks: 0.5,
    subject: 'DBMS',
    difficulty: 'medium'
  },
  {
    question: 'What SQL statement retrieves data from a database?',
    options: [
      'SELECT',
      'INSERT',
      'UPDATE',
      'DELETE'
    ],
    correctAnswer: 0,
    explanation: 'SELECT is used to retrieve data from a database.',
    marks: 2,
    negativeMarks: 0.5,
    subject: 'DBMS',
    difficulty: 'easy'
  },
  {
    question: 'What does normalization in a relational database help with?',
    options: [
      'Avoiding redundancy',
      'Increasing performance',
      'Reducing query time',
      'All of the above'
    ],
    correctAnswer: 0,
    explanation: 'Normalization helps avoid redundancy and update anomalies in relational databases.',
    marks: 2,
    negativeMarks: 0.5,
    subject: 'DBMS',
    difficulty: 'medium'
  },
  {
    question: 'What is a primary key used for?',
    options: [
      'Uniquely identify a record in a table',
      'Enforce relationships between tables',
      'Prevent data duplication',
      'All of the above'
    ],
    correctAnswer: 3,
    explanation: 'A primary key uniquely identifies records, enforces relationships, and prevents duplication.',
    marks: 2,
    negativeMarks: 0.5,
    subject: 'DBMS',
    difficulty: 'easy'
  },
  {
    question: 'Which of the following is NOT a type of relationship in a relational database?',
    options: [
      'One-to-One',
      'One-to-Many',
      'Many-to-Many',
      'Many-to-One'
    ],
    correctAnswer: 3,
    explanation: 'Many-to-One is not a standard relationship type; the standard types are One-to-One, One-to-Many, and Many-to-Many.',
    marks: 2,
    negativeMarks: 0.5,
    subject: 'DBMS',
    difficulty: 'medium'
  },
  {
    question: 'Which command is used to remove a table from a database in SQL?',
    options: [
      'DELETE',
      'DROP',
      'REMOVE',
      'TRUNCATE'
    ],
    correctAnswer: 1,
    explanation: 'DROP is used to remove a table from a database.',
    marks: 2,
    negativeMarks: 0.5,
    subject: 'DBMS',
    difficulty: 'easy'
  },
  {
    question: 'Which of the following ensures that database transactions are completed without errors?',
    options: [
      'Concurrency Control',
      'Transaction Control',
      'Data Integrity',
      'Backup Management'
    ],
    correctAnswer: 1,
    explanation: 'Transaction Control ensures that transactions are completed successfully or rolled back.',
    marks: 2,
    negativeMarks: 0.5,
    subject: 'DBMS',
    difficulty: 'medium'
  },
  {
    question: 'Which of the following is a type of constraint in DBMS?',
    options: [
      'Primary Key',
      'Foreign Key',
      'Check',
      'All of the above'
    ],
    correctAnswer: 3,
    explanation: 'Primary Key, Foreign Key, and Check are all types of constraints in DBMS.',
    marks: 2,
    negativeMarks: 0.5,
    subject: 'DBMS',
    difficulty: 'easy'
  },
  {
    question: 'What does SQL stand for?',
    options: [
      'Structured Query Language',
      'Simple Query Language',
      'Sequential Query Language',
      'None of the above'
    ],
    correctAnswer: 0,
    explanation: 'SQL stands for Structured Query Language.',
    marks: 2,
    negativeMarks: 0.5,
    subject: 'DBMS',
    difficulty: 'easy'
  },
  {
    question: 'Which of the following is an advantage of using DBMS?',
    options: [
      'Data Redundancy',
      'Data Integrity',
      'Less Security',
      'Data Anomalies'
    ],
    correctAnswer: 1,
    explanation: 'Data integrity is a major advantage of using a DBMS.',
    marks: 2,
    negativeMarks: 0.5,
    subject: 'DBMS',
    difficulty: 'easy'
  },
  {
    question: 'What is a foreign key in a relational database?',
    options: [
      'A key used to identify a column uniquely in a table',
      'A key used to connect two tables',
      'A key that does not allow NULL values',
      'A key used to store passwords'
    ],
    correctAnswer: 1,
    explanation: 'A foreign key is used to connect two tables and enforce referential integrity.',
    marks: 2,
    negativeMarks: 0.5,
    subject: 'DBMS',
    difficulty: 'medium'
  },
  {
    question: 'Which of the following is a characteristic of the relational model?',
    options: [
      'Data is organized into tables',
      'Relationships are represented using pointers',
      'Data is stored as objects',
      'None of the above'
    ],
    correctAnswer: 0,
    explanation: 'In the relational model, data is organized into tables.',
    marks: 2,
    negativeMarks: 0.5,
    subject: 'DBMS',
    difficulty: 'easy'
  },
  {
    question: 'What is the purpose of an index in a Database?',
    options: [
      'Speed up data retrieval',
      'Ensure data integrity',
      'Prevent data redundancy',
      'All of the above'
    ],
    correctAnswer: 0,
    explanation: 'Indexes are used to speed up data retrieval in databases.',
    marks: 2,
    negativeMarks: 0.5,
    subject: 'DBMS',
    difficulty: 'medium'
  },
  {
    question: 'Which of the following SQL queries will return the number of employees in the Employees table?',
    options: [
      'SELECT COUNT(*) FROM Employees;',
      'SELECT SUM(*) FROM Employees;',
      'SELECT NUMBER(*) FROM Employees;',
      'SELECT TOTAL(*) FROM Employees;'
    ],
    correctAnswer: 0,
    explanation: 'COUNT(*) returns the number of rows in the table.',
    marks: 2,
    negativeMarks: 0.5,
    subject: 'DBMS',
    difficulty: 'medium'
  },
  {
    question: 'Given a table Students(name, marks), which query returns names of students with marks greater than 80?',
    options: [
      'SELECT name FROM Students WHERE marks > 80;',
      'SELECT name WHERE marks > 80 FROM Students;',
      'SELECT * FROM Students WHERE name > 80;',
      'SELECT name, marks > 80 FROM Students;'
    ],
    correctAnswer: 0,
    explanation: 'The WHERE clause filters rows where marks > 80.',
    marks: 2,
    negativeMarks: 0.5,
    subject: 'DBMS',
    difficulty: 'medium'
  },
  {
    question: 'What is the output of: SELECT AVG(salary) FROM Employees WHERE department = "HR";',
    options: [
      'The average salary of all employees',
      'The average salary of employees in HR department',
      'The sum of salaries in HR department',
      'The highest salary in HR department'
    ],
    correctAnswer: 1,
    explanation: 'AVG() computes the average for the filtered rows (department = "HR").',
    marks: 2,
    negativeMarks: 0.5,
    subject: 'DBMS',
    difficulty: 'medium'
  },
  {
    question: 'Which query finds duplicate email addresses in a Users table?',
    options: [
      'SELECT email FROM Users GROUP BY email HAVING COUNT(*) > 1;',
      'SELECT email FROM Users WHERE COUNT(email) > 1;',
      'SELECT DISTINCT email FROM Users;',
      'SELECT email, COUNT(*) = 1 FROM Users;'
    ],
    correctAnswer: 0,
    explanation: 'GROUP BY with HAVING COUNT(*) > 1 finds duplicates.',
    marks: 2,
    negativeMarks: 0.5,
    subject: 'DBMS',
    difficulty: 'hard'
  },
  {
    question: 'Which SQL query returns the second highest salary from Employee table?',
    options: [
      'SELECT MAX(salary) FROM Employee;',
      'SELECT salary FROM Employee ORDER BY salary DESC LIMIT 1 OFFSET 1;',
      'SELECT TOP 2 salary FROM Employee ORDER BY salary DESC;',
      'SELECT salary FROM Employee WHERE salary = (SELECT MAX(salary) FROM Employee);'
    ],
    correctAnswer: 1,
    explanation: 'ORDER BY salary DESC LIMIT 1 OFFSET 1 returns the second highest salary (MySQL syntax).',
    marks: 2,
    negativeMarks: 0.5,
    subject: 'DBMS',
    difficulty: 'hard'
  },
  {
    question: 'What does the following query do? SELECT department, COUNT(*) FROM Employees GROUP BY department;',
    options: [
      'Counts total employees',
      'Counts employees in each department',
      'Lists all departments',
      'Returns only departments with more than one employee'
    ],
    correctAnswer: 1,
    explanation: 'GROUP BY department aggregates and counts employees per department.',
    marks: 2,
    negativeMarks: 0.5,
    subject: 'DBMS',
    difficulty: 'medium'
  },
  {
    question: 'Which query will update the salary to 50000 for all employees in IT department?',
    options: [
      'UPDATE Employees SET salary = 50000 WHERE department = "IT";',
      'UPDATE Employees salary = 50000 WHERE department = "IT";',
      'SET salary = 50000 IN Employees WHERE department = "IT";',
      'UPDATE salary = 50000 FROM Employees WHERE department = "IT";'
    ],
    correctAnswer: 0,
    explanation: 'UPDATE ... SET ... WHERE ... is the correct syntax.',
    marks: 2,
    negativeMarks: 0.5,
    subject: 'DBMS',
    difficulty: 'medium'
  },
  {
    question: 'Which query will delete all records from the Orders table?',
    options: [
      'DELETE FROM Orders;',
      'REMOVE FROM Orders;',
      'DROP Orders;',
      'DELETE * FROM Orders;'
    ],
    correctAnswer: 0,
    explanation: 'DELETE FROM Orders; removes all rows but keeps the table structure.',
    marks: 2,
    negativeMarks: 0.5,
    subject: 'DBMS',
    difficulty: 'medium'
  },
  {
    question: 'What is the result of: SELECT name FROM Students WHERE name LIKE "A%";',
    options: [
      'Names containing the letter A',
      'Names ending with A',
      'Names starting with A',
      'Names with exactly one A'
    ],
    correctAnswer: 2,
    explanation: 'LIKE "A%" matches names that start with A.',
    marks: 2,
    negativeMarks: 0.5,
    subject: 'DBMS',
    difficulty: 'medium'
  },
  {
    question: 'Which query will return the highest marks from the Results table?',
    options: [
      'SELECT MAX(marks) FROM Results;',
      'SELECT TOP 1 marks FROM Results;',
      'SELECT marks FROM Results ORDER BY marks DESC;',
      'SELECT marks FROM Results WHERE marks = MAX(marks);'
    ],
    correctAnswer: 0,
    explanation: 'MAX(marks) returns the highest value in the column.',
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
    console.log(`Added ${questions.length} questions to the DBMS mock test`);
    return mockTest;
  } catch (error) {
    console.error('Error adding questions to mock test:', error);
    process.exit(1);
  }
};

const main = async () => {
  try {
    const { mockTest, dbmsSubject } = await findOrCreateDBMSMockTest();
    await addQuestionsToMockTest(mockTest, dbmsSubject, dbmsMockTestQuestions);
    console.log('Successfully added DBMS mock test questions - Set 1');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error in main execution:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

main(); 