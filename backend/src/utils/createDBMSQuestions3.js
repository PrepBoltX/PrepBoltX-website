const mongoose = require('mongoose');
const Interview = require('../models/Interview');
const Subject = require('../models/Subject');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

/**
 * Find the existing DBMS interview
 * @returns {Promise<Document>} The DBMS interview document
 */
const findDBMSInterview = async () => {
    try {
        // Find the DBMS subject first
        const dbmsSubject = await Subject.findOne({ type: 'DBMS' });
        if (!dbmsSubject) {
            throw new Error('DBMS subject not found');
        }

        // Look for an existing DBMS interview
        const interview = await Interview.findOne({ 
            jobRole: 'Database Developer',
            subjects: dbmsSubject._id
        });

        // Check if interview exists
        if (!interview) {
            throw new Error('DBMS Interview not found. Please run createDBMSQuestions1.js first.');
        }
        
        return interview;
    } catch (error) {
        console.error('Error finding DBMS interview:', error);
        throw error;
    }
};

// Define 10 more DBMS interview questions
const dbmsQuestions = [
    {
        question: "What is database sharding?",
        expectedAnswer: "Database sharding is a horizontal partitioning technique that splits a large database into smaller, faster, and more manageable pieces called shards. Each shard is stored on separate database servers, distributing the load. Sharding improves performance, scalability, and availability by allowing parallel operations across multiple machines. It's particularly useful for very large datasets or high-throughput applications. However, it adds complexity to database operations, especially those that need to access data across multiple shards.",
        tips: "Explain the concept clearly, mention its benefits (improved performance, scalability), and also touch on challenges (complexity in cross-shard operations, potential data distribution issues).",
        difficulty: "mid",
        questionType: "technical"
    },
    {
        question: "Explain the CAP theorem and its implications for distributed database systems.",
        expectedAnswer: "The CAP theorem states that a distributed database system can only guarantee two out of three properties simultaneously: Consistency (all nodes see the same data at the same time), Availability (every request receives a response, without guarantee that it contains the most recent data), and Partition tolerance (the system continues to operate despite network partitions). In practice, since network partitions are unavoidable in distributed systems, database designers must choose between consistency and availability. For example, NoSQL databases like MongoDB prioritize availability and partition tolerance over strict consistency, while traditional RDBMS systems like PostgreSQL prioritize consistency.",
        tips: "Define each component of CAP clearly, explain why you can only have two out of three, and provide real-world examples of database systems that make different trade-offs.",
        difficulty: "senior",
        questionType: "technical"
    },
    {
        question: "What are materialized views and when would you use them?",
        expectedAnswer: "Materialized views are database objects that contain the results of a query physically stored as a table. Unlike regular views which execute their defining query each time they're accessed, materialized views store the query results, making data retrieval faster. They're particularly useful for complex queries that are executed frequently but where the underlying data doesn't change often. Common use cases include data warehousing, reporting systems, and applications with complex aggregations or joins. The trade-off is that they require storage space and need to be refreshed when the underlying data changes.",
        tips: "Compare materialized views with regular views, discuss performance benefits, and mention refresh strategies (complete refresh vs. incremental updates).",
        difficulty: "mid",
        questionType: "technical"
    },
    {
        question: "What is a database deadlock and how can it be prevented?",
        expectedAnswer: "A database deadlock occurs when two or more transactions are waiting for each other to release locks, resulting in none of them being able to proceed. For example, Transaction A holds a lock on Resource 1 and needs Resource 2, while Transaction B holds Resource 2 and needs Resource 1. Prevention strategies include: 1) Using a consistent order for acquiring locks, 2) Implementing deadlock detection algorithms, 3) Setting transaction timeouts, 4) Using optimistic locking instead of pessimistic locking where appropriate, and 5) Minimizing the duration transactions hold locks by keeping transactions short and focused.",
        tips: "Explain the concept with a clear example, discuss detection methods, and provide multiple prevention strategies with their trade-offs.",
        difficulty: "mid",
        questionType: "technical"
    },
    {
        question: "Explain the concept of database connection pooling and its benefits.",
        expectedAnswer: "Database connection pooling is a technique where a pool of database connections is created and maintained, allowing them to be reused when needed instead of establishing a new connection each time. Benefits include: 1) Improved performance by reducing the overhead of creating new connections, 2) Better resource management by limiting the maximum number of connections, 3) Reduced database server load, 4) Faster response times for applications, and 5) Better handling of connection spikes. Most modern applications use connection pooling through libraries or frameworks to optimize database interactions.",
        tips: "Discuss both performance benefits and resource management aspects, mention common connection pooling libraries, and explain configuration parameters like minimum and maximum pool size.",
        difficulty: "junior",
        questionType: "technical"
    },
    {
        question: "What is eventual consistency in distributed databases?",
        expectedAnswer: "Eventual consistency is a consistency model used in distributed databases that guarantees that, if no new updates are made to a given data item, eventually all accesses to that item will return the last updated value. It allows for temporary inconsistencies and higher availability but ensures that the system will eventually become consistent. This model is commonly used in distributed NoSQL databases like Cassandra, DynamoDB, and CouchDB. It's particularly useful in systems where high availability and partition tolerance are more important than immediate consistency, such as social media platforms, content delivery networks, or systems with geographically distributed users.",
        tips: "Contrast eventual consistency with strong consistency, discuss real-world use cases, and mention the trade-offs involved in choosing this model.",
        difficulty: "mid",
        questionType: "technical"
    },
    {
        question: "How does a B-tree index work and why is it commonly used in databases?",
        expectedAnswer: "A B-tree is a self-balancing tree data structure that maintains sorted data and allows for efficient insertion, deletion, and search operations. In databases, B-tree indexes organize data in a way that enables logarithmic time searches rather than linear scans. Each node in a B-tree contains multiple keys and pointers to child nodes. The structure ensures that the tree remains balanced, with all leaf nodes at the same depth. B-trees are widely used in databases because they: 1) Efficiently handle range queries, 2) Perform well with both disk-based and in-memory storage, 3) Minimize disk I/O operations, 4) Maintain good performance even as the data grows, and 5) Support various query patterns including equality searches, range searches, and prefix matching.",
        tips: "Explain the structure clearly, compare with other index types like hash indexes, and discuss performance characteristics for different operations.",
        difficulty: "mid",
        questionType: "technical"
    },
    {
        question: "What is database normalization and what are its advantages and disadvantages?",
        expectedAnswer: "Database normalization is the process of structuring a relational database to reduce data redundancy and improve data integrity by organizing fields and tables according to dependencies and ensuring that relationships between tables are stored through foreign keys. The main advantages include: 1) Minimized data redundancy, 2) Reduced update anomalies, 3) Improved data consistency, 4) Better database organization, and 5) More flexible database design. However, there are disadvantages: 1) Increased complexity of queries requiring joins, 2) Potential performance issues with complex queries across multiple tables, 3) More complex application code to handle the normalized structure, and 4) Possibly slower data retrieval for reporting or analytical purposes. In practice, database designers often denormalize certain parts of a normalized database to optimize for specific query patterns.",
        tips: "Explain the different normal forms (1NF through 5NF), provide examples of when to normalize and when to denormalize, and discuss real-world trade-offs.",
        difficulty: "junior",
        questionType: "technical"
    },
    {
        question: "What are database isolation levels and how do they affect concurrency?",
        expectedAnswer: "Database isolation levels define how transaction integrity is visible to other users and systems. The standard isolation levels, from lowest to highest, are: 1) Read Uncommitted - allows dirty reads, non-repeatable reads, and phantom reads; 2) Read Committed - prevents dirty reads but allows non-repeatable reads and phantom reads; 3) Repeatable Read - prevents dirty and non-repeatable reads but allows phantom reads; 4) Serializable - prevents all concurrency side effects by essentially executing transactions serially. Higher isolation levels provide better data consistency but reduce concurrency and may lead to performance issues. Database administrators must choose the appropriate isolation level based on application requirements, balancing data consistency needs against performance considerations.",
        tips: "Define each isolation level clearly, explain the concurrency phenomena (dirty reads, non-repeatable reads, phantom reads), and discuss how different databases implement these levels.",
        difficulty: "senior",
        questionType: "technical"
    },
    {
        question: "Explain the concept of database replication and its types.",
        expectedAnswer: "Database replication is the process of creating and maintaining multiple copies of a database across different servers. The main types are: 1) Synchronous replication - changes are applied to all replicas within the same transaction, ensuring strong consistency but potentially impacting performance; 2) Asynchronous replication - changes are applied to replicas after the primary transaction completes, offering better performance but possible temporary inconsistencies; 3) Master-slave replication - one primary (master) database accepts writes while one or more secondary (slave) databases maintain copies for read operations; 4) Multi-master replication - multiple databases accept write operations and synchronize with each other. Replication provides benefits like improved availability, fault tolerance, read scalability, and geographic distribution of data.",
        tips: "Discuss the trade-offs between different replication strategies, mention conflict resolution in multi-master setups, and provide examples of when each type is appropriate.",
        difficulty: "mid",
        questionType: "technical"
    }
];

/**
 * Add questions to the interview
 * @param {Document} interview - The interview document
 * @param {Array} questions - Array of question objects
 * @returns {Promise<void>}
 */
const addQuestionsToInterview = async (interview, questions) => {
    try {
        // Add each question to the interview
        questions.forEach(q => {
            interview.questions.push({
                question: q.question,
                expectedAnswer: q.expectedAnswer,
                tips: q.tips,
                difficulty: q.difficulty || 'mid',
                questionType: q.questionType || 'technical',
                timeToAnswer: 120
            });
        });

        // Save the updated interview
        await interview.save();
        console.log(`Added ${questions.length} questions to the interview`);
    } catch (error) {
        console.error('Error adding questions to interview:', error);
        throw error;
    }
};

/**
 * Main function to execute the script
 */
const main = async () => {
    try {
        // Find the DBMS interview
        const interview = await findDBMSInterview();
        console.log(`Found DBMS interview: ${interview.title}`);
        
        // Add questions to the interview
        await addQuestionsToInterview(interview, dbmsQuestions);
        
        console.log('Successfully added DBMS questions to the interview!');
        process.exit(0);
    } catch (error) {
        console.error('Error in main function:', error);
        process.exit(1);
    }
};

// Execute the main function
main(); 