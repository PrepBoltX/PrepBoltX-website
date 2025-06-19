import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import AnimatedCard from '../common/AnimatedCard';
import ProgressBar from '../common/ProgressBar';

const MockTests = () => {
  const { state } = useApp();
  const [selectedTestType, setSelectedTestType] = useState(null);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [testDuration, setTestDuration] = useState(60); // Default 60 minutes
  const [activeTest, setActiveTest] = useState(null);
  const [testResults, setTestResults] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Mock test types
  const testTypes = [
    { 
      id: 'timed', 
      name: 'Timed Test', 
      description: 'Complete all questions within a fixed time limit',
      icon: '⏱️'
    },
    { 
      id: 'subject', 
      name: 'Subject-wise Test', 
      description: 'Focus on specific subjects with dedicated question sets',
      icon: '📚'
    },
    { 
      id: 'full', 
      name: 'Full SDE Mock', 
      description: 'Complete simulation of a software development engineer interview',
      icon: '💻'
    },
    { 
      id: 'custom', 
      name: 'Custom Test', 
      description: 'Create your own test by selecting subjects and duration',
      icon: '🔧'
    }
  ];

  // Sample questions from various subjects for mock tests
  const questions = {
    dbms: [
      {
        id: 'dbms_mock_1',
        question: 'What is the primary difference between DBMS and RDBMS?',
        options: [
          'DBMS supports single users while RDBMS supports multiple users',
          'RDBMS follows the relational model, while DBMS may not',
          'DBMS is more secure than RDBMS',
          'RDBMS cannot handle large databases, but DBMS can'
        ],
        correctAnswer: 1,
        subject: 'dbms',
        difficulty: 'medium'
      },
      {
        id: 'dbms_mock_2',
        question: 'Which of the following is NOT a property of transactions in DBMS?',
        options: [
          'Atomicity',
          'Consistency',
          'Isolation',
          'Scalability'
        ],
        correctAnswer: 3,
        subject: 'dbms',
        difficulty: 'medium'
      }
    ],
    oops: [
      {
        id: 'oops_mock_1',
        question: 'Which OOP concept is used to hide the implementation details and only show the functionality?',
        options: [
          'Encapsulation',
          'Abstraction',
          'Polymorphism',
          'Inheritance'
        ],
        correctAnswer: 1,
        subject: 'oops',
        difficulty: 'easy'
      },
      {
        id: 'oops_mock_2',
        question: 'Which design pattern is used when an object needs to change its behavior based on its internal state?',
        options: [
          'Observer',
          'State',
          'Strategy',
          'Command'
        ],
        correctAnswer: 1,
        subject: 'oops',
        difficulty: 'hard'
      }
    ],
    'system-design': [
      {
        id: 'sd_mock_1',
        question: 'Which of the following is NOT a key component of microservices architecture?',
        options: [
          'Service Discovery',
          'API Gateway',
          'Monolithic Database',
          'Circuit Breaker'
        ],
        correctAnswer: 2,
        subject: 'system-design',
        difficulty: 'medium'
      },
      {
        id: 'sd_mock_2',
        question: 'When designing a system that needs to scale to millions of users, which approach is generally most effective?',
        options: [
          'Vertical scaling with powerful servers',
          'Horizontal scaling with load balancing',
          'Increasing database complexity',
          'Using a single server with high availability'
        ],
        correctAnswer: 1,
        subject: 'system-design',
        difficulty: 'medium'
      }
    ],
    aptitude: [
      {
        id: 'apt_mock_1',
        question: 'A train travels at an average speed of 60 km/h for 2.5 hours. How far did it travel?',
        options: [
          '120 km',
          '150 km',
          '180 km',
          '200 km'
        ],
        correctAnswer: 1,
        subject: 'aptitude',
        difficulty: 'easy'
      },
      {
        id: 'apt_mock_2',
        question: 'If 8 men can complete a work in 20 days, how many men would be required to complete the same work in 10 days?',
        options: [
          '4 men',
          '16 men',
          '12 men',
          '40 men'
        ],
        correctAnswer: 1,
        subject: 'aptitude',
        difficulty: 'medium'
      }
    ],
    'business-aptitude': [
      {
        id: 'ba_mock_1',
        question: 'Which financial metric measures a company\'s efficiency at generating profit from its available assets?',
        options: [
          'Return on Assets (ROA)',
          'Price-to-Earnings Ratio (P/E)',
          'Debt-to-Equity Ratio',
          'Current Ratio'
        ],
        correctAnswer: 0,
        subject: 'business-aptitude',
        difficulty: 'medium'
      },
      {
        id: 'ba_mock_2',
        question: 'What is the term for the rate of return that makes the net present value (NPV) of an investment zero?',
        options: [
          'Rate of Return',
          'Internal Rate of Return (IRR)',
          'Payback Period',
          'Return on Investment (ROI)'
        ],
        correctAnswer: 1,
        subject: 'business-aptitude',
        difficulty: 'hard'
      }
    ]
  };

  // Toggle subject selection for custom tests
  const toggleSubjectSelection = (subjectId) => {
    if (selectedSubjects.includes(subjectId)) {
      setSelectedSubjects(selectedSubjects.filter(id => id !== subjectId));
    } else {
      setSelectedSubjects([...selectedSubjects, subjectId]);
    }
  };

  // Generate test with questions based on test type and parameters
  const generateTest = () => {
    let testQuestions = [];
    let timeLimit = testDuration * 60; // Convert minutes to seconds
    let testSubjects = [];

    switch (selectedTestType) {
      case 'timed':
        testSubjects = Object.keys(questions);
        // Get 2 questions from each subject
        testSubjects.forEach(subject => {
          testQuestions = [...testQuestions, ...questions[subject].slice(0, 2)];
        });
        break;
      
      case 'subject':
        if (selectedSubjects.length > 0) {
          testSubjects = selectedSubjects;
        } else {
          const randomSubject = Object.keys(questions)[Math.floor(Math.random() * Object.keys(questions).length)];
          testSubjects = [randomSubject];
        }
        
        testSubjects.forEach(subject => {
          testQuestions = [...testQuestions, ...questions[subject]];
        });
        break;
      
      case 'full':
        testSubjects = Object.keys(questions);
        // For a full SDE mock, take all available questions
        testSubjects.forEach(subject => {
          testQuestions = [...testQuestions, ...questions[subject]];
        });
        break;
      
      case 'custom':
        testSubjects = selectedSubjects.length > 0 ? selectedSubjects : Object.keys(questions);
        // For custom test, select questions from chosen subjects
        testSubjects.forEach(subject => {
          testQuestions = [...testQuestions, ...questions[subject]];
        });
        break;
      
      default:
        testSubjects = Object.keys(questions);
        testQuestions = Object.values(questions).flat();
    }

    // Shuffle questions for randomization
    testQuestions = shuffleArray(testQuestions);

    setActiveTest({
      title: getTestTitle(),
      questions: testQuestions,
      timeLimit,
      subjects: testSubjects
    });
    
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setTimeRemaining(timeLimit);
  };

  // Helper to shuffle array
  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  // Generate an appropriate test title based on selections
  const getTestTitle = () => {
    switch (selectedTestType) {
      case 'timed':
        return `${testDuration}-Minute Timed Test`;
      case 'subject':
        if (selectedSubjects.length === 1) {
          const subject = state.subjects.find(s => s.id === selectedSubjects[0]);
          return `${subject?.name || 'Subject'} Test`;
        }
        return 'Multi-Subject Test';
      case 'full':
        return 'Full SDE Mock Interview';
      case 'custom':
        return 'Custom Mock Test';
      default:
        return 'Mock Test';
    }
  };

  const handleAnswerSelect = (questionId, answerIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: answerIndex
    });
  };

  const moveToNextQuestion = () => {
    if (currentQuestionIndex < activeTest.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      finishTest();
    }
  };

  const moveToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const finishTest = () => {
    // Calculate test results
    const totalQuestions = activeTest.questions.length;
    let correctCount = 0;
    
    activeTest.questions.forEach(question => {
      if (selectedAnswers[question.id] === question.correctAnswer) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / totalQuestions) * 100);
    const timeTaken = activeTest.timeLimit - timeRemaining;

    const results = {
      score,
      totalQuestions,
      correctAnswers: correctCount,
      timeTaken,
      feedback: generateFeedback(score),
      detailedResults: activeTest.questions.map(question => {
        const userAnswer = selectedAnswers[question.id];
        return {
          questionId: question.id,
          question: question.question,
          userAnswer,
          correctAnswer: question.correctAnswer,
          isCorrect: userAnswer === question.correctAnswer,
          subject: question.subject,
          difficulty: question.difficulty
        };
      }),
      subjectPerformance: calculateSubjectPerformance(activeTest.questions, selectedAnswers)
    };

    setTestResults(results);
    setActiveTest(null);
  };

  // Generate personalized feedback based on score
  const generateFeedback = (score) => {
    if (score >= 90) {
      return "Outstanding performance! You're well-prepared for your placements. Keep up the excellent work!";
    } else if (score >= 75) {
      return "Great job! You have a solid understanding of the concepts. Focus on the few areas where you made mistakes.";
    } else if (score >= 60) {
      return "Good effort! You're on the right track, but need more practice with some concepts. Review the questions you missed.";
    } else if (score >= 40) {
      return "You've made a start, but need more consistent practice. Focus on understanding the core concepts before moving to advanced topics.";
    } else {
      return "Don't get discouraged! Take time to review the fundamentals and try again. Consider focusing on one subject at a time.";
    }
  };

  // Calculate performance by subject
  const calculateSubjectPerformance = (questions, answers) => {
    const subjectStats = {};
    
    questions.forEach(question => {
      const subject = question.subject;
      if (!subjectStats[subject]) {
        subjectStats[subject] = {
          total: 0,
          correct: 0,
          percent: 0
        };
      }
      
      subjectStats[subject].total += 1;
      if (answers[question.id] === question.correctAnswer) {
        subjectStats[subject].correct += 1;
      }
    });
    
    // Calculate percentages
    Object.keys(subjectStats).forEach(subject => {
      subjectStats[subject].percent = Math.round(
        (subjectStats[subject].correct / subjectStats[subject].total) * 100
      );
    });
    
    return subjectStats;
  };

  const resetTest = () => {
    setSelectedTestType(null);
    setSelectedSubjects([]);
    setActiveTest(null);
    setTestResults(null);
  };

  // Render test type selection
  if (!selectedTestType) {
    return (
      <div className="py-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Mock Tests</h2>
        <p className="text-gray-600 mb-8">
          Challenge yourself with a variety of mock tests designed to simulate real interview conditions.
          Choose the test format that best suits your preparation needs.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testTypes.map(type => (
            <AnimatedCard
              key={type.id}
              onClick={() => setSelectedTestType(type.id)}
              className="cursor-pointer hover:shadow-lg transition-shadow border rounded-xl p-6"
            >
              <div className="flex items-start">
                <span className="text-3xl mr-4">{type.icon}</span>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{type.name}</h3>
                  <p className="text-gray-600">{type.description}</p>
                </div>
              </div>
            </AnimatedCard>
          ))}
        </div>
      </div>
    );
  }

  // Render test configuration
  if (!activeTest && !testResults) {
    return (
      <div className="py-6">
        <button 
          onClick={() => setSelectedTestType(null)}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <span className="mr-2">←</span> Back to Test Types
        </button>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {testTypes.find(t => t.id === selectedTestType)?.name}
        </h2>
        <p className="text-gray-600 mb-8">Configure your test settings below</p>
        
        {/* Subject selection (for subject-wise and custom tests) */}
        {(selectedTestType === 'subject' || selectedTestType === 'custom') && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Subjects</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {state.subjects.map(subject => (
                <div 
                  key={subject.id}
                  onClick={() => toggleSubjectSelection(subject.id)}
                  className={`
                    p-4 border rounded-lg cursor-pointer 
                    ${selectedSubjects.includes(subject.id) 
                      ? 'border-blue-500 bg-blue-400' 
                      : 'hover:bg-gray-600'}
                  `}
                >
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={selectedSubjects.includes(subject.id)}
                      onChange={() => {}} // Controlled by parent div click
                      className="mr-3"
                    />
                    <span>{subject.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Duration selection (for timed and custom tests) */}
        {(selectedTestType === 'timed' || selectedTestType === 'custom') && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Test Duration</h3>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="15"
                max="180"
                step="15"
                value={testDuration}
                onChange={(e) => setTestDuration(parseInt(e.target.value))}
                className="w-64"
              />
              <span className="text-lg font-medium text-gray-800">{testDuration} minutes</span>
            </div>
          </div>
        )}
        
        {/* Test summary */}
        <div className="bg-white rounded-lg p-6 mb-8 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Test Summary</h3>
          <ul className="space-y-2 text-gray-800">
            <li>
              <span className="font-medium">Test Type:</span> {testTypes.find(t => t.id === selectedTestType)?.name}
            </li>
            {(selectedTestType === 'subject' || selectedTestType === 'custom') && selectedSubjects.length > 0 && (
              <li>
                <span className="font-medium">Selected Subjects:</span> {selectedSubjects.map(
                  id => state.subjects.find(s => s.id === id)?.name
                ).join(', ')}
              </li>
            )}
            {(selectedTestType === 'timed' || selectedTestType === 'custom') && (
              <li>
                <span className="font-medium">Duration:</span> {testDuration} minutes
              </li>
            )}
          </ul>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={generateTest}
            className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-6 py-3 rounded-md"
          >
            Start Test
          </button>
        </div>
      </div>
    );
  }

  // Render active test
  if (activeTest) {
    const currentQuestion = activeTest.questions[currentQuestionIndex];
    return (
      <div className="py-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{activeTest.title}</h2>
          <div className="text-right">
            <div className="text-sm text-gray-800 mb-1">Question {currentQuestionIndex + 1} of {activeTest.questions.length}</div>
            <div className="text-sm font-medium text-blue-600">
              Time Remaining: {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}
            </div>
          </div>
        </div>
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-semibold text-gray-800">{currentQuestion.question}</h3>
            <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
              {state.subjects.find(s => s.id === currentQuestion.subject)?.name || currentQuestion.subject}
            </span>
          </div>
          
          <div className="space-y-3 mb-6">
            {currentQuestion.options.map((option, index) => (
              <div 
                key={index}
                onClick={() => handleAnswerSelect(currentQuestion.id, index)}
                className={`
                  p-4 border rounded-lg cursor-pointer transition-colors 
                  ${selectedAnswers[currentQuestion.id] === index ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'}
                `}
              >
                <div className="flex items-center">
                  <div className={`
                    w-6 h-6 rounded-full flex items-center justify-center mr-3 border
                    ${selectedAnswers[currentQuestion.id] === index ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-300 text-gray-700'}
                  `}>
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="text-gray-800">{option}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-between">
          <button
            onClick={moveToPreviousQuestion}
            className="px-4 py-2 border rounded-md hover:bg-gray-50"
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={finishTest}
              className="px-4 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-50"
            >
              End Test
            </button>
            <button
              onClick={moveToNextQuestion}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {currentQuestionIndex === activeTest.questions.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render test results
  if (testResults) {
    return (
      <div className="py-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Test Results</h2>
        
        <div className="bg-white shadow-lg rounded-xl p-8 mb-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-semibold text-gray-800">Your Score</h3>
            <div className="text-4xl font-bold text-blue-600">{testResults.score}%</div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="border rounded-lg p-4">
              <div className="text-gray-600 mb-1">Questions</div>
              <div className="text-2xl font-semibold">
                {testResults.correctAnswers}/{testResults.totalQuestions} correct
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="text-gray-600 mb-1">Time Taken</div>
              <div className="text-2xl font-semibold">
                {Math.floor(testResults.timeTaken / 60)}:{String(testResults.timeTaken % 60).padStart(2, '0')}
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="text-gray-600 mb-1">Performance</div>
              <div className="text-2xl font-semibold text-gray-800">
                {testResults.score >= 80 ? 'Excellent' : testResults.score >= 60 ? 'Good' : testResults.score >= 40 ? 'Average' : 'Needs Improvement'}
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-10">
            <h4 className="font-semibold text-blue-800 mb-2">AI Feedback</h4>
            <p className="text-blue-700">{testResults.feedback}</p>
          </div>
          
          {/* Subject-wise performance */}
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Subject Performance</h4>
          <div className="space-y-4 mb-10">
            {Object.entries(testResults.subjectPerformance).map(([subject, stats]) => {
              const subjectInfo = state.subjects.find(s => s.id === subject);
              return (
                <div key={subject} className="border rounded-lg p-4">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-gray-800">{subjectInfo?.name || subject}</span>
                    <span className={`
                      font-semibold
                      ${stats.percent >= 80 ? 'text-green-600' : 
                        stats.percent >= 60 ? 'text-blue-600' : 
                        stats.percent >= 40 ? 'text-yellow-600' : 'text-red-600'}
                    `}>
                      {stats.percent}%
                    </span>
                  </div>
                  <ProgressBar 
                    progress={stats.percent}
                    className="h-2 bg-gray-200"
                    barClassName={`
                      ${stats.percent >= 80 ? 'bg-green-500' : 
                        stats.percent >= 60 ? 'bg-blue-500' : 
                        stats.percent >= 40 ? 'bg-yellow-500' : 'bg-red-500'}
                    `}
                  />
                  <div className="mt-1 text-sm text-gray-600">
                    {stats.correct} of {stats.total} questions correct
                  </div>
                </div>
              );
            })}
          </div>
          
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Question Analysis</h4>
          <div className="space-y-3 mb-6">
            {testResults.detailedResults.map((result, index) => (
              <div key={index} className="flex items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 
                  ${result.isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                  {result.isCorrect ? '✓' : '✗'}
                </div>
                <div className="flex-grow">
                  <div className="text-gray-800 truncate">{result.question}</div>
                  <div className="text-sm text-gray-500">
                    {state.subjects.find(s => s.id === result.subject)?.name || result.subject} · 
                    {result.difficulty.charAt(0).toUpperCase() + result.difficulty.slice(1)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-end space-x-4">
          <button
            onClick={resetTest}
            className="px-6 py-3 border rounded-md hover:bg-gray-50"
          >
            Take Another Test
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default MockTests; 