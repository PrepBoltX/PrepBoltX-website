const mongoose = require('mongoose');
const Subject = require('../models/Subject');
const Topic = require('../models/Topic');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const topics = [
  {
    title: 'SQL Query Optimization',
    content: `# SQL Query Optimization

## Introduction
SQL query optimization is the process of improving the performance and efficiency of SQL queries. As databases grow in size and complexity, optimizing queries becomes essential for maintaining application performance and user experience.

## Why Query Optimization Matters
- Reduces execution time
- Decreases server load and resource consumption
- Improves application responsiveness
- Accommodates more concurrent users
- Reduces hardware costs

## Query Optimization Techniques

### 1. Use Proper Indexing
Indexes are one of the most powerful tools for query optimization:

- **Create indexes on columns used in WHERE clauses**
- **Use composite indexes** for queries with multiple conditions
- **Consider covering indexes** that include all columns needed by a query
- **Avoid over-indexing** as it slows down INSERT/UPDATE/DELETE operations
- **Regularly analyze index usage** and remove unused indexes

### 2. Write Efficient Queries
- **Select only needed columns** instead of using SELECT *
- **Avoid functions in WHERE clauses** that prevent index usage
- **Use JOIN instead of subqueries** when possible
- **Limit the result set size** with LIMIT or TOP
- **Use EXISTS instead of IN** for checking existence
- **Avoid DISTINCT when not necessary**

### 3. Optimize JOIN Operations
- **Join order matters** - start with the table returning the fewest rows
- **Use proper JOIN types** (INNER, LEFT, RIGHT) based on requirements
- **Ensure JOIN conditions use indexed columns**
- **Consider denormalization** for frequently joined tables

### 4. Use Query Hints Judiciously
Many database systems allow query hints to influence the query execution plan:
- **Index hints** to force using specific indexes
- **Join hints** to specify join methods
- **Optimizer hints** to control optimization strategies
- Use sparingly as they can prevent natural optimization as data changes

### 5. Analyze and Rewrite Complex Queries
- **Use EXPLAIN/EXPLAIN PLAN** to understand query execution
- **Break complex queries** into simpler ones when appropriate
- **Consider temporary tables** for complex intermediate results
- **Use Common Table Expressions (CTEs)** for better readability

### 6. Database Design Considerations
- **Normalize data** to reduce redundancy
- **Consider strategic denormalization** for performance
- **Use appropriate data types** to minimize storage and improve comparison speed
- **Partition large tables** by date or other criteria

### 7. Regular Maintenance
- **Update statistics** regularly
- **Rebuild fragmented indexes**
- **Archive old data** to keep active tables smaller

## Common Query Anti-patterns

### 1. N+1 Query Problem
Making N additional queries after an initial query, often seen in ORM frameworks.

**Solution:** Use eager loading or JOIN operations.

### 2. Cartesian Products
Joining tables without specifying join conditions.

**Solution:** Always specify join conditions.

### 3. Implicit Conversions
When data types don't match in comparisons, causing index scans instead of seeks.

**Solution:** Use consistent data types.

### 4. SELECT *
Retrieving all columns when only a few are needed.

**Solution:** Specify only required columns.

## Database-Specific Optimization Tools

### MySQL
- EXPLAIN statement
- Query Profiler
- Performance Schema

### PostgreSQL
- EXPLAIN ANALYZE
- pg_stat_statements
- auto_explain

### SQL Server
- Execution Plans
- Database Engine Tuning Advisor
- Dynamic Management Views

### Oracle
- EXPLAIN PLAN
- SQL Trace
- Automatic Workload Repository

## Conclusion
Query optimization is both an art and a science. It requires understanding database internals, query execution plans, and application requirements. Regular monitoring, testing, and refining of queries leads to significant performance improvements.`,
    order: 4,
    contentType: 'markdown',
    estimatedReadTime: 10,
    tags: ['SQL', 'Query Optimization', 'Performance Tuning']
  },
  {
    title: 'Indexing Strategies in DBMS',
    content: `# Indexing Strategies in DBMS

## Introduction
Indexes are data structures that improve the speed of data retrieval operations by providing faster access to database records. They work similar to the index in a book, allowing the database engine to find data without scanning the entire table.

## Types of Indexes

### 1. B-Tree Indexes
The most common type of index used in relational databases.

**Characteristics:**
- Balanced tree structure
- Efficient for equality and range queries
- Good for high-cardinality columns
- Default index type in most RDBMS

**Best for:**
- Primary keys
- Foreign keys
- Columns used in WHERE, JOIN, and ORDER BY clauses

### 2. Hash Indexes
Uses a hash function to map keys to index entries.

**Characteristics:**
- Very fast for equality comparisons
- Cannot be used for range queries or sorting
- Fixed size hash table

**Best for:**
- Exact match queries
- In-memory databases
- Temporary tables

### 3. Bitmap Indexes
Uses bit arrays for each possible value in the indexed column.

**Characteristics:**
- Highly compressed
- Efficient for low-cardinality columns
- Fast for complex logical operations (AND, OR)
- Expensive to update

**Best for:**
- Data warehousing
- Columns with few distinct values
- Read-heavy workloads

### 4. Full-Text Indexes
Specialized indexes for text search operations.

**Characteristics:**
- Supports linguistic searches
- Handles stemming, synonyms, and stop words
- Enables relevance ranking

**Best for:**
- Document databases
- Search functionality
- Content management systems

### 5. Spatial Indexes
Optimized for geographic and geometric data.

**Characteristics:**
- Supports proximity and containment queries
- Uses R-trees or similar structures
- Handles multi-dimensional data

**Best for:**
- Geographic Information Systems (GIS)
- Location-based services
- Geometric data

## Index Design Strategies

### 1. Selectivity Considerations
- **High selectivity** (many unique values): Good candidates for indexing
- **Low selectivity** (few unique values): May not benefit from indexing
- Rule of thumb: Consider indexing when selectivity > 5-10%

### 2. Composite Indexes
Indexes on multiple columns provide several advantages:

- **Column order matters**: Place most selective columns first
- **Index covering**: Include all columns needed by a query
- **Index prefix**: Can use leftmost columns of the index

### 3. Filtered Indexes
Indexes on a subset of rows that match a specific condition.

**Benefits:**
- Smaller size than full-table indexes
- Better performance for queries matching the filter
- Reduced maintenance overhead

### 4. Included Columns
Non-key columns added to an index to support covering queries.

**Benefits:**
- Avoids table lookups
- Improves query performance
- Reduces I/O operations

## Index Maintenance

### 1. Index Fragmentation
Over time, indexes become fragmented due to data modifications:

- **Internal fragmentation**: Wasted space within index pages
- **External fragmentation**: Non-contiguous index pages
- **Logical fragmentation**: Out-of-order index entries

### 2. Index Statistics
Database statistics help the optimizer make good decisions:

- **Column distribution statistics**
- **Index density information**
- **Histogram data**

### 3. Maintenance Operations
- **Rebuild**: Creates a new, defragmented copy of the index
- **Reorganize**: Defragments the index in-place
- **Update statistics**: Refreshes statistical information

## Common Indexing Pitfalls

### 1. Over-Indexing
- Slows down write operations
- Increases storage requirements
- Complicates query optimization

### 2. Under-Indexing
- Poor read performance
- Excessive table scans
- High CPU and I/O usage

### 3. Redundant Indexes
- Wastes storage space
- Increases maintenance overhead
- Confuses the query optimizer

### 4. Unused Indexes
- Provide no benefit
- Consume resources
- Slow down data modifications

## Index Monitoring and Evaluation

### 1. Usage Statistics
- Track which indexes are being used
- Identify unused indexes
- Monitor index effectiveness

### 2. Performance Metrics
- Index seek vs. scan operations
- Buffer cache hit ratio
- Average query execution time

### 3. Tools and Techniques
- Execution plan analysis
- Index usage DMVs (Dynamic Management Views)
- Database profiling tools

## Conclusion
Effective indexing is a balance between read performance, write overhead, and maintenance costs. Regular monitoring and tuning of indexes is essential for maintaining optimal database performance as data volumes grow and query patterns evolve.`,
    order: 5,
    contentType: 'markdown',
    estimatedReadTime: 10,
    tags: ['Indexing', 'Database Performance', 'Query Optimization']
  },
  {
    title: 'Concurrency Control in DBMS',
    content: `# Concurrency Control in DBMS

## Introduction
Concurrency control is the process of managing simultaneous operations on a database without causing data inconsistency. It ensures that concurrent transactions do not interfere with each other while maintaining database integrity.

## Concurrency Problems

### 1. Lost Update Problem
Occurs when two transactions read and update the same data, and one transaction's update overwrites the other's without taking its changes into account.

**Example:**
- T1 reads balance = $1000
- T2 reads balance = $1000
- T1 updates balance = $1000 + $200 = $1200
- T2 updates balance = $1000 + $500 = $1500 (T1's update is lost)

### 2. Dirty Read Problem
Occurs when a transaction reads data that has been modified by another transaction that has not yet committed.

**Example:**
- T1 updates balance = $1000 - $200 = $800
- T2 reads balance = $800
- T1 rolls back, balance = $1000
- T2 is working with invalid data ($800)

### 3. Non-repeatable Read Problem
Occurs when a transaction reads the same data multiple times but gets different values each time because another transaction has modified the data between reads.

**Example:**
- T1 reads balance = $1000
- T2 updates balance = $1000 + $500 = $1500 and commits
- T1 reads balance again = $1500 (inconsistent with first read)

### 4. Phantom Read Problem
Occurs when a transaction re-executes a query returning a set of rows that satisfy a condition and finds that the set has changed due to another transaction inserting or deleting rows.

**Example:**
- T1 reads all accounts with balance > $1000 (returns 10 rows)
- T2 inserts a new account with balance = $1500 and commits
- T1 reads all accounts with balance > $1000 again (returns 11 rows)

## Concurrency Control Techniques

### 1. Locking-Based Protocols

#### Lock Types:
- **Shared (S) Lock**: Multiple transactions can hold shared locks on the same item for reading
- **Exclusive (X) Lock**: Only one transaction can hold an exclusive lock on an item for writing
- **Update (U) Lock**: Indicates intention to update, can be upgraded to X lock

#### Locking Protocols:
- **Two-Phase Locking (2PL)**: Transactions acquire all locks before releasing any
  - **Growing Phase**: Only acquire locks, no releases
  - **Shrinking Phase**: Only release locks, no acquisitions
- **Strict 2PL**: Release exclusive locks only after commit/abort
- **Rigorous 2PL**: Release all locks only after commit/abort
- **Conservative 2PL**: Acquire all locks at the beginning of the transaction

### 2. Timestamp-Based Protocols
Assigns a unique timestamp to each transaction and uses these timestamps to determine the serialization order.

**Rules:**
- If T1 has an earlier timestamp than T2, T1 should appear to execute before T2
- Read timestamp (RTS) and write timestamp (WTS) are maintained for each data item
- Conflicts are resolved based on transaction timestamps

### 3. Multiversion Concurrency Control (MVCC)
Maintains multiple versions of data items to allow readers to see a snapshot of the database without being blocked by writers.

**Characteristics:**
- Readers never block writers and vice versa
- Each write creates a new version of the data item
- Readers access the appropriate version based on transaction timestamp
- Used in PostgreSQL, Oracle, and many modern DBMS

### 4. Optimistic Concurrency Control
Assumes conflicts are rare and allows transactions to proceed without locking until the validation phase.

**Phases:**
- **Read Phase**: Transaction reads data and keeps local copies
- **Validation Phase**: Checks if concurrent transactions conflict
- **Write Phase**: If validation succeeds, makes changes permanent

## Deadlock Handling

### 1. Deadlock Prevention
Techniques to ensure deadlocks never occur:
- **Wait-Die**: Older transactions wait, younger transactions abort
- **Wound-Wait**: Older transactions cause younger ones to abort, younger wait
- **Cautious Waiting**: Wait only if it's safe to do so

### 2. Deadlock Detection
Periodically check for deadlocks using a wait-for graph and resolve them:
- Construct a graph where nodes are transactions and edges represent waiting relationships
- A cycle in the graph indicates a deadlock
- Choose a victim transaction to abort and break the cycle

### 3. Deadlock Avoidance
Use algorithms like the banker's algorithm to ensure the system never enters an unsafe state that could lead to deadlock.

## Isolation Levels in SQL Standard

### 1. READ UNCOMMITTED
- Lowest isolation level
- Allows dirty reads, non-repeatable reads, and phantom reads
- No locks on read operations

### 2. READ COMMITTED
- Prevents dirty reads
- Allows non-repeatable reads and phantom reads
- Holds read locks only for the duration of the read operation

### 3. REPEATABLE READ
- Prevents dirty reads and non-repeatable reads
- May allow phantom reads
- Holds read locks until transaction completes

### 4. SERIALIZABLE
- Highest isolation level
- Prevents all concurrency problems
- Transactions appear to execute serially
- Uses range locks or predicate locking to prevent phantom reads

## Performance Considerations

### 1. Lock Granularity
- **Database-level locking**: Entire database locked (lowest concurrency)
- **Table-level locking**: Entire table locked
- **Page-level locking**: Data pages locked
- **Row-level locking**: Individual rows locked (highest concurrency)
- **Field-level locking**: Individual fields locked (rarely implemented)

### 2. Lock Escalation
The process of converting many fine-grained locks into fewer coarse-grained locks to reduce lock management overhead.

### 3. Trade-offs
- Higher isolation levels provide stronger consistency but reduce concurrency
- Lower isolation levels increase concurrency but may introduce anomalies
- The right balance depends on application requirements

## Conclusion
Effective concurrency control is essential for maintaining data consistency in multi-user database systems. The choice of concurrency control mechanism and isolation level should be based on the specific requirements of the application, balancing data consistency needs with performance considerations.`,
    order: 6,
    contentType: 'markdown',
    estimatedReadTime: 10,
    tags: ['Concurrency Control', 'Transactions', 'Locking', 'Isolation Levels']
  }
];

const addTopicsToDBMS = async (subject, topics) => {
  for (const topic of topics) {
    const newTopic = new Topic({
      ...topic,
      subject: subject._id
    });
    await newTopic.save();
    subject.topics.push(newTopic._id);
    subject.totalTopics += 1;
    console.log(`Added topic: ${topic.title}`);
  }
  await subject.save();
};

const main = async () => {
  try {
    const dbmsSubject = await Subject.findOne({ type: 'DBMS' });
    if (!dbmsSubject) {
      console.error('DBMS subject not found');
      process.exit(1);
    }
    await addTopicsToDBMS(dbmsSubject, topics);
    console.log('Successfully added additional DBMS topics');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error in main execution:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

main(); 