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
      
      // Save the quiz
      await quiz.save();
      
      // Add reference to subject
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

// Questions to add - Set 1: DBMS MCQs from GeeksForGeeks
const dbmsQuizQuestions = [
  {
    question: "Which of the following is not a level of data abstraction?",
    options: [
      "Physical Level",
      "Critical Level",
      "Logical Level",
      "View Level"
    ],
    correctAnswer: 1,
    explanation: "The three levels of data abstraction are Physical Level, Logical Level, and View Level. There is no 'Critical Level' in data abstraction.",
    difficulty: "easy",
    tags: ["data abstraction", "database architecture"]
  },
  {
    question: "Which of the following is not an example of a Database Management System?",
    options: [
      "MySQL",
      "Oracle",
      "Microsoft Access",
      "Microsoft Word"
    ],
    correctAnswer: 3,
    explanation: "Microsoft Word is a word processing application, not a Database Management System. MySQL, Oracle, and Microsoft Access are all examples of Database Management Systems.",
    difficulty: "easy",
    tags: ["DBMS", "software"]
  },
  {
    question: "Which of the following is not a feature of the database approach?",
    options: [
      "Data independence",
      "Data integrity",
      "Centralized control",
      "Data redundancy"
    ],
    correctAnswer: 3,
    explanation: "Data redundancy is not a feature but rather a problem that the database approach aims to minimize. Data independence, data integrity, and centralized control are all features of the database approach.",
    difficulty: "easy",
    tags: ["database approach", "data management"]
  },
  {
    question: "The language that requires a user to specify the data to be retrieved without specifying exactly how to get it is called:",
    options: [
      "Procedural language",
      "Non-procedural language",
      "High-level language",
      "Assembly language"
    ],
    correctAnswer: 1,
    explanation: "Non-procedural languages (like SQL) allow users to specify what data to retrieve without specifying the exact procedure for how to retrieve it. Procedural languages require step-by-step instructions.",
    difficulty: "medium",
    tags: ["query languages", "SQL"]
  },
  {
    question: "Which of the following is not a property of transactions?",
    options: [
      "Atomicity",
      "Consistency",
      "Isolation",
      "Parallelism"
    ],
    correctAnswer: 3,
    explanation: "ACID properties of transactions are Atomicity, Consistency, Isolation, and Durability. Parallelism is not one of the ACID properties.",
    difficulty: "medium",
    tags: ["transactions", "ACID properties"]
  },
  {
    question: "Which of the following is a type of Data Manipulation Language (DML)?",
    options: [
      "CREATE",
      "ALTER",
      "DROP",
      "UPDATE"
    ],
    correctAnswer: 3,
    explanation: "UPDATE is a Data Manipulation Language (DML) command. CREATE, ALTER, and DROP are Data Definition Language (DDL) commands.",
    difficulty: "easy",
    tags: ["SQL", "DML", "DDL"]
  },
  {
    question: "Which normal form deals with removing transitive dependencies?",
    options: [
      "First Normal Form (1NF)",
      "Second Normal Form (2NF)",
      "Third Normal Form (3NF)",
      "Boyce-Codd Normal Form (BCNF)"
    ],
    correctAnswer: 2,
    explanation: "Third Normal Form (3NF) deals with removing transitive dependencies, where non-prime attributes depend on other non-prime attributes.",
    difficulty: "medium",
    tags: ["normalization", "database design"]
  },
  {
    question: "Which of the following is not a valid transaction state?",
    options: [
      "Active",
      "Partially committed",
      "Committed",
      "Terminated"
    ],
    correctAnswer: 3,
    explanation: "The valid transaction states are Active, Partially Committed, Committed, Failed, and Aborted. 'Terminated' is not a standard transaction state.",
    difficulty: "medium",
    tags: ["transactions", "transaction states"]
  },
  {
    question: "Which of the following is used to ensure data integrity in a database?",
    options: [
      "Normalization",
      "Constraints",
      "Cursors",
      "Triggers"
    ],
    correctAnswer: 1,
    explanation: "Constraints are primarily used to ensure data integrity in a database. They include primary keys, foreign keys, unique constraints, check constraints, etc.",
    difficulty: "easy",
    tags: ["data integrity", "constraints"]
  },
  {
    question: "Which of the following is not a type of database key?",
    options: [
      "Primary Key",
      "Foreign Key",
      "Unique Key",
      "Master Key"
    ],
    correctAnswer: 3,
    explanation: "Master Key is not a standard type of database key. Primary Key, Foreign Key, and Unique Key are all valid types of keys used in database design.",
    difficulty: "easy",
    tags: ["database keys", "database design"]
  },
  {
    question: "In an ER diagram, an entity is represented by a:",
    options: [
      "Rectangle",
      "Ellipse",
      "Diamond",
      "Triangle"
    ],
    correctAnswer: 0,
    explanation: "In an ER diagram, entities are represented by rectangles, attributes by ellipses, and relationships by diamonds.",
    difficulty: "easy",
    tags: ["ER diagram", "database design"]
  },
  {
    question: "Which of the following is not a type of database architecture?",
    options: [
      "Centralized",
      "Distributed",
      "Hierarchical",
      "Decentralized"
    ],
    correctAnswer: 2,
    explanation: "Hierarchical is a type of database model, not a database architecture. Centralized, Distributed, and Decentralized are types of database architectures.",
    difficulty: "medium",
    tags: ["database architecture", "database models"]
  },
  {
    question: "Which of the following is used to uniquely identify a tuple in a relation?",
    options: [
      "Primary Key",
      "Foreign Key",
      "Super Key",
      "Candidate Key"
    ],
    correctAnswer: 0,
    explanation: "A Primary Key is used to uniquely identify a tuple (row) in a relation (table). It is a selected candidate key that cannot contain null values.",
    difficulty: "easy",
    tags: ["relational model", "database keys"]
  },
  {
    question: "Which of the following is not a characteristic of a relational database?",
    options: [
      "Tables with rows and columns",
      "Primary keys",
      "Foreign keys",
      "Parent-child relationship between nodes"
    ],
    correctAnswer: 3,
    explanation: "Parent-child relationship between nodes is a characteristic of hierarchical databases, not relational databases. Relational databases are characterized by tables with rows and columns, primary keys, and foreign keys.",
    difficulty: "medium",
    tags: ["relational database", "database models"]
  },
  {
    question: "Which of the following is not a type of SQL command?",
    options: [
      "DDL (Data Definition Language)",
      "DML (Data Manipulation Language)",
      "DCL (Data Control Language)",
      "DRL (Data Retrieval Language)"
    ],
    correctAnswer: 3,
    explanation: "DRL (Data Retrieval Language) is not a standard category of SQL commands. The standard categories are DDL, DML, DCL, and TCL (Transaction Control Language). SELECT statements are part of DML, not a separate category.",
    difficulty: "medium",
    tags: ["SQL", "database commands"]
  },
  {
    question: "Which of the following is not a valid aggregate function in SQL?",
    options: [
      "COUNT",
      "SUM",
      "AVG",
      "COMPUTE"
    ],
    correctAnswer: 3,
    explanation: "COMPUTE is not a standard SQL aggregate function. COUNT, SUM, and AVG are all valid aggregate functions in SQL.",
    difficulty: "easy",
    tags: ["SQL", "aggregate functions"]
  },
  {
    question: "Which of the following is not a valid join type in SQL?",
    options: [
      "INNER JOIN",
      "LEFT JOIN",
      "RIGHT JOIN",
      "CENTER JOIN"
    ],
    correctAnswer: 3,
    explanation: "CENTER JOIN is not a valid join type in SQL. Valid join types include INNER JOIN, LEFT JOIN, RIGHT JOIN, and FULL JOIN.",
    difficulty: "easy",
    tags: ["SQL", "joins"]
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
    
    console.log('Successfully added DBMS quiz questions - Set 1');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error in main execution:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

// Run the main function
main(); 