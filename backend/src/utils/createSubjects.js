const mongoose = require('mongoose');
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

// Subject definitions with proper categorization
const subjects = [
  {
    name: 'DBMS',
    description: 'Database Management Systems - Learn about relational databases, SQL, normalization, transactions, and more.',
    category: 'Technical',
    type: 'DBMS',
    icon: 'database_icon.png',
    color: 'bg-blue-500'
  },
  {
    name: 'OOPs',
    description: 'Object-Oriented Programming - Learn about classes, inheritance, polymorphism, encapsulation, and abstraction.',
    category: 'Technical',
    type: 'OOPs',
    icon: 'code_icon.png',
    color: 'bg-green-500'
  },
  {
    name: 'System Design',
    description: 'Learn how to design scalable systems, architecture patterns, distributed systems, and more.',
    category: 'Technical',
    type: 'System Design',
    icon: 'architecture_icon.png',
    color: 'bg-pink-500'
  },
  {
    name: 'Operating System',
    description: 'Learn about OS concepts like process management, memory management, file systems, and concurrency.',
    category: 'Technical',
    type: 'Operating System',
    icon: 'os_icon.png',
    color: 'bg-red-500'
  },
  {
    name: 'Aptitude',
    description: 'Quantitative aptitude, logical reasoning, and problem-solving skills required for competitive exams and placement interviews.',
    category: 'Non-Technical',
    type: 'Aptitude',
    icon: 'calculator_icon.png',
    color: 'bg-purple-500'
  },
  
];

async function createSubjects() {
  try {
    console.log('Starting subject creation process...');
    
    for (const subjectData of subjects) {
      // Check if subject already exists
      const existingSubject = await Subject.findOne({ $or: [
        { name: subjectData.name },
        { type: subjectData.type }
      ]});
      
      if (existingSubject) {
        console.log(`Subject ${subjectData.name} already exists, updating...`);
        
        // Update existing subject with new data
        await Subject.findByIdAndUpdate(
          existingSubject._id,
          {
            description: subjectData.description,
            category: subjectData.category,
            type: subjectData.type,
            icon: subjectData.icon,
            color: subjectData.color
          },
          { new: true }
        );
        console.log(`Updated subject: ${subjectData.name} (${subjectData.category})`);
      } else {
        // Create new subject
        const subject = new Subject(subjectData);
        const savedSubject = await subject.save();
        console.log(`Created subject: ${savedSubject.name} (${savedSubject.category})`);
      }
    }
    
    console.log('Subject creation/update completed successfully!');
  } catch (error) {
    console.error('Error creating/updating subjects:', error);
    throw error;
  }
}

// Execute the function and close the connection when done
createSubjects()
  .then(() => {
    console.log('Operation completed successfully');
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Operation failed:', err);
    mongoose.connection.close();
  }); 