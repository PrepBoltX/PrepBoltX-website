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

// Find the existing DBMS interview
const findDBMSInterview = async () => {
  try {
    // Find the DBMS subject first
    const dbmsSubject = await Subject.findOne({ type: 'DBMS' });
    if (!dbmsSubject) {
      console.error('DBMS subject not found');
      process.exit(1);
    }

    // Look for an existing DBMS interview
    const interview = await Interview.findOne({ 
      jobRole: 'Database Developer',
      subjects: dbmsSubject._id
    });

    // Check if interview exists
    if (!interview) {
      console.error('DBMS interview not found. Please run createDBMSQuestions1.js first.');
      process.exit(1);
    } else {
      console.log('Found existing DBMS interview. Adding more questions to it...');
    }
    
    return interview;
  } catch (error) {
    console.error('Error finding DBMS interview:', error);
    process.exit(1);
  }
};

// Questions to add - Set 2: SQL and Advanced Database Concepts
const dbmsQuestions = [
  {
    question: "Explain the difference between SQL DDL, DML, DCL, and TCL commands with examples.",
    expectedAnswer: "SQL commands are categorized into four main types: 1) DDL (Data Definition Language): Used to define and modify database structure. Examples: CREATE (creates tables, views, indexes), ALTER (modifies existing database objects), DROP (deletes objects), TRUNCATE (removes all records from a table, but not the table itself), COMMENT, RENAME. 2) DML (Data Manipulation Language): Used to manipulate data stored in the database. Examples: SELECT (retrieves data), INSERT (adds new records), UPDATE (modifies existing records), DELETE (removes records), MERGE, CALL, EXPLAIN PLAN, LOCK TABLE. 3) DCL (Data Control Language): Used to control access to data in the database. Examples: GRANT (gives user's access privileges to database), REVOKE (withdraws user's access privileges). 4) TCL (Transaction Control Language): Used to manage transactions in the database. Examples: COMMIT (saves work done), ROLLBACK (restores database to original state since the last COMMIT), SAVEPOINT (sets a savepoint within a transaction), SET TRANSACTION (specifies transaction characteristics).",
    tips: "Provide specific examples of each command type in actual SQL syntax. Point out that different database vendors may categorize certain commands differently.",
    difficulty: "entry",
    questionType: "technical",
    timeToAnswer: 150
  },
  {
    question: "What is SQL injection and how can it be prevented?",
    expectedAnswer: "SQL injection is a code injection technique where malicious SQL code is inserted into entry fields in an application, which is then executed by the database. This can result in unauthorized data access, modification, or deletion. Prevention techniques include: 1) Parameterized Queries/Prepared Statements: Using placeholders for user input that separate SQL code from data. 2) Stored Procedures: Encapsulating SQL logic on the database server with parameters for user input. 3) Input Validation: Checking user input against whitelists or expected patterns. 4) Escaping Special Characters: Properly escaping quotes and other special characters in user input. 5) ORM (Object-Relational Mapping) Libraries: These typically implement parameterized queries automatically. 6) Principle of Least Privilege: Restricting database account permissions to minimize damage from successful attacks. 7) Web Application Firewalls: Filtering out malicious SQL patterns before they reach the application. 8) Regular Security Testing: Including SQL injection vulnerability scanning in security assessments.",
    tips: "Show examples of vulnerable code vs. secure code. Emphasize that parameterized queries are generally considered the most effective defense.",
    difficulty: "mid",
    questionType: "technical",
    timeToAnswer: 150
  },
  {
    question: "What are the different normal forms in database normalization?",
    expectedAnswer: "Database normalization involves organizing data to reduce redundancy. The main normal forms are: 1) First Normal Form (1NF): Eliminates repeating groups by ensuring atomic values (each cell contains a single value) and each record is unique (often via primary key). 2) Second Normal Form (2NF): Meets 1NF requirements and all non-key attributes are fully functionally dependent on the primary key (no partial dependencies). 3) Third Normal Form (3NF): Meets 2NF requirements and has no transitive dependencies (non-key attributes don't depend on other non-key attributes). 4) Boyce-Codd Normal Form (BCNF): A stronger version of 3NF that addresses anomalies not handled by 3NF when multiple candidate keys exist. Every determinant must be a candidate key. 5) Fourth Normal Form (4NF): Addresses multi-valued dependencies by ensuring no multi-valued dependencies exist except for candidate keys. 6) Fifth Normal Form (5NF): Also called Project-Join Normal Form, deals with join dependencies that can't be implied from candidate keys. 7) Domain-Key Normal Form (DKNF): A theoretical form where every constraint is a logical consequence of domain and key constraints.",
    tips: "Explain functional dependencies as the theoretical foundation. Use simple examples to illustrate how tables evolve through the normalization process.",
    difficulty: "mid",
    questionType: "technical",
    timeToAnswer: 180
  },
  {
    question: "Describe the difference between clustered and non-clustered indexes.",
    expectedAnswer: "Clustered and non-clustered indexes differ significantly in structure and performance characteristics: 1) Clustered Index: Determines the physical order of data storage in a table (like a dictionary where pages are in alphabetical order). Only one clustered index can exist per table. The leaf level of the clustered index contains actual data rows, not just pointers. It typically provides faster access for range queries. Primary keys by default create clustered indexes in many DBMS. When no clustered index exists, data is stored in a heap structure. 2) Non-Clustered Index: Creates a separate structure that contains the indexed column values and pointers to the actual data rows (like a book's index with page numbers). Multiple non-clustered indexes can exist per table. The leaf level contains index key values and row locators to the actual data, which requires an additional lookup. Somewhat slower than clustered indexes for data retrieval but faster for covering queries that only need indexed columns. Best for columns frequently used in WHERE clauses but not in range queries.",
    tips: "Discuss the performance implications of each index type for different query patterns. Explain situations where you would choose one over the other.",
    difficulty: "mid",
    questionType: "technical",
    timeToAnswer: 150
  },
  {
    question: "What is database partitioning and what are the different types of partitioning?",
    expectedAnswer: "Database partitioning is the division of large tables and indexes into smaller, more manageable pieces called partitions, while maintaining a single logical view of the data. Main types include: 1) Horizontal Partitioning (Sharding): Splits rows across multiple partitions based on partition keys. Each partition contains a subset of rows with the same table structure. E.g., customers partitioned by region or transactions by date range. 2) Vertical Partitioning: Splits columns across partitions. Frequently accessed columns might be in one partition while less-used columns are in another. Often implemented by moving groups of columns to separate tables with shared primary keys. 3) Range Partitioning: Based on ranges of a partition key (e.g., dates, IDs, alphabetical ranges). 4) List Partitioning: Based on discrete values or lists of values (e.g., countries, categories). 5) Hash Partitioning: Uses a hash function on the partition key to distribute rows evenly. 6) Composite Partitioning: Combines multiple partitioning methods, such as first partitioning by range and then by hash. 7) Round-Robin Partitioning: Distributes rows in a round-robin fashion without considering row values.",
    tips: "Discuss the benefits of partitioning (improved query performance, manageability, increased availability) and challenges (partition pruning, joins across partitions, maintenance overhead).",
    difficulty: "mid",
    questionType: "technical",
    timeToAnswer: 180
  },
  {
    question: "What is a database view and what are its advantages?",
    expectedAnswer: "A database view is a virtual or logical table defined by a stored query. Unlike physical tables, views don't store data themselves but dynamically present data from the underlying tables when accessed. Advantages include: 1) Security: Views can restrict access to sensitive columns or rows, showing only authorized data to specific users. 2) Simplicity: Views can simplify complex queries by hiding the complexity of joins, subqueries, or aggregations behind a simple SELECT. 3) Consistency: Views ensure consistent access to data across applications using standardized queries. 4) Data Abstraction: Views provide abstraction over the physical schema, shielding applications from changes to underlying table structures. 5) Data Aggregation: Views can pre-compute and present aggregated data. 6) Backward Compatibility: When database schemas change, views can maintain the old structure for legacy applications. 7) Reduced Network Traffic: In distributed systems, views can localize data access. 8) Customized Data Presentation: Views can format or combine data in ways specific to different user needs.",
    tips: "Distinguish between non-materialized (regular) and materialized views, explaining when each is appropriate. Discuss the limitations of views, such as potential performance overhead for complex views.",
    difficulty: "entry",
    questionType: "technical",
    timeToAnswer: 120
  },
  {
    question: "Explain the concept of database locks and the different types of locks.",
    expectedAnswer: "Database locks are mechanisms that prevent multiple users or processes from accessing or modifying the same data simultaneously, ensuring data consistency. Main types of locks include: 1) Shared (S) Locks: Allow multiple transactions to read data concurrently but prevent any transaction from modifying that data. Multiple shared locks can exist simultaneously on the same resource. 2) Exclusive (X) Locks: Grant exclusive access for modifying data, preventing other transactions from reading or modifying it. Only one exclusive lock can exist on a resource at a time. 3) Update (U) Locks: Used when a transaction reads data with the intention of updating later. Can coexist with shared locks but not with other update or exclusive locks. 4) Intent Locks: Signal an intention to acquire locks at a finer granularity level (e.g., intent shared, intent exclusive). 5) Schema Locks: Control changes to table structures rather than data. 6) Row-Level Locks: Lock individual rows within a table. 7) Page-Level Locks: Lock database pages containing multiple rows. 8) Table-Level Locks: Lock entire tables. 9) Database-Level Locks: Lock the entire database. Different isolation levels use locks differently to balance concurrency and consistency.",
    tips: "Discuss the trade-offs between lock granularity and overhead. Explain lock escalation (converting many fine-grained locks to fewer coarse-grained locks) and its performance implications.",
    difficulty: "mid",
    questionType: "technical",
    timeToAnswer: 180
  },
  {
    question: "What are materialized views and how do they differ from regular views?",
    expectedAnswer: "Materialized views store query results physically, unlike regular views which compute results dynamically. Key differences include: 1) Storage: Regular views don't store data but execute their defining query each time they're accessed. Materialized views physically store the query results, consuming disk space but providing faster access. 2) Performance: Regular views have no performance advantage over direct table queries. Materialized views offer significantly faster query performance, especially for complex joins or aggregations. 3) Data Freshness: Regular views always show current data from base tables. Materialized views contain data from when they were last refreshed, potentially becoming stale. 4) Refresh Mechanism: Regular views need no refreshing. Materialized views require refresh operations, either on-demand, scheduled, or triggered by events. Refresh strategies include complete refresh or incremental refresh. 5) Indexing: Regular views generally can't be indexed directly. Materialized views can have their own indexes, further improving query performance. 6) Use Cases: Regular views are best for simple queries or when absolute data freshness is critical. Materialized views excel in data warehousing, reporting systems, and scenarios with complex queries but less frequent data changes.",
    tips: "Discuss refresh strategies and when materialized views are most beneficial. Mention specific DBMS implementations and their unique features (Oracle, PostgreSQL, SQL Server, etc.).",
    difficulty: "mid",
    questionType: "technical",
    timeToAnswer: 150
  },
  {
    question: "What is the difference between a stored procedure and a user-defined function?",
    expectedAnswer: "Stored procedures and user-defined functions are both database objects containing SQL code, but they differ in several key ways: 1) Return Values: Functions must return a value using the RETURN statement, while procedures can return multiple values through output parameters or return nothing. 2) Usage in Queries: Functions can be called within SQL statements (SELECT, WHERE, etc.), whereas procedures must be executed as standalone CALL or EXECUTE statements. 3) DML Operations: Procedures can contain transactions and perform INSERT, UPDATE, DELETE operations. Functions are generally more restricted, with some DBMS allowing only SELECT statements in functions. 4) Parameters: Procedures support IN, OUT, and INOUT parameters, allowing data to be passed back to the caller. Functions typically support only input parameters. 5) Exception Handling: Procedures often have more robust error handling capabilities. 6) Performance: Functions are typically optimized for computational tasks and returning values, while procedures are better for performing actions on data. 7) Transaction Control: Procedures can contain transaction control statements (COMMIT, ROLLBACK), while many database systems restrict functions from affecting transaction state.",
    tips: "Provide examples of when each should be used. Mention that specific implementation details vary across different database management systems.",
    difficulty: "mid",
    questionType: "technical",
    timeToAnswer: 150
  },
  {
    question: "What are database constraints and what types are commonly used?",
    expectedAnswer: "Database constraints are rules enforced on data columns in tables to maintain data integrity. Common types include: 1) PRIMARY KEY: Ensures each row in a table is uniquely identified, combining UNIQUE and NOT NULL constraints. 2) FOREIGN KEY: Maintains referential integrity by ensuring values in one table match values in another table. 3) UNIQUE: Ensures all values in a column or set of columns are different. 4) NOT NULL: Ensures a column cannot have NULL values. 5) CHECK: Ensures values in a column meet a specific condition (e.g., price > 0). 6) DEFAULT: Provides a default value for a column when no value is specified. 7) DOMAIN: Defines valid values for a column (in some DBMS). 8) ASSERTION: Specifies a condition that must always be true for all rows (less commonly implemented). Constraints are defined during table creation or added later via ALTER TABLE statements. They prevent invalid data operations and help maintain data consistency by rejecting operations that would violate defined rules.",
    tips: "Provide SQL examples for defining each constraint type. Discuss the performance implications of enforcing constraints and when deferrable constraints might be useful.",
    difficulty: "entry",
    questionType: "technical",
    timeToAnswer: 120
  },
  {
    question: "What is database mirroring and how does it differ from replication?",
    expectedAnswer: "Database mirroring and replication are both high availability solutions but work differently: Database Mirroring: Creates a nearly real-time copy (mirror) of a database on a separate instance. Operates at the database level with typically one mirror per database. Provides automatic failover capabilities with a witness server in high-safety mode. Maintains transactional consistency between principal and mirror databases. Uses synchronous or asynchronous transfer of transaction logs. Primarily focused on disaster recovery and high availability. Places a higher performance overhead on the primary system in synchronous mode. Replication: Distributes data across multiple servers with more flexibility in topology (one-to-many, many-to-one, peer-to-peer). Operates at the server, database, table, or even row level. Uses publishers, distributors, and subscribers in its architecture. Various types include snapshot, transactional, merge, and peer-to-peer. Designed for distributing data for reporting, scale-out reads, and geographic distribution. Often asynchronous with potential for some data latency. Can replicate only specific tables or even subsets of data. Allows for more flexible configurations and can handle more complex scenarios.",
    tips: "Discuss specific use cases where each technology is most appropriate. Mention that database mirroring is deprecated in some systems (like SQL Server) in favor of AlwaysOn Availability Groups.",
    difficulty: "senior",
    questionType: "technical",
    timeToAnswer: 180
  },
  {
    question: "Explain optimistic vs. pessimistic locking in databases.",
    expectedAnswer: "Optimistic and pessimistic locking are concurrency control methods that handle multiple users accessing data simultaneously: Optimistic Locking: Assumes conflicts are rare and doesn't lock data during reads. Records a version/timestamp when reading data (often using a version column). When updating, compares current version with version at read time. If versions differ, another user has modified the data, causing a conflict. Conflicts are resolved by rejecting the update, requiring the user to retry with fresh data. Benefits include higher concurrency and no deadlocks, but requires conflict resolution logic. Ideal for read-heavy systems with infrequent updates to the same record. Pessimistic Locking: Assumes conflicts are likely and locks data when accessed. Applies locks when a user reads data intended for update (SELECT FOR UPDATE). Prevents other users from modifying (or sometimes reading) locked data until the transaction completes. Ensures data consistency but reduces concurrency and can cause deadlocks. Typically implemented via shared locks (for reading) and exclusive locks (for writing). Better suited for write-heavy systems or when conflicts would be expensive to resolve.",
    tips: "Discuss real-world scenarios where each approach excels. Explain implementation strategies like version columns for optimistic locking and the various lock modes in pessimistic locking.",
    difficulty: "mid",
    questionType: "technical",
    timeToAnswer: 150
  },
  {
    question: "What are database cursors and when would you use them?",
    expectedAnswer: "Database cursors are database objects that allow row-by-row traversal and processing of result sets. They work by pointing to one row at a time in a result set, enabling operations on individual rows rather than the entire result set at once. Types include: 1) Static Cursors: Create a temporary copy of data that doesn't reflect subsequent changes to the actual data. 2) Dynamic Cursors: Reflect all changes to the underlying data, including changes made by other users. 3) Keyset Cursors: Maintain a key for each row, detecting changes to data values but not showing newly added rows. 4) Forward-Only Cursors: Can only move forward through the result set, typically with better performance. Use cases include: 1) When row-by-row processing is required rather than set-based operations. 2) For complex operations that cannot be performed with a single SQL statement. 3) When integrating with applications that need to process records individually. 4) For breaking down large result sets to manage memory usage. 5) To perform specific operations based on the values in each row.",
    tips: "Emphasize that cursors should be used sparingly in SQL as set-based operations are usually more efficient. Discuss performance implications and memory consumption of different cursor types.",
    difficulty: "mid",
    questionType: "technical",
    timeToAnswer: 150
  },
  {
    question: "Compare and contrast OLTP and OLAP systems.",
    expectedAnswer: "OLTP (Online Transaction Processing) and OLAP (Online Analytical Processing) are fundamentally different database system designs: 1) Purpose: OLTP handles day-to-day transaction processing (orders, payments, reservations). OLAP supports complex analysis and decision-making through data mining and aggregations. 2) Data Model: OLTP uses normalized schemas to minimize redundancy and ensure data integrity. OLAP uses dimensional models (star/snowflake schemas) optimized for complex queries and aggregations. 3) Workload: OLTP handles numerous small, simple transactions (inserts, updates, deletes). OLAP processes fewer but complex, resource-intensive queries involving aggregations and joins. 4) Optimization: OLTP is optimized for fast insertion and updating with minimal impact on concurrent users. OLAP is optimized for complex queries with pre-aggregated data, indexes, and materialized views. 5) Data Recency: OLTP contains current operational data. OLAP typically contains historical data loaded from OLTP systems periodically. 6) Database Size: OLTP databases are typically smaller (gigabytes to terabytes). OLAP systems often manage much larger data volumes (terabytes to petabytes). 7) Concurrency: OLTP supports many concurrent users making small changes. OLAP handles fewer users running complex queries.",
    tips: "Provide examples of OLTP systems (e-commerce, banking transactions) and OLAP systems (business intelligence, executive dashboards). Discuss how data typically flows from OLTP to OLAP systems through ETL processes.",
    difficulty: "mid",
    questionType: "technical",
    timeToAnswer: 180
  },
  {
    question: "What is database connection pooling and why is it important?",
    expectedAnswer: "Database connection pooling is a technique that maintains a cache of database connections for reuse, rather than establishing a new connection each time one is requested. The process works by: 1) Pre-creating a set of connections during application startup. 2) Managing these connections in a 'pool'. 3) When a connection is needed, providing an available one from the pool instead of creating a new one. 4) Returning connections to the pool when they're no longer needed rather than closing them. 5) Monitoring connections for issues and sometimes testing them before reuse. Connection pooling is important because: 1) It dramatically improves performance by eliminating the overhead of establishing new database connections, which involves TCP handshakes, authentication, and resource allocation. 2) It enhances scalability by limiting the maximum number of connections to the database, preventing resource exhaustion. 3) It improves application responsiveness since getting a connection from a pool is much faster than creating one. 4) It enables efficient resource management by controlling the number of connections. 5) It provides additional features like connection validation, timeout settings, and statement caching.",
    tips: "Discuss common connection pooling implementations (HikariCP, DBCP, c3p0) and configuration parameters like minimum/maximum pool size, timeout settings, and validation queries.",
    difficulty: "mid",
    questionType: "technical",
    timeToAnswer: 150
  },
  {
    question: "What is the purpose of the HAVING clause in SQL and how does it differ from WHERE?",
    expectedAnswer: "The HAVING clause in SQL filters groups of rows created by the GROUP BY clause, while the WHERE clause filters individual rows before grouping occurs. Key differences include: 1) Timing of Application: WHERE filters rows before aggregation and grouping. HAVING filters after GROUP BY aggregates have been computed. 2) Aggregation Functions: HAVING can include aggregate functions like SUM(), COUNT(), AVG() in its conditions. WHERE cannot use aggregate functions directly. 3) Performance Impact: WHERE is more efficient as it eliminates rows early in the query processing, reducing the data volume for subsequent steps. HAVING operates on already grouped data, so more initial processing occurs. 4) Required Clauses: HAVING is almost always used with GROUP BY (with rare exceptions). WHERE can be used independently. 5) Purpose: WHERE answers 'Which individual rows should be included?'. HAVING answers 'Which groups should be included?'. A typical SQL query flow would be: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY, showing how these clauses work together in sequence.",
    tips: "Provide a clear example that shows both clauses in action, such as finding departments with more than 5 employees who earn over $50,000. The WHERE would filter employee salaries first, then GROUP BY department, then HAVING would filter groups by count.",
    difficulty: "entry",
    questionType: "technical",
    timeToAnswer: 120
  },
  {
    question: "What is a composite key and when would you use one?",
    expectedAnswer: "A composite key (or compound key) is a primary key composed of multiple columns used together to uniquely identify records in a table. You would use a composite key when: 1) No single column has unique values, but a combination of columns ensures uniqueness. For example, in an enrollment table, neither student_id nor course_id is unique alone, but the combination is unique. 2) You need to enforce entity integrity across multiple columns. 3) The table represents a many-to-many relationship, where the composite key typically consists of foreign keys from the related tables. 4) You want to prevent specific combinations of values from being duplicated while allowing individual column values to repeat. 5) You need to create a natural key from business data rather than using a surrogate key. 6) The table is a fact table in a dimensional model, where the primary key is typically composed of foreign keys to dimension tables. 7) You want to create a covering index for common queries that involve all composite key columns.",
    tips: "Discuss the trade-offs between composite keys and surrogate keys (single auto-generated columns). Mention potential drawbacks like increased index size and complexity in foreign key relationships.",
    difficulty: "entry",
    questionType: "technical",
    timeToAnswer: 120
  },
  {
    question: "Explain query optimization in databases and common optimization techniques.",
    expectedAnswer: "Query optimization is the process of selecting the most efficient execution plan for retrieving or modifying data. The database query optimizer analyzes possible execution strategies and chooses the one with the lowest estimated cost based on statistics and cost models. Common optimization techniques include: 1) Indexing: Creating appropriate indexes on columns used in WHERE clauses, JOIN conditions, and ORDER BY statements. 2) Query Rewriting: Restructuring queries to equivalent but more efficient forms. 3) Join Optimization: Choosing optimal join algorithms (nested loops, hash, merge) and join order based on table sizes and column selectivity. 4) Statistics Analysis: Maintaining up-to-date statistics on data distribution to help the optimizer make accurate cost estimates. 5) Materialized Views: Pre-computing and storing results of expensive queries. 6) Partitioning: Dividing large tables into smaller, more manageable pieces for parallel processing. 7) Caching: Storing frequently accessed data or query results in memory. 8) Execution Plan Hints: Providing explicit instructions to the optimizer when automatic optimization fails. 9) Covering Indexes: Creating indexes that include all columns needed by a query to avoid table lookups. 10) Avoiding Functions on Indexed Columns: Ensuring predicates allow index usage by not applying functions to indexed columns in WHERE clauses.",
    tips: "Explain how to read and interpret execution plans. Discuss the difference between cost-based and rule-based optimization, and how query optimization varies across different DBMS products.",
    difficulty: "senior",
    questionType: "technical",
    timeToAnswer: 180
  },
  {
    question: "What are database transactions and why are they important?",
    expectedAnswer: "A database transaction is a logical unit of work that contains one or more SQL statements, treated as a single, indivisible operation. Transactions ensure that database operations maintain data integrity despite errors, system failures, or concurrent access. Transactions follow the ACID properties: 1) Atomicity: All operations within a transaction succeed or fail together. If any operation fails, the entire transaction is rolled back, leaving the database unchanged. 2) Consistency: A transaction brings the database from one valid state to another, maintaining all predefined rules, constraints, and cascades. 3) Isolation: Concurrent transactions execute as if they were running sequentially, preventing one transaction from seeing intermediate, uncommitted data from another. 4) Durability: Once a transaction is committed, its changes remain permanent even if the system fails immediately afterward. Transactions are important because they: 1) Maintain data integrity during complex operations, 2) Allow recovery from errors without partial updates, 3) Enable concurrent access to the database without interference, 4) Provide a clear boundary for related operations that should succeed or fail together, 5) Support business processes that require several related data changes to be treated as a single unit.",
    tips: "Provide a real-world example like a bank transfer that moves money between accounts—both the withdrawal and deposit must succeed or fail together. Discuss transaction isolation levels and their trade-offs.",
    difficulty: "entry",
    questionType: "technical",
    timeToAnswer: 150
  },
  {
    question: "What are temporary tables in SQL and when would you use them?",
    expectedAnswer: "Temporary tables in SQL are database objects that exist temporarily during a database session. They store intermediate results and are automatically dropped when the session ends or when explicitly dropped. Characteristics include: 1) Scope: Local temporary tables are visible only to the session that created them. Global temporary tables (in some DBMS) are visible to all sessions but contain session-specific data. 2) Naming: Usually prefixed with # (local) or ## (global) in SQL Server, or created with CREATE TEMPORARY TABLE in many other systems. 3) Storage: Typically stored in the database system's temp space rather than with permanent tables. Use cases include: 1) Breaking down complex queries into simpler steps for better readability and maintenance. 2) Storing intermediate results to avoid recalculating them in multi-step processes. 3) Improving performance by pre-aggregating or transforming data once and reusing it. 4) Working with subsets of data to reduce processing overhead. 5) Creating temporary data structures that don't warrant permanent tables. 6) Avoiding excessive subqueries or complex joins in a single statement. 7) Facilitating operations like simulating EXCEPT or INTERSECT operations in DBMS that don't support them natively.",
    tips: "Compare temporary tables to table variables and common table expressions (CTEs), discussing when each approach is most appropriate. Mention performance implications, such as statistics generation and indexing capabilities.",
    difficulty: "entry",
    questionType: "technical",
    timeToAnswer: 120
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
    // Find DBMS interview
    const interview = await findDBMSInterview();
    
    // Add questions to the interview
    await addQuestionsToInterview(interview, dbmsQuestions);
    
    console.log('Successfully added DBMS interview questions - Set 2');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error in main execution:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

// Run the main function
main(); 