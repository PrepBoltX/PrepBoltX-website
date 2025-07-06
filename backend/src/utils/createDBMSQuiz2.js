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

// Questions to add - Set 2: More DBMS MCQs from GeeksForGeeks
const dbmsQuizQuestions = [
  {
    question: "In E-R model, Y is the dominant entity and X is subordinate entity. What happens if Y is deleted?",
    options: [
      "None of the above",
      "If Y is deleted, then X is also deleted",
      "If Y is deleted, then X is not deleted",
      "If X is deleted, then Y is also deleted"
    ],
    correctAnswer: 1,
    explanation: "In an E-R model, if the dominant entity (Y) is deleted, the subordinate entity (X) is also deleted due to the existence dependency.",
    difficulty: "medium",
    tags: ["ER model", "entity relationship"]
  },
  {
    question: "A view of database that appears to an application program is known as:",
    options: [
      "Schema",
      "Subschema",
      "Virtual table",
      "Index Table"
    ],
    correctAnswer: 1,
    explanation: "A subschema is the view of the database that appears to an application program.",
    difficulty: "easy",
    tags: ["views", "schemas"]
  },
  {
    question: "Which operation is used to extract specified columns from a table?",
    options: [
      "Project",
      "Join",
      "Extract",
      "Substitute"
    ],
    correctAnswer: 0,
    explanation: "The PROJECT operation is used to extract specified columns from a table in relational algebra.",
    difficulty: "easy",
    tags: ["relational algebra", "operations"]
  },
  {
    question: "The relation schemas R1 and R2 form a Lossless join decomposition of R if and only if:",
    options: [
      "(a) and (b) happens",
      "(a) and (d) happens",
      "(a) and (c) happens",
      "(b) and (c) happens"
    ],
    correctAnswer: 2,
    explanation: "Lossless join decomposition is guaranteed if (a) and (c) happen, based on the functional dependency conditions.",
    difficulty: "hard",
    tags: ["normalization", "lossless join"]
  },
  {
    question: "In functional dependency Armstrong inference rules refers to:",
    options: [
      "Reflexivity, Augmentation and Decomposition",
      "Transitivity, Augmentation and Reflexivity",
      "Augmentation, Transitivity, Reflexivity and Decomposition",
      "Reflexivity, Transitivity and Decomposition"
    ],
    correctAnswer: 0,
    explanation: "Armstrong's axioms are Reflexivity, Augmentation, and Transitivity. Decomposition is a derived rule.",
    difficulty: "medium",
    tags: ["functional dependency", "theory"]
  },
  {
    question: "Which of the following statements is FALSE about weak entity set?",
    options: [
      "Weak entities can be deleted automatically when their strong entity is deleted.",
      "Weak entity set avoids the data duplication and consequent possible inconsistencies caused by duplicating the key of the strong entity.",
      "A weak entity set has no primary keys unless attributes of the strong entity set on which it depends are included",
      "Tuples in a weak entity set are not partitioned according to their relationship with tuples in a strong entity set."
    ],
    correctAnswer: 3,
    explanation: "The false statement is: 'Tuples in a weak entity set are not partitioned according to their relationship with tuples in a strong entity set.'",
    difficulty: "medium",
    tags: ["ER model", "weak entity"]
  },
  {
    question: "Relation R has eight attributes ABCDEFGH. Fields of R contain only atomic values. F = {CH -> G, A -> BC, B -> CFH, E -> A, F -> EG} is a set of functional dependencies (FDs) so that F+ is exactly the set of FDs that hold for R. How many candidate keys does the relation R have?",
    options: [
      "3",
      "4",
      "5",
      "6"
    ],
    correctAnswer: 1,
    explanation: "The relation R has 4 candidate keys based on the closure of the given FDs.",
    difficulty: "hard",
    tags: ["candidate key", "functional dependency"]
  },
  {
    question: "In RDBMS, different classes of relations are created using ______ technique to prevent modification anomalies.",
    options: [
      "Functional Dependencies",
      "Data integrity",
      "Referential integrity",
      "Normal Forms"
    ],
    correctAnswer: 3,
    explanation: "Normal Forms are used to prevent modification anomalies in RDBMS.",
    difficulty: "easy",
    tags: ["normalization", "RDBMS"]
  },
  {
    question: "Which of the following is not a valid SQL constraint?",
    options: [
      "PRIMARY KEY",
      "FOREIGN KEY",
      "UNIQUE",
      "INDEX"
    ],
    correctAnswer: 3,
    explanation: "INDEX is not a constraint, it's a database object. PRIMARY KEY, FOREIGN KEY, and UNIQUE are constraints.",
    difficulty: "easy",
    tags: ["SQL", "constraints"]
  },
  {
    question: "Which of the following is not a valid set operation in SQL?",
    options: [
      "UNION",
      "INTERSECT",
      "MINUS",
      "JOIN"
    ],
    correctAnswer: 3,
    explanation: "JOIN is not a set operation. UNION, INTERSECT, and MINUS are set operations in SQL.",
    difficulty: "easy",
    tags: ["SQL", "set operations"]
  },
  {
    question: "Which of the following is not a valid isolation level in SQL?",
    options: [
      "READ UNCOMMITTED",
      "READ COMMITTED",
      "REPEATABLE READ",
      "READ SHARED"
    ],
    correctAnswer: 3,
    explanation: "READ SHARED is not a valid isolation level. The valid ones are READ UNCOMMITTED, READ COMMITTED, REPEATABLE READ, and SERIALIZABLE.",
    difficulty: "medium",
    tags: ["SQL", "isolation levels"]
  },
  {
    question: "Which of the following is not a valid type of relationship in an ER diagram?",
    options: [
      "One-to-One",
      "One-to-Many",
      "Many-to-Many",
      "Many-to-One-to-Many"
    ],
    correctAnswer: 3,
    explanation: "Many-to-One-to-Many is not a valid relationship type in ER diagrams.",
    difficulty: "easy",
    tags: ["ER diagram", "relationships"]
  },
  {
    question: "Which of the following is not a valid SQL data type?",
    options: [
      "VARCHAR",
      "INTEGER",
      "BOOLEAN",
      "CHARACTERIZED"
    ],
    correctAnswer: 3,
    explanation: "CHARACTERIZED is not a valid SQL data type. VARCHAR, INTEGER, and BOOLEAN are valid data types.",
    difficulty: "easy",
    tags: ["SQL", "data types"]
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
    question: "Which of the following is not a valid SQL function?",
    options: [
      "NOW()",
      "CURDATE()",
      "SYSDATE()",
      "DATEOF()"
    ],
    correctAnswer: 3,
    explanation: "DATEOF() is not a standard SQL function. NOW(), CURDATE(), and SYSDATE() are valid date/time functions.",
    difficulty: "easy",
    tags: ["SQL", "functions"]
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
    console.log('Successfully added DBMS quiz questions - Set 2');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error in main execution:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

// Run the main function
main(); 