const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');
const Subject = require('../models/Subject');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Find or create a DBMS quiz
const findOrCreateDBMSQuiz = async () => {
  try {
    // Find the DBMS subject first
    const dbmsSubject = await Subject.findOne({ type: 'DBMS' });
    if (!dbmsSubject) {
      console.error('DBMS subject not found');
      process.exit(1);
    }

    // Look for an existing DBMS quiz
    let quiz = await Quiz.findOne({ 
      subject: dbmsSubject._id,
      title: 'DBMS MCQ Quiz - Part 1'
    });

    // If no quiz exists, create one
    if (!quiz) {
      console.log('No DBMS quiz found. Creating a new one...');
      quiz = new Quiz({
        title: 'DBMS MCQ Quiz - Part 1',
        description: 'Multiple choice questions on Database Management Systems covering fundamental concepts, normalization, SQL, and more.',
        subject: dbmsSubject._id,
        category: 'DBMS',
        type: 'practice',
        difficulty: 'medium',
        timeLimit: 1200,  // 20 minutes
        questions: [],
        featuredOrder: 100
      });
      await quiz.save();
      dbmsSubject.quizzes.push(quiz._id);
      await dbmsSubject.save();
      console.log('Created new DBMS quiz');
    } else {
      console.log('Found existing DBMS quiz. Adding questions to it...');
    }
    return quiz;
  } catch (error) {
    console.error('Error finding/creating DBMS quiz:', error);
    process.exit(1);
  }
};

// Questions to add - Set 3: More unique DBMS MCQs from GeeksForGeeks
const dbmsQuizQuestions = [
  {
    question: "Which of the following is a DDL command in SQL?",
    options: [
      "INSERT",
      "UPDATE",
      "CREATE",
      "SELECT"
    ],
    correctAnswer: 2,
    explanation: "CREATE is a Data Definition Language (DDL) command. INSERT and UPDATE are DML commands, SELECT is a query command.",
    difficulty: "easy",
    tags: ["SQL", "DDL"]
  },
  {
    question: "Which of the following is not a valid SQL statement?",
    options: [
      "SELECT * FROM table;",
      "DELETE FROM table;",
      "REMOVE FROM table;",
      "UPDATE table SET column = value;"
    ],
    correctAnswer: 2,
    explanation: "REMOVE FROM is not a valid SQL statement. DELETE FROM is used to remove records.",
    difficulty: "easy",
    tags: ["SQL", "statements"]
  },
  {
    question: "Which of the following is not a valid type of index in SQL?",
    options: [
      "Unique Index",
      "Composite Index",
      "Hash Index",
      "Array Index"
    ],
    correctAnswer: 3,
    explanation: "Array Index is not a standard SQL index type. Unique, Composite, and Hash Indexes are valid types.",
    difficulty: "medium",
    tags: ["SQL", "indexes"]
  },
  {
    question: "Which of the following is not a valid SQL operator?",
    options: [
      "BETWEEN",
      "IN",
      "LIKE",
      "OUT"
    ],
    correctAnswer: 3,
    explanation: "OUT is not a valid SQL operator. BETWEEN, IN, and LIKE are valid operators.",
    difficulty: "easy",
    tags: ["SQL", "operators"]
  },
  {
    question: "Which of the following is not a valid SQL aggregate function?",
    options: [
      "MAX",
      "MIN",
      "COUNT",
      "FIRST"
    ],
    correctAnswer: 3,
    explanation: "FIRST is not a standard SQL aggregate function. MAX, MIN, and COUNT are valid aggregate functions.",
    difficulty: "easy",
    tags: ["SQL", "aggregate functions"]
  },
  {
    question: "Which of the following is not a valid SQL clause?",
    options: [
      "HAVING",
      "GROUP BY",
      "ORDER BY",
      "FILTER BY"
    ],
    correctAnswer: 3,
    explanation: "FILTER BY is not a standard SQL clause. HAVING, GROUP BY, and ORDER BY are valid clauses.",
    difficulty: "easy",
    tags: ["SQL", "clauses"]
  },
  {
    question: "Which of the following is not a valid SQL join?",
    options: [
      "LEFT JOIN",
      "RIGHT JOIN",
      "FULL JOIN",
      "PARTIAL JOIN"
    ],
    correctAnswer: 3,
    explanation: "PARTIAL JOIN is not a valid SQL join type. LEFT, RIGHT, and FULL JOIN are valid join types.",
    difficulty: "easy",
    tags: ["SQL", "joins"]
  },
  {
    question: "Which of the following is not a valid SQL keyword?",
    options: [
      "WHERE",
      "GROUP",
      "ORDER",
      "SORT"
    ],
    correctAnswer: 3,
    explanation: "SORT is not a standard SQL keyword. ORDER BY is used for sorting.",
    difficulty: "easy",
    tags: ["SQL", "keywords"]
  },
  {
    question: "Which of the following is not a valid SQL data type?",
    options: [
      "DATE",
      "TIME",
      "DATETIME",
      "DATETIMESTAMP"
    ],
    correctAnswer: 3,
    explanation: "DATETIMESTAMP is not a standard SQL data type. DATE, TIME, and DATETIME are valid data types.",
    difficulty: "easy",
    tags: ["SQL", "data types"]
  },
  {
    question: "Which of the following is not a valid SQL constraint?",
    options: [
      "PRIMARY KEY",
      "FOREIGN KEY",
      "UNIQUE",
      "INDEXED"
    ],
    correctAnswer: 3,
    explanation: "INDEXED is not a standard SQL constraint. PRIMARY KEY, FOREIGN KEY, and UNIQUE are valid constraints.",
    difficulty: "easy",
    tags: ["SQL", "constraints"]
  },
  {
    question: "Which of the following is not a valid SQL function?",
    options: [
      "SUM()",
      "AVG()",
      "COUNT()",
      "TOTAL()"
    ],
    correctAnswer: 3,
    explanation: "TOTAL() is not a standard SQL function. SUM(), AVG(), and COUNT() are valid aggregate functions.",
    difficulty: "easy",
    tags: ["SQL", "functions"]
  },
  {
    question: "Which of the following is not a valid SQL statement?",
    options: [
      "SELECT",
      "INSERT",
      "UPDATE",
      "MODIFY"
    ],
    correctAnswer: 3,
    explanation: "MODIFY is not a standard SQL statement. ALTER is used to modify table structure.",
    difficulty: "easy",
    tags: ["SQL", "statements"]
  },
  {
    question: "Which of the following is not a valid SQL operator?",
    options: [
      "AND",
      "OR",
      "NOT",
      "XOR"
    ],
    correctAnswer: 3,
    explanation: "XOR is not a standard SQL logical operator. AND, OR, and NOT are valid logical operators.",
    difficulty: "medium",
    tags: ["SQL", "operators"]
  },
  {
    question: "Which of the following is not a valid SQL clause?",
    options: [
      "WHERE",
      "GROUP BY",
      "ORDER BY",
      "SORT BY"
    ],
    correctAnswer: 3,
    explanation: "SORT BY is not a standard SQL clause. ORDER BY is used for sorting.",
    difficulty: "easy",
    tags: ["SQL", "clauses"]
  },
  {
    question: "Which of the following is not a valid SQL join?",
    options: [
      "INNER JOIN",
      "OUTER JOIN",
      "CROSS JOIN",
      "SIDE JOIN"
    ],
    correctAnswer: 3,
    explanation: "SIDE JOIN is not a valid SQL join type.",
    difficulty: "easy",
    tags: ["SQL", "joins"]
  },
  {
    question: "Which of the following is not a valid SQL keyword?",
    options: [
      "SELECT",
      "INSERT",
      "UPDATE",
      "MODIFY"
    ],
    correctAnswer: 3,
    explanation: "MODIFY is not a standard SQL keyword. ALTER is used to modify table structure.",
    difficulty: "easy",
    tags: ["SQL", "keywords"]
  }
];

const addQuestionsToQuiz = async (quiz, questions) => {
  try {
    // Add questions to the quiz
    quiz.questions.push(...questions);
    await quiz.save();
    console.log(`Added ${questions.length} questions to the DBMS quiz`);
    return quiz;
  } catch (error) {
    console.error('Error adding questions to quiz:', error);
    process.exit(1);
  }
};

// Main execution
const main = async () => {
  try {
    // Find or create DBMS quiz
    const quiz = await findOrCreateDBMSQuiz();
    // Add questions to the quiz
    await addQuestionsToQuiz(quiz, dbmsQuizQuestions);
    console.log('Successfully added DBMS quiz questions - Set 3');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error in main execution:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

// Run the main function
main(); 