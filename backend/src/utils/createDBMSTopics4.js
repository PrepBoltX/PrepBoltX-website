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
    order: 10,
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