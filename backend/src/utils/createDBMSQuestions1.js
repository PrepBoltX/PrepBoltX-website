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
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Find or create a DBMS interview
const findOrCreateDBMSInterview = async () => {
  try {
    // Find the DBMS subject first
    const dbmsSubject = await Subject.findOne({ type: 'DBMS' });
    if (!dbmsSubject) {
      console.error('DBMS subject not found');
      process.exit(1);
    }

    // Look for an existing DBMS interview
    let interview = await Interview.findOne({ 
      jobRole: 'Database Developer',
      subjects: dbmsSubject._id
    });

    // If no interview exists, create one
    if (!interview) {
      console.log('No DBMS interview found. Creating a new one...');
      
      interview = new Interview({
        title: 'DBMS Technical Interview',
        description: 'Comprehensive DBMS interview questions covering fundamental concepts, database design, SQL, and advanced topics.',
        jobRole: 'Database Developer',
        company: 'Tech Companies',
        experienceLevel: 'mid',
        subjects: [dbmsSubject._id],
        questions: [],
        feedbackModel: 'detailed'
      });
      
      // Save the interview
      await interview.save();
      
      // Add reference to subject
      dbmsSubject.interviews.push(interview._id);
      await dbmsSubject.save();
      
      console.log('Created new DBMS interview');
    } else {
      console.log('Found existing DBMS interview. Adding questions to it...');
    }
    
    return interview;
  } catch (error) {
    console.error('Error finding/creating DBMS interview:', error);
    process.exit(1);
  }
};

// Questions to add - Set 1: Basic DBMS Concepts
const dbmsQuestions = [
  {
    question: "What is DBMS? What are its advantages over traditional file systems?",
    expectedAnswer: "A Database Management System (DBMS) is software designed to store, retrieve, define, and manage data in a database. Advantages over traditional file systems include: 1) Data redundancy and inconsistency reduction, 2) Data sharing and multi-user transaction processing, 3) Access control and data security, 4) Data independence (physical and logical), 5) Backup and recovery mechanisms, 6) Data integrity enforcement, and 7) Standardized access through query languages.",
    tips: "Focus on addressing redundancy, consistency, security, and data independence aspects in your answer. Real-world examples help demonstrate understanding.",
    difficulty: "entry",
    questionType: "technical",
    timeToAnswer: 120
  },
  {
    question: "Explain the difference between DBMS and RDBMS.",
    expectedAnswer: "DBMS (Database Management System) is software for creating and managing databases, storing data in a file system with minimal structure. RDBMS (Relational DBMS) is a type of DBMS that specifically stores data in a tabular form with relationships between tables. Key differences include: 1) RDBMS follows the relational model and supports tables with relationships, while DBMS may use hierarchical or network models, 2) RDBMS enforces ACID properties for transactions whereas basic DBMS might not, 3) RDBMS uses SQL as standard query language, 4) RDBMS provides stronger data integrity through primary keys, foreign keys, and constraints, 5) RDBMS typically offers better security features. Examples of RDBMS include MySQL, PostgreSQL, Oracle, while examples of non-relational DBMS include MongoDB, Cassandra, and Redis.",
    tips: "Use specific examples of RDBMS (like MySQL, PostgreSQL) versus non-relational DBMS (MongoDB, Redis) to illustrate differences. Mention ACID properties briefly.",
    difficulty: "entry",
    questionType: "technical",
    timeToAnswer: 120
  },
  {
    question: "What are the three schema levels in the database architecture? Explain each briefly.",
    expectedAnswer: "The three schema levels in database architecture are: 1) External/View Schema: Represents the user's view of the database, showing only data relevant to specific users or applications, hiding complexity. Multiple external schemas can exist. 2) Conceptual/Logical Schema: Represents the complete logical structure of the entire database, showing all entities, relationships, constraints, and security requirements independent of physical storage. 3) Internal/Physical Schema: Describes how data is physically stored, including storage structures, file organization, access paths, and indexes. This level handles physical data organization, compression, and encryption.",
    tips: "Use the terms 'data abstraction' and 'data independence' when explaining how these schema levels relate to each other. Mention how changes at one level can be isolated from other levels.",
    difficulty: "mid",
    questionType: "technical",
    timeToAnswer: 120
  },
  {
    question: "Explain data abstraction and its levels.",
    expectedAnswer: "Data abstraction is the process of hiding irrelevant details from users while showing only essential information. In database systems, it has three levels: 1) Physical level: The lowest level describing how data is actually stored. It deals with storage allocation, data structures, access paths, and physical records. 2) Logical level: The middle level describing what data is stored and relationships among data elements. It concerns tables, fields, relationships, constraints, and security details. 3) View level: The highest level showing only relevant portions of the database to different users based on their needs and permissions. Each view can represent a subset of the database customized for specific user groups.",
    tips: "Connect data abstraction to the three schema architecture. Explain how it enables different users to interact with the same database differently based on their roles and requirements.",
    difficulty: "mid",
    questionType: "technical",
    timeToAnswer: 120
  },
  {
    question: "What is a database transaction? Explain ACID properties.",
    expectedAnswer: "A database transaction is a logical unit of work that must be entirely completed or entirely aborted. ACID properties ensure transaction reliability: 1) Atomicity: A transaction is treated as a single, indivisible unit that either completes entirely or fails completely (all-or-nothing). 2) Consistency: A transaction must transform the database from one valid state to another valid state, maintaining all defined rules and constraints. 3) Isolation: Transactions execute independently without interference, as if they were executed sequentially, even when executed concurrently. 4) Durability: Once a transaction is committed, its changes persist even in the event of system failures, typically through write-ahead logging and database backups.",
    tips: "Provide real-world examples for each property, like bank transfers demonstrating atomicity. Explain the implications of each property for database reliability.",
    difficulty: "mid",
    questionType: "technical",
    timeToAnswer: 150
  },
  {
    question: "What is database normalization and what are its benefits?",
    expectedAnswer: "Database normalization is the process of organizing data in a database to reduce redundancy and improve data integrity by dividing large tables into smaller, related tables and defining relationships between them. Benefits include: 1) Minimizing data redundancy, which reduces storage requirements and lowers the risk of inconsistencies, 2) Improving data integrity by reducing update, insertion, and deletion anomalies, 3) Better database organization through logical data grouping, 4) More flexible database design that's easier to modify and extend, 5) Improved query performance for certain operations, particularly insertions, updates, and deletions, though complex joins might be slower, 6) Enforcing business rules and constraints through relationships.",
    tips: "Briefly mention the different normal forms (1NF through 3NF at minimum). Use a simple example to show how a denormalized table would be normalized.",
    difficulty: "mid",
    questionType: "technical",
    timeToAnswer: 150
  },
  {
    question: "What is a primary key and what are its characteristics?",
    expectedAnswer: "A primary key is a column or set of columns in a table that uniquely identifies each row/record. Its characteristics include: 1) Uniqueness: Each value must be unique within the table, 2) Non-null: Cannot contain NULL values, 3) Immutability: Values should rarely or never change, 4) Minimality: Should use minimum number of columns necessary for uniqueness (also called irreducible), 5) Stability: Values should be stable and not dependent on potentially changing business values, 6) Indexing: Automatically indexed by the DBMS for performance, 7) Relationship definition: Used to establish relationships with other tables as the foreign key reference.",
    tips: "Compare with candidate keys and super keys. Discuss natural vs. surrogate keys and when each is appropriate.",
    difficulty: "entry",
    questionType: "technical",
    timeToAnswer: 90
  },
  {
    question: "What is a foreign key and how does it establish relationships between tables?",
    expectedAnswer: "A foreign key is a column or set of columns in a table that refers to the primary key in another table. It establishes and enforces referential integrity between tables by creating parent-child relationships. Foreign keys work by: 1) Constraining data in the referencing table so that it must match data in the referenced table or be NULL, 2) Preventing operations that would destroy relationships, like deleting a row in the primary table that has matching rows in the foreign key table, 3) Supporting cascading operations (UPDATE CASCADE, DELETE CASCADE), 4) Defining the multiplicity in a relationship (one-to-one, one-to-many, many-to-many), 5) Maintaining data consistency across related tables. Foreign keys are fundamental to the relational model and enable join operations between tables.",
    tips: "Explain referential integrity in detail and discuss the different ON DELETE and ON UPDATE options (CASCADE, SET NULL, RESTRICT, etc.). Provide a simple example showing two tables and how they are related.",
    difficulty: "entry",
    questionType: "technical",
    timeToAnswer: 120
  },
  {
    question: "What is database denormalization and when would you use it?",
    expectedAnswer: "Database denormalization is the process of adding redundant data to one or more tables to optimize read performance. Unlike normalization which focuses on reducing redundancy, denormalization intentionally adds redundancy for performance benefits. You would use denormalization: 1) When read operations significantly outnumber write operations, 2) For reporting and analytical systems (OLAP) that require complex joins but infrequent updates, 3) When frequently joined tables cause performance bottlenecks, 4) To reduce join complexity by pre-calculating and storing aggregated values, 5) In data warehousing scenarios, 6) For distributed database systems where joins across servers are expensive. However, denormalization comes at the cost of increased storage, more complex update logic, and potential data inconsistencies if not carefully managed.",
    tips: "Contrast with normalization, explaining the trade-offs. Provide specific examples where denormalization offers substantial benefits, like storing a customer's full address in an orders table.",
    difficulty: "mid",
    questionType: "technical",
    timeToAnswer: 150
  },
  {
    question: "Explain the different types of database relationships (one-to-one, one-to-many, many-to-many) with examples.",
    expectedAnswer: "Database relationships define how data in one table relates to data in another table: 1) One-to-One (1:1): Each record in the first table corresponds to exactly one record in the second table. Example: EMPLOYEE and PASSPORT_DETAILS tables, where each employee has exactly one passport record. Typically implemented using primary key-foreign key relationships where the foreign key has a uniqueness constraint. 2) One-to-Many (1:N): A record in the first table can relate to multiple records in the second table, but each record in the second table relates to only one record in the first. Example: DEPARTMENT and EMPLOYEE tables, where one department can have many employees, but each employee belongs to only one department. Implemented using a foreign key in the 'many' side referencing the primary key of the 'one' side. 3) Many-to-Many (M:N): Records in the first table can relate to multiple records in the second table, and vice versa. Example: STUDENT and COURSE tables, where students can enroll in multiple courses and courses can have multiple students. Implemented using a junction/associative table that contains foreign keys to both related tables.",
    tips: "Draw simple ER diagrams to illustrate each relationship type. Explain implementation details, especially for many-to-many relationships which require junction tables.",
    difficulty: "entry",
    questionType: "technical",
    timeToAnswer: 150
  },
  {
    question: "What is referential integrity and why is it important?",
    expectedAnswer: "Referential integrity is a database concept that ensures relationships between tables remain consistent. It mandates that if a foreign key exists in a table, either the foreign key value must match a primary key value in the related table or be NULL (if allowed). Referential integrity is important because: 1) It prevents orphaned records (records referencing non-existent parent records), 2) It maintains data consistency across the entire database, 3) It enforces business rules about how data entities relate to each other, 4) It provides cascading update and delete capabilities to maintain consistency when parent records change, 5) It helps prevent data anomalies and corruption, 6) It's fundamental to the relational model's ability to accurately represent real-world relationships. Referential integrity is typically enforced through foreign key constraints defined in the database schema.",
    tips: "Discuss the implications of referential integrity violations and how they can be prevented. Explain the difference between CASCADE, SET NULL, RESTRICT, and NO ACTION options for referential integrity constraints.",
    difficulty: "entry",
    questionType: "technical",
    timeToAnswer: 120
  },
  {
    question: "What is an index in a database and what are the different types of indexes?",
    expectedAnswer: "An index in a database is a data structure that improves the speed of data retrieval operations by providing faster access to rows in a table, similar to an index in a book. Main types include: 1) Primary Index: Created on the primary key fields, automatically enforced by most DBMS. 2) Unique Index: Ensures all values in the indexed column(s) are unique. 3) Clustered Index: Determines the physical order of data in a table; only one per table. 4) Non-Clustered Index: Contains logical order pointers to the physical data; multiple allowed per table. 5) Composite Index: Created on multiple columns. 6) Bitmap Index: Uses bit arrays for each possible value; efficient for low-cardinality columns. 7) Function-Based Index: Based on expressions or functions of columns rather than the column values themselves. 8) Partial/Filtered Index: Only includes a subset of rows based on a WHERE condition. 9) Covering Index: Includes all columns referenced in a query, avoiding table lookups. 10) Hash Index: Uses a hash function for very fast equality lookups but not range queries.",
    tips: "Explain the trade-offs between index types and when each is most appropriate. Discuss the impact of indexes on INSERT/UPDATE/DELETE operations versus SELECT operations.",
    difficulty: "mid",
    questionType: "technical",
    timeToAnswer: 180
  },
  {
    question: "What is database concurrency control and why is it needed?",
    expectedAnswer: "Database concurrency control is the method used to ensure that multiple transactions can execute simultaneously without conflicting with each other, maintaining data consistency and isolation. It's needed because: 1) Multiple users and applications need to access the database simultaneously in production environments, 2) Without controls, concurrent transactions can interfere with each other, causing issues like lost updates, dirty reads, non-repeatable reads, and phantom reads, 3) It ensures the ACID properties (particularly isolation) are maintained even during concurrent execution, 4) It maximizes system throughput by optimizing the execution schedule of transactions without sacrificing data integrity. Common concurrency control techniques include locking (shared/exclusive), timestamp ordering, multi-version concurrency control (MVCC), and optimistic vs. pessimistic concurrency control approaches.",
    tips: "Explain the specific concurrency issues that can arise (lost updates, dirty reads, etc.) and how different isolation levels address these problems. Compare optimistic vs. pessimistic approaches.",
    difficulty: "senior",
    questionType: "technical",
    timeToAnswer: 180
  },
  {
    question: "Explain the concept of database isolation levels and how they affect concurrency.",
    expectedAnswer: "Database isolation levels determine how transactions are isolated from each other when running concurrently, balancing data consistency with performance. The standard levels from lowest to highest isolation are: 1) READ UNCOMMITTED: Allows dirty reads, non-repeatable reads, and phantom reads. Transactions can see uncommitted changes from other transactions. 2) READ COMMITTED: Prevents dirty reads but allows non-repeatable reads and phantom reads. Transactions only see committed data. 3) REPEATABLE READ: Prevents both dirty reads and non-repeatable reads but allows phantom reads. Ensures that if a transaction reads a row, it will see the same data if it reads that row again. 4) SERIALIZABLE: Prevents all concurrency issues including phantom reads. Transactions execute as if they were serialized one after another. Higher isolation levels provide stronger data consistency guarantees but typically with greater performance costs due to increased locking or versioning overhead. Database systems implement these levels using techniques like locking, timestamping, and multi-version concurrency control (MVCC).",
    tips: "Clearly define the concurrency phenomena (dirty reads, non-repeatable reads, phantom reads) and explain how each isolation level addresses or fails to address them. Discuss the performance implications of each level.",
    difficulty: "senior",
    questionType: "technical",
    timeToAnswer: 180
  },
  {
    question: "What is a deadlock in a database and how can it be prevented?",
    expectedAnswer: "A deadlock in a database occurs when two or more transactions are waiting for each other to release locks, resulting in a standstill where none can proceed. For example, Transaction A holds a lock on Resource 1 and needs Resource 2, while Transaction B holds Resource 2 and needs Resource 1. Prevention strategies include: 1) Deadlock Detection and Resolution: The DBMS periodically checks for deadlocks and resolves them by rolling back one of the transactions (victim). 2) Timeout Mechanism: Transactions are automatically aborted if they wait for locks longer than a specified time. 3) Lock All Resources at Once: Requiring transactions to acquire all needed locks at the beginning. 4) Resource Ordering: Establishing a global order for locking resources so all transactions acquire locks in the same order. 5) Conservative Two-Phase Locking: Preventing transactions from requesting new locks after releasing any lock. 6) Lock Escalation: Reducing the total number of locks by converting many fine-grained locks to fewer coarse-grained locks. 7) Optimistic Concurrency Control: Avoiding locks altogether by detecting conflicts at commit time rather than during execution.",
    tips: "Start with a simple example of how a deadlock forms. Evaluate the trade-offs of different prevention strategies, noting that deadlock prevention often comes at the cost of reduced concurrency.",
    difficulty: "senior",
    questionType: "technical",
    timeToAnswer: 180
  },
  {
    question: "What is the difference between a database trigger and a stored procedure?",
    expectedAnswer: "Database triggers and stored procedures are both database objects containing SQL code, but they differ significantly: 1) Execution: Triggers execute automatically in response to specific events (INSERT, UPDATE, DELETE) on a table, while stored procedures are explicitly called by applications, users, or other procedures. 2) Parameters: Stored procedures can accept input parameters and return multiple output parameters or result sets. Triggers don't accept parameters but can access special tables (INSERTED, DELETED) with affected row data. 3) Transaction Control: Stored procedures can contain transaction control statements (COMMIT, ROLLBACK), while triggers execute within the transaction that triggered them and can't commit or rollback independently. 4) Invocation: Multiple triggers of the same type can fire on a single table, potentially in non-deterministic order, while stored procedures execute exactly when and how they're called. 5) Purpose: Triggers primarily enforce business rules and data integrity automatically, while stored procedures encapsulate complex operations and business logic for reuse. 6) Return Values: Stored procedures can return values and result sets, whereas triggers cannot return data to the calling application.",
    tips: "Provide examples of when to use each. For triggers, describe BEFORE/AFTER and ROW/STATEMENT level triggers if applicable to the DBMS the candidate should know.",
    difficulty: "mid",
    questionType: "technical",
    timeToAnswer: 150
  },
  {
    question: "Explain the CAP theorem and its significance in distributed database systems.",
    expectedAnswer: "The CAP theorem (formulated by Eric Brewer) states that a distributed database system can simultaneously guarantee at most two out of three properties: 1) Consistency: All nodes see the same data at the same time; every read receives the most recent write. 2) Availability: Every request receives a response, without guarantee that it contains the most recent data. 3) Partition Tolerance: The system continues to operate despite network partitions or communication breakdowns between nodes. The significance of the CAP theorem is that it forces architectural trade-offs in distributed systems: CA systems (consistency and availability) sacrifice partition tolerance, which is impractical for most distributed systems. CP systems (consistency and partition tolerance) may become unavailable during network partitions to maintain consistency. AP systems (availability and partition tolerance) may return stale data during partitions to remain available. Most modern distributed databases are designed as either CP (like Google Spanner, HBase) or AP (like Amazon Dynamo, Cassandra) systems, with various consistency models (strong, eventual, causal consistency) depending on their priorities.",
    tips: "Discuss real-world database examples for each combination (CP, AP) and how the theorem influences architectural decisions. Mention that in normal operation all three properties can be satisfied, but the theorem addresses behavior during network failures.",
    difficulty: "senior",
    questionType: "technical",
    timeToAnswer: 180
  },
  {
    question: "What is database sharding and what are its benefits and challenges?",
    expectedAnswer: "Database sharding is a horizontal partitioning technique where a large database is divided into smaller, faster, more manageable pieces called shards, distributed across multiple servers. Each shard contains a subset of the data based on a shard key. Benefits include: 1) Improved scalability by distributing data and queries across multiple servers, 2) Better performance through reduced index sizes and smaller data volumes per server, 3) Increased availability as a failure affects only a portion of the data, 4) Geographical distribution of data closer to users. Challenges include: 1) Complexity in application design to route queries to appropriate shards, 2) Difficulty in performing joins across shards, 3) Uneven data distribution (hotspots) if the shard key is poorly chosen, 4) Complex management of distributed transactions and maintaining data consistency, 5) Increased operational complexity for backups, schema changes, and monitoring, 6) Data rebalancing challenges when adding or removing shards.",
    tips: "Discuss different sharding strategies (hash-based, range-based, directory-based) and their trade-offs. Compare with other scaling approaches like replication and federation.",
    difficulty: "senior",
    questionType: "technical",
    timeToAnswer: 180
  },
  {
    question: "What is database replication and what are the different replication models?",
    expectedAnswer: "Database replication is the process of creating and maintaining duplicate copies of a database across multiple database servers. The main replication models include: 1) Master-Slave (Primary-Replica): All write operations go to the master server, which then propagates changes to one or more slave servers. Slaves typically serve read operations, improving read scalability. 2) Master-Master (Multi-Primary): Multiple database servers can accept write operations. Changes made to one master are propagated to all other masters, providing high availability for writes. 3) Synchronous Replication: The primary server waits for acknowledgment from replica servers before confirming a transaction, ensuring consistency but potentially impacting performance. 4) Asynchronous Replication: The primary server confirms transactions without waiting for replicas to apply changes, improving performance but risking data loss during failures. 5) Semi-synchronous Replication: A compromise where at least one replica must acknowledge the transaction. 6) Cascading Replication: Replicas themselves replicate to other servers, reducing load on the primary. 7) Multi-Source Replication: A replica receives updates from multiple source databases simultaneously.",
    tips: "Discuss the trade-offs between consistency, availability, and performance for each model. Mention real-world database systems that use each replication strategy and typical use cases.",
    difficulty: "senior",
    questionType: "technical",
    timeToAnswer: 180
  },
  {
    question: "What is a NoSQL database? Compare and contrast NoSQL with traditional RDBMS.",
    expectedAnswer: "NoSQL (Not Only SQL) databases are non-relational database systems designed for distributed data stores with large-scale data storage needs, offering flexible schemas unlike traditional RDBMS. Key comparisons include: 1) Data Model: RDBMS uses structured, tabular data with predefined schemas, while NoSQL uses various models (document, key-value, column-family, graph) with flexible schemas. 2) Scalability: RDBMS typically scales vertically (more powerful hardware), while NoSQL databases are designed for horizontal scaling across multiple servers. 3) ACID Compliance: RDBMS prioritizes ACID properties, whereas NoSQL often relaxes some properties in favor of the BASE model (Basically Available, Soft state, Eventually consistent). 4) Query Language: RDBMS uses structured SQL, while NoSQL databases often have proprietary query APIs or simplified query languages. 5) Schema Flexibility: RDBMS requires predefined schemas where changes are difficult, while NoSQL offers schema-on-read flexibility allowing easy evolution. 6) Relationships: RDBMS handles complex relationships through joins, whereas NoSQL often denormalizes data or uses specialized models like graphs. 7) Use Cases: RDBMS excels in complex transactions and consistent data requirements (banking, ERP), while NoSQL is suited for big data, real-time applications, and rapidly evolving data models.",
    tips: "Discuss specific types of NoSQL databases and their specialized use cases. Explain when to choose one over the other based on specific project requirements like data structure, consistency needs, and scaling requirements.",
    difficulty: "mid",
    questionType: "technical",
    timeToAnswer: 180
  }
];

const addQuestionsToInterview = async (interview, questions) => {
  try {
    // Get the DBMS subject
    const dbmsSubject = await Subject.findOne({ type: 'DBMS' });
    if (!dbmsSubject) {
      throw new Error('DBMS subject not found');
    }
    
    // Add subject reference to each question
    const questionsWithSubject = questions.map(q => ({
      ...q,
      subject: dbmsSubject._id
    }));
    
    // Add questions to the interview
    interview.questions.push(...questionsWithSubject);
    await interview.save();
    
    console.log(`Added ${questions.length} questions to the DBMS interview`);
    return interview;
  } catch (error) {
    console.error('Error adding questions to interview:', error);
    process.exit(1);
  }
};

// Main execution
const main = async () => {
  try {
    // Find or create DBMS interview
    const interview = await findOrCreateDBMSInterview();
    
    // Add questions to the interview
    await addQuestionsToInterview(interview, dbmsQuestions);
    
    console.log('Successfully added DBMS interview questions - Set 1');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error in main execution:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

// Run the main function
main(); 