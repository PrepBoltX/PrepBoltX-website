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
    title: 'SQL Joins and Set Operations',
    content: `# SQL Joins and Set Operations

## Introduction
SQL joins and set operations are fundamental techniques for combining data from multiple tables or result sets. Understanding these operations is essential for effective database querying and data analysis.

## SQL Joins

### 1. INNER JOIN
Returns records that have matching values in both tables.

**Syntax:**
\`\`\`sql
SELECT columns
FROM table1
INNER JOIN table2
ON table1.column = table2.column;
\`\`\`

**Example:**
\`\`\`sql
SELECT Orders.OrderID, Customers.CustomerName
FROM Orders
INNER JOIN Customers
ON Orders.CustomerID = Customers.CustomerID;
\`\`\`

**Visualization:**
Think of INNER JOIN as the intersection in a Venn diagram, showing only the overlapping data.

### 2. LEFT JOIN (or LEFT OUTER JOIN)
Returns all records from the left table and matched records from the right table. Results include NULL values for right table columns when there's no match.

**Syntax:**
\`\`\`sql
SELECT columns
FROM table1
LEFT JOIN table2
ON table1.column = table2.column;
\`\`\`

**Example:**
\`\`\`sql
SELECT Customers.CustomerName, Orders.OrderID
FROM Customers
LEFT JOIN Orders
ON Customers.CustomerID = Orders.CustomerID;
\`\`\`

**Use Cases:**
- Finding customers who haven't placed orders
- Preserving all records from a "main" table regardless of matches

### 3. RIGHT JOIN (or RIGHT OUTER JOIN)
Returns all records from the right table and matched records from the left table. Results include NULL values for left table columns when there's no match.

**Syntax:**
\`\`\`sql
SELECT columns
FROM table1
RIGHT JOIN table2
ON table1.column = table2.column;
\`\`\`

**Example:**
\`\`\`sql
SELECT Orders.OrderID, Employees.LastName
FROM Orders
RIGHT JOIN Employees
ON Orders.EmployeeID = Employees.EmployeeID;
\`\`\`

**Note:** Many developers prefer using LEFT JOIN with reversed table order instead of RIGHT JOIN for consistency.

### 4. FULL JOIN (or FULL OUTER JOIN)
Returns all records when there's a match in either the left or right table. Results include NULL values for columns from the table without a match.

**Syntax:**
\`\`\`sql
SELECT columns
FROM table1
FULL JOIN table2
ON table1.column = table2.column;
\`\`\`

**Example:**
\`\`\`sql
SELECT Customers.CustomerName, Orders.OrderID
FROM Customers
FULL JOIN Orders
ON Customers.CustomerID = Orders.CustomerID;
\`\`\`

**Note:** Not supported in MySQL but can be simulated with UNION of LEFT and RIGHT joins.

### 5. CROSS JOIN
Returns the Cartesian product of both tables (every row from the first table combined with every row from the second table).

**Syntax:**
\`\`\`sql
SELECT columns
FROM table1
CROSS JOIN table2;
\`\`\`

**Example:**
\`\`\`sql
SELECT Products.ProductName, Categories.CategoryName
FROM Products
CROSS JOIN Categories;
\`\`\`

**Use Cases:**
- Creating combinations of all possible options
- Generating test data

### 6. SELF JOIN
Joins a table to itself, treating it as two separate tables.

**Syntax:**
\`\`\`sql
SELECT columns
FROM table1 AS t1
JOIN table1 AS t2
ON t1.column = t2.column;
\`\`\`

**Example:**
\`\`\`sql
SELECT e1.LastName AS Employee, e2.LastName AS Manager
FROM Employees e1
JOIN Employees e2
ON e1.ManagerID = e2.EmployeeID;
\`\`\`

**Use Cases:**
- Hierarchical data (managers and employees)
- Finding relationships within the same table

## SQL Set Operations

### 1. UNION
Combines result sets of two or more SELECT statements and removes duplicate rows.

**Syntax:**
\`\`\`sql
SELECT columns FROM table1
UNION
SELECT columns FROM table2;
\`\`\`

**Example:**
\`\`\`sql
SELECT City FROM Customers
UNION
SELECT City FROM Suppliers;
\`\`\`

**Requirements:**
- Same number of columns in each SELECT statement
- Compatible data types
- Same order of columns

### 2. UNION ALL
Similar to UNION but retains duplicate rows.

**Syntax:**
\`\`\`sql
SELECT columns FROM table1
UNION ALL
SELECT columns FROM table2;
\`\`\`

**Example:**
\`\`\`sql
SELECT City FROM Customers
UNION ALL
SELECT City FROM Suppliers;
\`\`\`

**Performance Note:** UNION ALL is faster than UNION as it doesn't need to check for duplicates.

### 3. INTERSECT
Returns only the rows that appear in both result sets.

**Syntax:**
\`\`\`sql
SELECT columns FROM table1
INTERSECT
SELECT columns FROM table2;
\`\`\`

**Example:**
\`\`\`sql
SELECT City FROM Customers
INTERSECT
SELECT City FROM Suppliers;
\`\`\`

**Note:** Not supported in MySQL but can be simulated with joins or IN subqueries.

### 4. EXCEPT (or MINUS)
Returns rows from the first query that don't appear in the second query.

**Syntax:**
\`\`\`sql
SELECT columns FROM table1
EXCEPT
SELECT columns FROM table2;
\`\`\`

**Example:**
\`\`\`sql
SELECT City FROM Customers
EXCEPT
SELECT City FROM Suppliers;
\`\`\`

**Note:** Called MINUS in Oracle and not directly supported in MySQL.

## Join Optimization Techniques

### 1. Use Proper Indexes
- Create indexes on join columns
- Consider covering indexes for frequently joined queries

### 2. Join Order Matters
- Start with the smallest result set when possible
- Let the optimizer determine the best join order for complex queries

### 3. Filter Early
- Apply WHERE clauses before joins to reduce the number of rows to be joined

### 4. Use Appropriate Join Types
- Choose the right join type based on your requirements
- Avoid CROSS JOINs on large tables

### 5. Consider Denormalization
- For read-heavy workloads, strategic denormalization can reduce join overhead

## Common Join Pitfalls

### 1. Missing Join Conditions
- Forgetting join conditions leads to Cartesian products
- Always check row counts to ensure expected result sizes

### 2. Incorrect Join Types
- Using INNER JOIN when you need to preserve all rows from one table
- Using LEFT JOIN with tables in the wrong order

### 3. Joining on Non-Indexed Columns
- Significantly impacts performance on large tables
- Consider adding indexes to frequently joined columns

### 4. Ambiguous Column Names
- Always qualify column names when joining tables with similar column names
- Use table aliases for readability

## Conclusion
Mastering SQL joins and set operations is crucial for effective database querying. Choosing the right join type and optimizing join operations can significantly improve query performance and result accuracy.`,
    order: 7,
    contentType: 'markdown',
    estimatedReadTime: 10,
    tags: ['SQL', 'Joins', 'Set Operations', 'Query Techniques']
  },
  {
    title: 'Advanced SQL Features',
    content: `# Advanced SQL Features

## Introduction
Beyond basic CRUD operations, SQL offers powerful advanced features that enable complex data manipulation, analysis, and performance optimization. This topic explores these advanced capabilities that every database professional should understand.

## Common Table Expressions (CTEs)

### What Are CTEs?
Common Table Expressions (CTEs) are named temporary result sets that exist only within the execution scope of a single SQL statement.

**Syntax:**
\`\`\`sql
WITH cte_name AS (
    SELECT columns
    FROM table
    WHERE conditions
)
SELECT * FROM cte_name;
\`\`\`

### Benefits of CTEs:
- Improved readability and maintainability
- Ability to reference the same subquery multiple times
- Support for recursive queries

### Example: Non-Recursive CTE
\`\`\`sql
WITH HighValueOrders AS (
    SELECT CustomerID, OrderID, Amount
    FROM Orders
    WHERE Amount > 1000
)
SELECT Customers.Name, COUNT(HighValueOrders.OrderID) AS OrderCount
FROM Customers
LEFT JOIN HighValueOrders ON Customers.CustomerID = HighValueOrders.CustomerID
GROUP BY Customers.Name;
\`\`\`

### Recursive CTEs
Recursive CTEs are powerful for querying hierarchical or graph-structured data.

**Syntax:**
\`\`\`sql
WITH RECURSIVE cte_name AS (
    -- Base case (non-recursive term)
    SELECT columns FROM table WHERE conditions
    UNION ALL
    -- Recursive term
    SELECT columns FROM table JOIN cte_name ON join_condition
)
SELECT * FROM cte_name;
\`\`\`

**Example: Employee Hierarchy**
\`\`\`sql
WITH RECURSIVE EmployeeHierarchy AS (
    -- Base case: find the CEO (employee with no manager)
    SELECT EmployeeID, Name, Title, 0 AS Level
    FROM Employees
    WHERE ManagerID IS NULL
    
    UNION ALL
    
    -- Recursive case: find all direct reports
    SELECT e.EmployeeID, e.Name, e.Title, eh.Level + 1
    FROM Employees e
    JOIN EmployeeHierarchy eh ON e.ManagerID = eh.EmployeeID
)
SELECT * FROM EmployeeHierarchy ORDER BY Level, Name;
\`\`\`

## Window Functions

### What Are Window Functions?
Window functions perform calculations across a set of table rows related to the current row, without collapsing groups like aggregate functions do.

**Syntax:**
\`\`\`sql
SELECT column1, column2,
    WINDOW_FUNCTION() OVER (
        [PARTITION BY column1, column2, ...]
        [ORDER BY column3, column4, ...]
        [frame_clause]
    ) AS new_column
FROM table;
\`\`\`

### Common Window Functions:

#### Ranking Functions
- **ROW_NUMBER()**: Assigns unique sequential integers
- **RANK()**: Assigns rank with gaps for ties
- **DENSE_RANK()**: Assigns rank without gaps for ties
- **NTILE(n)**: Divides rows into n equal groups

**Example:**
\`\`\`sql
SELECT 
    ProductName,
    Category,
    Price,
    ROW_NUMBER() OVER (PARTITION BY Category ORDER BY Price DESC) AS PriceRank
FROM Products;
\`\`\`

#### Analytical Functions
- **LAG(column, offset)**: Accesses previous row's value
- **LEAD(column, offset)**: Accesses next row's value
- **FIRST_VALUE(column)**: First value in the window
- **LAST_VALUE(column)**: Last value in the window

**Example: Year-over-Year Comparison**
\`\`\`sql
SELECT 
    Year,
    Sales,
    LAG(Sales) OVER (ORDER BY Year) AS PreviousYearSales,
    Sales - LAG(Sales) OVER (ORDER BY Year) AS YearOverYearChange
FROM YearlySales;
\`\`\`

#### Aggregate Window Functions
- **SUM() OVER()**: Running total
- **AVG() OVER()**: Moving average
- **COUNT() OVER()**: Running count
- **MIN()/MAX() OVER()**: Running min/max

**Example: Running Total**
\`\`\`sql
SELECT 
    OrderDate,
    Amount,
    SUM(Amount) OVER (ORDER BY OrderDate) AS RunningTotal
FROM Orders;
\`\`\`

### Window Frame Clause
Controls which rows are included in the window function calculation.

**Syntax Options:**
- **ROWS BETWEEN start AND end**
- **RANGE BETWEEN start AND end**

**Example: Moving Average**
\`\`\`sql
SELECT 
    Date,
    StockPrice,
    AVG(StockPrice) OVER (
        ORDER BY Date 
        ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
    ) AS MovingAverage3Day
FROM StockPrices;
\`\`\`

## Stored Procedures and Functions

### Stored Procedures
Stored procedures are precompiled SQL statements stored in the database.

**Benefits:**
- Reduced network traffic
- Improved security through encapsulation
- Code reusability
- Transaction management

**Example (MySQL):**
\`\`\`sql
DELIMITER //
CREATE PROCEDURE GetCustomerOrders(IN customerId INT)
BEGIN
    SELECT * FROM Orders 
    WHERE CustomerID = customerId
    ORDER BY OrderDate DESC;
END //
DELIMITER ;

-- Call the procedure
CALL GetCustomerOrders(123);
\`\`\`

### User-Defined Functions
Functions return a single value and can be used in SQL statements.

**Example (PostgreSQL):**
\`\`\`sql
CREATE OR REPLACE FUNCTION CalculateDiscount(
    price DECIMAL,
    discount_percent DECIMAL
) RETURNS DECIMAL AS $$
BEGIN
    RETURN price * (1 - discount_percent / 100);
END;
$$ LANGUAGE plpgsql;

-- Use the function
SELECT ProductName, Price, CalculateDiscount(Price, 15) AS DiscountedPrice
FROM Products;
\`\`\`

## Materialized Views

### What Are Materialized Views?
Materialized views store the result of a query physically, unlike regular views which are virtual.

**Benefits:**
- Improved query performance for complex calculations
- Reduced load on source tables
- Ability to index the result set

**Example (PostgreSQL):**
\`\`\`sql
CREATE MATERIALIZED VIEW ProductSalesSummary AS
SELECT 
    p.ProductID,
    p.ProductName,
    SUM(od.Quantity) AS TotalQuantitySold,
    SUM(od.Quantity * od.UnitPrice) AS TotalRevenue
FROM Products p
JOIN OrderDetails od ON p.ProductID = od.ProductID
GROUP BY p.ProductID, p.ProductName;

-- Refresh the materialized view
REFRESH MATERIALIZED VIEW ProductSalesSummary;
\`\`\`

## JSON Support

Modern SQL databases offer extensive JSON support for flexible data storage and manipulation.

### PostgreSQL JSON Functions:
\`\`\`sql
-- Create a table with JSON column
CREATE TABLE UserProfiles (
    UserID INT PRIMARY KEY,
    Profile JSONB
);

-- Insert JSON data
INSERT INTO UserProfiles VALUES (
    1, 
    '{"name": "John", "age": 30, "interests": ["hiking", "reading"]}'
);

-- Query JSON data
SELECT 
    UserID,
    Profile->>'name' AS Name,
    (Profile->>'age')::INT AS Age,
    Profile->'interests' AS Interests
FROM UserProfiles
WHERE Profile->>'name' = 'John';

-- Update JSON data
UPDATE UserProfiles
SET Profile = jsonb_set(Profile, '{age}', '31')
WHERE UserID = 1;
\`\`\`

## Conclusion
Advanced SQL features significantly extend the capabilities of relational databases, enabling complex data analysis and manipulation. Mastering these features allows database professionals to write more efficient, maintainable, and powerful queries.`,
    order: 8,
    contentType: 'markdown',
    estimatedReadTime: 10,
    tags: ['SQL', 'Advanced Features', 'Window Functions', 'CTEs']
  },
  {
    title: 'SQL Constraints and Data Integrity',
    content: `# SQL Constraints and Data Integrity

## Introduction
Database constraints are rules enforced on data columns in tables to ensure accuracy and reliability of the data. They play a crucial role in maintaining data integrity, which is essential for any database system.

## Types of Constraints

### 1. PRIMARY KEY Constraint
Uniquely identifies each record in a table. Cannot contain NULL values and must be unique.

**Syntax:**
\`\`\`sql
-- During table creation
CREATE TABLE Employees (
    EmployeeID INT PRIMARY KEY,
    FirstName VARCHAR(50),
    LastName VARCHAR(50)
);

-- Adding to existing table
ALTER TABLE Employees
ADD PRIMARY KEY (EmployeeID);
\`\`\`

**Characteristics:**
- Each table can have only one primary key
- Can consist of multiple columns (composite primary key)
- Automatically creates an index for faster queries
- Enforces both NOT NULL and UNIQUE constraints

### 2. FOREIGN KEY Constraint
Establishes relationships between tables by referencing the primary key of another table.

**Syntax:**
\`\`\`sql
-- During table creation
CREATE TABLE Orders (
    OrderID INT PRIMARY KEY,
    OrderDate DATE,
    CustomerID INT,
    FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID)
);

-- Adding to existing table
ALTER TABLE Orders
ADD FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID);
\`\`\`

**Referential Actions:**
- **ON DELETE CASCADE**: Deletes related records when the referenced record is deleted
- **ON DELETE SET NULL**: Sets foreign key to NULL when referenced record is deleted
- **ON DELETE RESTRICT/NO ACTION**: Prevents deletion of referenced record
- **ON UPDATE CASCADE**: Updates related records when the referenced record is updated

**Example with Referential Actions:**
\`\`\`sql
CREATE TABLE Orders (
    OrderID INT PRIMARY KEY,
    CustomerID INT,
    OrderDate DATE,
    FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID)
    ON DELETE SET NULL
    ON UPDATE CASCADE
);
\`\`\`

### 3. UNIQUE Constraint
Ensures all values in a column or combination of columns are unique.

**Syntax:**
\`\`\`sql
-- During table creation
CREATE TABLE Employees (
    EmployeeID INT PRIMARY KEY,
    Email VARCHAR(100) UNIQUE,
    Phone VARCHAR(15) UNIQUE
);

-- Adding to existing table
ALTER TABLE Employees
ADD CONSTRAINT unique_email UNIQUE (Email);
\`\`\`

**Characteristics:**
- Unlike PRIMARY KEY, can accept NULL values (but only one NULL)
- Multiple UNIQUE constraints can exist in a table
- Can be applied to multiple columns (composite unique constraint)

### 4. CHECK Constraint
Ensures values in a column meet a specific condition.

**Syntax:**
\`\`\`sql
-- During table creation
CREATE TABLE Products (
    ProductID INT PRIMARY KEY,
    ProductName VARCHAR(100),
    Price DECIMAL(10,2) CHECK (Price > 0),
    Quantity INT CHECK (Quantity >= 0)
);

-- Adding to existing table
ALTER TABLE Products
ADD CONSTRAINT check_price CHECK (Price > 0);
\`\`\`

**Examples of CHECK Constraints:**
\`\`\`sql
-- Range check
CHECK (Age BETWEEN 18 AND 65)

-- Multiple conditions
CHECK (Salary > 0 AND Salary < MaxSalary)

-- Conditional checks
CHECK (
    (Status = 'Retired' AND Age >= 65) OR
    (Status = 'Active' AND Age < 65)
)
\`\`\`

### 5. NOT NULL Constraint
Ensures a column cannot have NULL values.

**Syntax:**
\`\`\`sql
-- During table creation
CREATE TABLE Customers (
    CustomerID INT PRIMARY KEY,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    Email VARCHAR(100)
);

-- Adding to existing table
ALTER TABLE Customers
MODIFY Email VARCHAR(100) NOT NULL;
\`\`\`

### 6. DEFAULT Constraint
Provides a default value for a column when no value is specified.

**Syntax:**
\`\`\`sql
-- During table creation
CREATE TABLE Orders (
    OrderID INT PRIMARY KEY,
    OrderDate DATE DEFAULT CURRENT_DATE,
    Status VARCHAR(20) DEFAULT 'Pending'
);

-- Adding to existing table
ALTER TABLE Orders
ALTER COLUMN Status SET DEFAULT 'Pending';
\`\`\`

**Common DEFAULT Values:**
- Current date/time: CURRENT_DATE, CURRENT_TIME, CURRENT_TIMESTAMP
- System values: USER, SYSTEM_USER
- Literal values: strings, numbers, booleans
- Expressions (in some DBMS)

## Domain Integrity

Domain integrity ensures that data values in a column fall within the defined domain (valid set of values).

**Implementation Methods:**
1. Data types (INT, VARCHAR, DATE, etc.)
2. CHECK constraints
3. DEFAULT constraints
4. NOT NULL constraints
5. ENUM types (in supported DBMS)

**Example: ENUM Type in MySQL:**
\`\`\`sql
CREATE TABLE Tickets (
    TicketID INT PRIMARY KEY,
    Status ENUM('Open', 'In Progress', 'Resolved', 'Closed') DEFAULT 'Open',
    Priority ENUM('Low', 'Medium', 'High', 'Critical') NOT NULL
);
\`\`\`

## Entity Integrity

Entity integrity ensures that each row in a table is uniquely identifiable.

**Implementation Methods:**
1. PRIMARY KEY constraints
2. UNIQUE constraints
3. IDENTITY/AUTO_INCREMENT columns

**Example: Auto-incrementing Primary Key:**
\`\`\`sql
-- MySQL
CREATE TABLE Customers (
    CustomerID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL
);

-- SQL Server
CREATE TABLE Customers (
    CustomerID INT IDENTITY(1,1) PRIMARY KEY,
    Name VARCHAR(100) NOT NULL
);

-- PostgreSQL
CREATE TABLE Customers (
    CustomerID SERIAL PRIMARY KEY,
    Name VARCHAR(100) NOT NULL
);
\`\`\`

## Referential Integrity

Referential integrity ensures that relationships between tables remain consistent.

**Implementation Methods:**
1. FOREIGN KEY constraints
2. Triggers for complex integrity rules

**Example: Complex Referential Integrity with Triggers:**
\`\`\`sql
-- Ensure manager is from the same department
CREATE TRIGGER check_manager_department
BEFORE INSERT OR UPDATE ON Employees
FOR EACH ROW
BEGIN
    DECLARE manager_dept INT;
    
    SELECT DepartmentID INTO manager_dept
    FROM Employees
    WHERE EmployeeID = NEW.ManagerID;
    
    IF manager_dept != NEW.DepartmentID THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Manager must be from the same department';
    END IF;
END;
\`\`\`

## Temporal Integrity

Temporal integrity ensures that date and time values are valid and consistent.

**Implementation Methods:**
1. CHECK constraints for date ranges
2. Triggers for complex date validations

**Example: Date Range Validation:**
\`\`\`sql
CREATE TABLE Projects (
    ProjectID INT PRIMARY KEY,
    ProjectName VARCHAR(100),
    StartDate DATE,
    EndDate DATE,
    CHECK (EndDate IS NULL OR EndDate >= StartDate)
);
\`\`\`

## Business Rules Implementation

Complex business rules can be implemented using:

1. **CHECK Constraints**: For simple rules
2. **Triggers**: For complex rules involving multiple tables
3. **Stored Procedures**: For validation during data entry
4. **Application Logic**: For very complex rules

**Example: Complex Business Rule with Trigger:**
\`\`\`sql
-- Ensure credit limit based on customer type
CREATE TRIGGER enforce_credit_limit
BEFORE UPDATE ON Customers
FOR EACH ROW
BEGIN
    IF NEW.CustomerType = 'Standard' AND NEW.CreditLimit > 5000 THEN
        SET NEW.CreditLimit = 5000;
    ELSEIF NEW.CustomerType = 'Premium' AND NEW.CreditLimit > 20000 THEN
        SET NEW.CreditLimit = 20000;
    END IF;
END;
\`\`\`

## Constraint Management

### Enabling and Disabling Constraints
Temporarily disable constraints for bulk operations:

\`\`\`sql
-- SQL Server
ALTER TABLE Orders
NOCHECK CONSTRAINT FK_Orders_Customers;

-- Later re-enable
ALTER TABLE Orders
CHECK CONSTRAINT FK_Orders_Customers;

-- Oracle
ALTER TABLE Orders
DISABLE CONSTRAINT FK_Orders_Customers;

-- Later re-enable
ALTER TABLE Orders
ENABLE CONSTRAINT FK_Orders_Customers;
\`\`\`

### Viewing Constraints
Query system tables to view defined constraints:

\`\`\`sql
-- SQL Server
SELECT * FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
WHERE TABLE_NAME = 'Orders';

-- MySQL
SELECT * FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
WHERE TABLE_NAME = 'Orders' AND TABLE_SCHEMA = 'your_database';

-- PostgreSQL
SELECT * FROM information_schema.table_constraints
WHERE table_name = 'orders';
\`\`\`

## Best Practices

1. **Name your constraints**: Makes maintenance and troubleshooting easier
2. **Use appropriate constraint types**: Choose the right constraint for each business rule
3. **Consider performance implications**: Constraints add overhead during data modifications
4. **Document constraints**: Include comments explaining business rules
5. **Test constraint behavior**: Verify constraints work as expected with edge cases
6. **Balance between database and application validation**: Critical rules should be enforced at the database level

## Conclusion
SQL constraints are essential for maintaining data integrity in database systems. By properly implementing constraints, you ensure that your data remains accurate, consistent, and reliable, which is crucial for any data-driven application.`,
    order: 9,
    contentType: 'markdown',
    estimatedReadTime: 10,
    tags: ['SQL', 'Constraints', 'Data Integrity', 'Database Design']
  },
  {
    title: 'Database Security and Authorization',
    content: `# Database Security and Authorization

## Introduction
Database security is a critical aspect of database management that protects data from unauthorized access, corruption, or theft. It encompasses various techniques, policies, and controls to ensure data confidentiality, integrity, and availability.

## Key Security Concepts

### 1. Authentication
Authentication verifies the identity of users or systems attempting to access the database.

**Implementation Methods:**
- **Password Authentication**: Traditional username/password verification
- **Multi-factor Authentication (MFA)**: Combines multiple verification methods
- **Biometric Authentication**: Uses fingerprints, facial recognition, etc.
- **Certificate-based Authentication**: Uses digital certificates
- **Single Sign-On (SSO)**: Allows access to multiple systems with one login

**Example in SQL:**
\`\`\`sql
CREATE USER 'john'@'localhost' IDENTIFIED BY 'secure_password';
\`\`\`

### 2. Authorization
Authorization determines what actions authenticated users can perform on database objects.

**Access Control Models:**
- **Discretionary Access Control (DAC)**: Object owners determine access rights
- **Mandatory Access Control (MAC)**: System-enforced security levels
- **Role-Based Access Control (RBAC)**: Access based on user roles
- **Attribute-Based Access Control (ABAC)**: Access based on user/object attributes

**Example in SQL:**
\`\`\`sql
-- Grant specific privileges
GRANT SELECT, INSERT ON database.table TO 'john'@'localhost';

-- Create role and assign privileges
CREATE ROLE 'app_read';
GRANT SELECT ON database.* TO 'app_read';
GRANT 'app_read' TO 'john'@'localhost';
\`\`\`

### 3. Data Encryption
Encryption transforms data into an unreadable format that can only be deciphered with the correct key.

**Types of Encryption:**
- **Data at Rest**: Encrypting stored data
- **Data in Transit**: Encrypting data during transmission
- **Transparent Data Encryption (TDE)**: Automatic encryption of database files
- **Column-level Encryption**: Encrypting specific columns

**Example in SQL:**
\`\`\`sql
-- Create table with encrypted column
CREATE TABLE customers (
  id INT PRIMARY KEY,
  name VARCHAR(100),
  credit_card_number VARBINARY(255) -- Encrypted column
);

-- Insert encrypted data
INSERT INTO customers VALUES (1, 'John Smith', ENCRYPT('1234-5678-9012-3456', 'encryption_key'));
\`\`\`

### 4. Auditing and Monitoring
Tracking database activities to detect suspicious behavior and ensure compliance.

**Key Components:**
- **Audit Trails**: Records of database actions
- **Login Monitoring**: Tracking successful and failed login attempts
- **Query Monitoring**: Analyzing SQL statements for suspicious patterns
- **Data Access Logging**: Recording who accessed what data and when

**Example in SQL:**
\`\`\`sql
-- Enable auditing (Oracle example)
AUDIT SELECT, INSERT, UPDATE, DELETE ON employees;

-- Create audit table (MySQL example)
CREATE TABLE audit_log (
  audit_id INT AUTO_INCREMENT PRIMARY KEY,
  user_name VARCHAR(50),
  action_type VARCHAR(20),
  table_name VARCHAR(50),
  record_id INT,
  old_value TEXT,
  new_value TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger for auditing
CREATE TRIGGER employees_audit_trigger
AFTER UPDATE ON employees
FOR EACH ROW
INSERT INTO audit_log (user_name, action_type, table_name, record_id, old_value, new_value)
VALUES (CURRENT_USER(), 'UPDATE', 'employees', NEW.id, 
        CONCAT('salary:', OLD.salary), CONCAT('salary:', NEW.salary));
\`\`\`

## Advanced Security Techniques

### 1. SQL Injection Prevention
SQL injection is a common attack where malicious SQL code is inserted into application queries.

**Prevention Methods:**
- **Parameterized Queries**: Using prepared statements with parameters
- **Input Validation**: Checking all user inputs
- **Stored Procedures**: Encapsulating SQL logic
- **ORM Frameworks**: Using object-relational mapping tools

**Example of Vulnerable vs. Secure Code:**

Vulnerable:
\`\`\`sql
-- Vulnerable query construction
query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'";
\`\`\`

Secure:
\`\`\`sql
-- Parameterized query
PREPARE stmt FROM "SELECT * FROM users WHERE username = ? AND password = ?";
SET @username = 'john';
SET @password = 'secure_password';
EXECUTE stmt USING @username, @password;
\`\`\`

### 2. Row-Level Security
Restricting access to specific rows based on user attributes.

**Example in PostgreSQL:**
\`\`\`sql
-- Enable row-level security
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY department_access ON employees
  FOR SELECT
  USING (department_id IN (SELECT department_id FROM user_departments WHERE user_id = current_user_id()));
\`\`\`

### 3. Database Firewalls
Specialized firewalls that monitor and filter database traffic.

**Features:**
- SQL statement analysis
- Behavioral analysis
- Whitelisting/blacklisting
- Real-time alerting

### 4. Data Masking
Obscuring sensitive data while preserving its format and usability.

**Example in SQL:**
\`\`\`sql
-- Create view with masked data
CREATE VIEW masked_customers AS
SELECT 
  id,
  name,
  CONCAT(SUBSTR(credit_card_number, 1, 4), '-XXXX-XXXX-', SUBSTR(credit_card_number, -4)) AS credit_card_number
FROM customers;
\`\`\`

## Regulatory Compliance
Database security often must comply with various regulations:

- **GDPR**: European Union's General Data Protection Regulation
- **HIPAA**: Health Insurance Portability and Accountability Act
- **PCI DSS**: Payment Card Industry Data Security Standard
- **SOX**: Sarbanes-Oxley Act

## Best Practices for Database Security

1. **Principle of Least Privilege**: Grant minimal permissions necessary
2. **Regular Security Audits**: Periodically review security measures
3. **Patch Management**: Keep database software updated
4. **Backup and Recovery**: Maintain secure backups
5. **Security Training**: Educate staff about security practices
6. **Defense in Depth**: Implement multiple layers of security
7. **Data Classification**: Identify and protect sensitive data
8. **Regular Password Rotation**: Change passwords periodically
9. **Network Segmentation**: Isolate database servers
10. **Security Incident Response Plan**: Prepare for security breaches`,
    order: 1,
    contentType: 'markdown',
    estimatedReadTime: 12,
    tags: ['Database Security', 'SQL', 'Authentication', 'Authorization', 'Encryption']
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