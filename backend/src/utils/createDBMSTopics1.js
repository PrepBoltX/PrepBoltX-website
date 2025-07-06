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
    title: 'Entity-Relationship (ER) Model',
    content: `# Entity-Relationship (ER) Model

## Introduction
The Entity-Relationship (ER) Model is a high-level conceptual data model used to represent data and relationships in a database system. Developed by Peter Chen in 1976, it provides a visual representation of entities, their attributes, and the relationships between them.

## Core Components

### 1. Entities
An entity represents a real-world object, concept, or event about which data is collected. Entities are categorized as:

- **Strong Entity**: Exists independently of other entities (e.g., Employee, Department)
- **Weak Entity**: Depends on another entity for its existence (e.g., Dependent of an Employee)

### 2. Attributes
Attributes are properties that describe an entity:

- **Simple**: Cannot be divided further (e.g., Employee ID)
- **Composite**: Can be divided into smaller components (e.g., Address = Street + City + State)
- **Single-valued**: Have only one value (e.g., Social Security Number)
- **Multi-valued**: Can have multiple values (e.g., Skills)
- **Derived**: Values calculated from other attributes (e.g., Age derived from Date of Birth)
- **Key Attribute**: Uniquely identifies an entity instance (e.g., Employee ID)

### 3. Relationships
A relationship describes an association between entities:

- **One-to-One (1:1)**: One entity instance relates to exactly one instance of another entity
- **One-to-Many (1:N)**: One entity instance relates to multiple instances of another entity
- **Many-to-Many (M:N)**: Multiple instances of an entity relate to multiple instances of another entity

### 4. Cardinality and Participation
- **Cardinality**: Defines the number of instances of an entity in a relationship
- **Participation**: Specifies whether all or some entity instances participate in a relationship
  - **Total Participation**: Every entity instance must participate
  - **Partial Participation**: Some entity instances may participate

## Enhanced ER (EER) Model Features
- **Specialization**: Defining subgroups within an entity set
- **Generalization**: Abstracting common features to create a higher-level entity
- **Aggregation**: Representing relationships between a whole object and its parts
- **Inheritance**: Allowing subclasses to inherit attributes from superclasses

## Converting ER to Relational Schema
1. Each strong entity becomes a table
2. Attributes become columns
3. Primary key attributes become primary keys
4. For 1:N relationships, the foreign key is placed in the "many" side table
5. For M:N relationships, create a new junction table with foreign keys from both entities
6. Weak entities become tables with foreign keys to their identifying entity

## Advantages of ER Model
- Simplifies database design with visual representation
- Facilitates communication between designers and stakeholders
- Helps identify entities and relationships clearly
- Provides foundation for generating the physical database schema`,
    order: 1,
    contentType: 'markdown',
    estimatedReadTime: 10,
    tags: ['ER Model', 'Database Design', 'Conceptual Modeling']
  },
  {
    title: 'Normalization and Normal Forms',
    content: `# Normalization and Normal Forms

## Introduction
Normalization is a systematic approach to database design that eliminates data redundancy and ensures data integrity by organizing data into tables based on functional dependencies and primary keys.

## Purpose of Normalization
- Eliminate data redundancy
- Prevent update, insert, and delete anomalies
- Ensure data consistency and integrity
- Simplify data maintenance

## Functional Dependencies
A functional dependency (FD) exists when one attribute determines another attribute. If attribute A functionally determines attribute B (written as A → B), then for each value of A, there is exactly one value of B.

## Normal Forms

### First Normal Form (1NF)
A relation is in 1NF if:
- All attributes contain only atomic (indivisible) values
- No repeating groups or arrays
- All entries in a column are of the same domain

**Example:**
Non-1NF:
\`\`\`
Student(ID, Name, Courses)
1, John, {Math, Physics, Chemistry}
\`\`\`

1NF:
\`\`\`
Student(ID, Name, Course)
1, John, Math
1, John, Physics
1, John, Chemistry
\`\`\`

### Second Normal Form (2NF)
A relation is in 2NF if:
- It is in 1NF
- No partial dependencies (non-prime attributes depend on the entire primary key)

**Example:**
Non-2NF:
\`\`\`
CourseEnrollment(StudentID, CourseID, StudentName, CourseName)
\`\`\`

2NF:
\`\`\`
Student(StudentID, StudentName)
Course(CourseID, CourseName)
Enrollment(StudentID, CourseID)
\`\`\`

### Third Normal Form (3NF)
A relation is in 3NF if:
- It is in 2NF
- No transitive dependencies (non-prime attributes depend only on the primary key)

**Example:**
Non-3NF:
\`\`\`
Employee(EmpID, DeptID, DeptLocation)
\`\`\`

3NF:
\`\`\`
Employee(EmpID, DeptID)
Department(DeptID, DeptLocation)
\`\`\`

### Boyce-Codd Normal Form (BCNF)
A relation is in BCNF if:
- It is in 3NF
- For every functional dependency X → Y, X is a superkey

### Fourth Normal Form (4NF)
A relation is in 4NF if:
- It is in BCNF
- No multi-valued dependencies

### Fifth Normal Form (5NF)
A relation is in 5NF if:
- It is in 4NF
- Cannot be decomposed into smaller tables without losing information

## Denormalization
Denormalization is the process of deliberately introducing redundancy by combining normalized tables to:
- Improve query performance
- Reduce the need for complex joins
- Optimize read-heavy databases

## Trade-offs in Normalization
- Higher normalization reduces redundancy but may require more joins
- Lower normalization may improve read performance but complicates updates
- Most practical designs aim for 3NF or BCNF, with selective denormalization`,
    order: 2,
    contentType: 'markdown',
    estimatedReadTime: 10,
    tags: ['Normalization', 'Database Design', 'Normal Forms']
  },
  {
    title: 'Transactions and ACID Properties',
    content: `# Transactions and ACID Properties

## Introduction to Transactions
A transaction is a logical unit of work containing one or more database operations that either all succeed (commit) or all fail (rollback), maintaining database consistency even in the event of system failures.

## Transaction States
1. **Active**: Transaction is executing operations
2. **Partially Committed**: Final operation executed but not yet committed
3. **Committed**: Transaction completed successfully
4. **Failed**: Normal execution cannot proceed
5. **Aborted**: Transaction rolled back
6. **Terminated**: Final state after commit or abort

## ACID Properties

### Atomicity
Ensures a transaction is treated as a single, indivisible unit that either completes entirely or not at all.

**Key aspects:**
- All operations succeed or none do
- If any part fails, the entire transaction is rolled back
- Implemented through write-ahead logging or shadow paging

**Example:**
In a bank transfer from Account A to Account B:
- Debit $100 from Account A
- Credit $100 to Account B

If the system fails after the debit but before the credit, atomicity ensures the debit is rolled back.

### Consistency
Ensures a transaction brings the database from one valid state to another, maintaining all predefined rules and constraints.

**Key aspects:**
- All integrity constraints are preserved
- Referential integrity is maintained
- Domain constraints are satisfied

**Example:**
If a bank account balance cannot be negative, a transaction that would result in a negative balance must be rejected.

### Isolation
Ensures concurrent transactions do not interfere with each other.

**Key aspects:**
- Concurrent transactions appear to execute serially
- Intermediate states are invisible to other transactions
- Prevents dirty reads, non-repeatable reads, and phantom reads

**Isolation Levels:**
1. **Read Uncommitted**: Allows dirty reads
2. **Read Committed**: Prevents dirty reads
3. **Repeatable Read**: Prevents dirty and non-repeatable reads
4. **Serializable**: Prevents all concurrency side effects

### Durability
Ensures that once a transaction is committed, its effects persist even in the event of system failures.

**Key aspects:**
- Committed changes are permanent
- Recovery mechanisms ensure data survives system crashes
- Implemented through write-ahead logging or redundant storage

## Concurrency Control Techniques

### Locking-Based Protocols
- **Two-Phase Locking (2PL)**: Acquire all locks before releasing any
- **Lock Types**: Shared (read) and Exclusive (write)
- **Deadlock Handling**: Prevention, detection, and resolution

### Timestamp-Based Protocols
- Assigns a unique timestamp to each transaction
- Orders conflicting operations based on transaction timestamps

### Optimistic Concurrency Control
- Assumes conflicts are rare
- Three phases: Read, Validation, Write

### Multiversion Concurrency Control (MVCC)
- Maintains multiple versions of data items
- Readers never block writers and vice versa

## Common Transaction Problems
- **Dirty Read**: Reading uncommitted changes
- **Non-repeatable Read**: Getting different results from the same query
- **Phantom Read**: New rows appear in a result set when a query is re-executed
- **Lost Update**: Two transactions overwrite each other's changes
- **Deadlock**: Two or more transactions waiting for each other to release locks

## Best Practices
1. Keep transactions short and focused
2. Minimize the scope of locks
3. Choose appropriate isolation levels
4. Handle deadlocks gracefully
5. Consider the trade-off between consistency and performance`,
    order: 3,
    contentType: 'markdown',
    estimatedReadTime: 10,
    tags: ['Transactions', 'ACID Properties', 'Concurrency Control']
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
    console.log('Successfully added DBMS topics');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error in main execution:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

main(); 