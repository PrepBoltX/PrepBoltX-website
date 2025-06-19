import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { QuizContext, TimedQuizStrategy, PracticeQuizStrategy, AdaptiveQuizStrategy } from '../../services/QuizStrategies';
import { BaseQuiz, HintsDecorator, ExplanationDecorator, ProgressTrackingDecorator } from '../../services/QuizDecorator';
import AnimatedCard from '../common/AnimatedCard';
import ProgressBar from '../common/ProgressBar';

const Quizzes = () => {
  const { state } = useApp();
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedQuizType, setSelectedQuizType] = useState(null);
  const [quizConfig, setQuizConfig] = useState({
    useHints: false,
    showExplanations: true,
    trackProgress: true
  });
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizResults, setQuizResults] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Sample quiz data - in production, this would come from an API
  const quizzes = {
    dbms: {
      title: 'Database Management Quiz',
      questions: [
        {
          id: 'dbms1',
          question: 'Which normal form deals with removing transitive dependencies?',
          options: ['1NF', '2NF', '3NF', 'BCNF'],
          correctAnswer: 2,
          explanation: '3NF removes transitive dependencies, where non-key attributes depend on other non-key attributes.'
        },
        {
          id: 'dbms2',
          question: 'Which of the following is NOT a type of SQL command?',
          options: ['DDL', 'DML', 'DCL', 'DRL'],
          correctAnswer: 3,
          explanation: 'DRL is not a standard SQL command type. The main types are DDL, DML, DCL, and TCL.'
        },
        {
          id: 'dbms3',
          question: 'What is a foreign key?',
          options: [
            'A key used for encryption', 
            'A key that uniquely identifies each record', 
            'A field that links to the primary key of another table', 
            'A key imported from another database'
          ],
          correctAnswer: 2,
          explanation: 'A foreign key is a field that links to the primary key of another table, creating a relationship between tables.'
        }
      ],
      timeLimit: 300 // 5 minutes
    },
    oops: {
      title: 'Object-Oriented Programming Quiz',
      questions: [
        {
          id: 'oop1',
          question: 'Which OOP concept prevents the modification of a class by other classes?',
          options: ['Inheritance', 'Polymorphism', 'Encapsulation', 'Abstraction'],
          correctAnswer: 2,
          explanation: 'Encapsulation hides the internal state of an object and requires access through methods, preventing direct modification.'
        },
        {
          id: 'oop2',
          question: 'What is method overriding?',
          options: [
            'Creating multiple methods with the same name but different parameters', 
            'Redefining a method of a parent class in a child class', 
            'Creating a static copy of a method', 
            'Using a method from another class'
          ],
          correctAnswer: 1,
          explanation: 'Method overriding is redefining a method from a parent class in a child class with the same signature but different implementation.'
        }
      ],
      timeLimit: 300
    },
    'system-design': {
      title: 'System Design Quiz',
      questions: [
        {
          id: 'sd1',
          question: 'Which of these is NOT typically a concern in system design?',
          options: ['Scalability', 'Reliability', 'Syntax highlighting', 'Security'],
          correctAnswer: 2,
          explanation: 'Syntax highlighting is related to code editors/IDEs, not system design principles.'
        },
        {
          id: 'sd2',
          question: 'What does CAP theorem state?',
          options: [
            'A distributed system cannot simultaneously guarantee all three: consistency, availability, and partition tolerance', 
            'Complex systems always produce problems', 
            'Coding and programming are the same thing', 
            'Computers always process data sequentially'
          ],
          correctAnswer: 0,
          explanation: 'CAP theorem states that a distributed data store cannot simultaneously provide more than two out of Consistency, Availability, and Partition tolerance.'
        }
      ],
      timeLimit: 240
    },
    aptitude: {
      title: 'Aptitude Quiz',
      questions: [
        {
          id: 'apt1',
          question: 'If a car travels at 60 km/hr, how many meters does it cover in 1 minute?',
          options: ['600 meters', '1000 meters', '1600 meters', '6000 meters'],
          correctAnswer: 0,
          explanation: '60 km/hr = 60000 m / 60 min = 1000 m/min'
        },
        {
          id: 'apt2',
          question: 'What comes next in the sequence: 2, 6, 12, 20, 30, ?',
          options: ['36', '42', '48', '54'],
          correctAnswer: 1,
          explanation: 'The pattern is +4, +6, +8, +10, +12. So 30+12=42.'
        }
      ],
      timeLimit: 180
    },
    'business-aptitude': {
      title: 'Business Aptitude Quiz',
      questions: [
        {
          id: 'ba1',
          question: 'Which financial ratio measures a company\'s ability to pay short-term obligations?',
          options: ['P/E Ratio', 'Current Ratio', 'Debt-to-Equity', 'ROI'],
          correctAnswer: 1,
          explanation: 'Current Ratio compares current assets to current liabilities, indicating ability to pay short-term debts.'
        },
        {
          id: 'ba2',
          question: 'What is opportunity cost?',
          options: [
            'The cost of starting a new business', 
            'The value of the best alternative foregone', 
            'The cost of marketing a product', 
            'The cost of training employees'
          ],
          correctAnswer: 1,
          explanation: 'Opportunity cost represents the benefits you miss out on when choosing one alternative over another.'
        }
      ],
      timeLimit: 180
    }
  };

  const quizTypes = [
    { id: 'timed', name: 'Timed Quiz', description: 'Answer questions within a time limit', strategy: TimedQuizStrategy },
    { id: 'practice', name: 'Practice Mode', description: 'Take your time to learn with detailed explanations', strategy: PracticeQuizStrategy },
    { id: 'adaptive', name: 'Adaptive Quiz', description: 'Questions adjust to your skill level', strategy: AdaptiveQuizStrategy }
  ];

  const startQuiz = async () => {
    if (!selectedSubject || !selectedQuizType) return;

    const quizData = quizzes[selectedSubject];
    let quiz = new BaseQuiz(quizData);
    
    // Apply decorators based on config
    if (quizConfig.useHints) {
      quiz = new HintsDecorator(quiz);
    }
    if (quizConfig.showExplanations) {
      quiz = new ExplanationDecorator(quiz);
    }
    if (quizConfig.trackProgress) {
      quiz = new ProgressTrackingDecorator(quiz);
    }

    // Set up the strategy
    const strategyClass = quizTypes.find(type => type.id === selectedQuizType)?.strategy || TimedQuizStrategy;
    const quizContext = new QuizContext(new strategyClass());
    
    setActiveQuiz({
      ...quizData,
      context: quizContext,
      component: quiz
    });
    
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setTimeRemaining(quizData.timeLimit);
    setQuizResults(null);
  };

  const handleAnswerSelect = (questionId, answerIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: answerIndex
    });
  };

  const moveToNextQuestion = () => {
    if (currentQuestionIndex < activeQuiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      finishQuiz();
    }
  };

  const moveToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const finishQuiz = async () => {
    // In real implementation, would pass user answers to the strategy
    const results = await activeQuiz.context.executeQuiz(activeQuiz);
    setQuizResults(results);
    setActiveQuiz(null);
  };

  const resetQuiz = () => {
    setSelectedSubject(null);
    setSelectedQuizType(null);
    setActiveQuiz(null);
    setQuizResults(null);
  };

  // Render quiz selection
  if (!selectedSubject) {
    return (
      <div className="py-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Choose a Subject</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {state.subjects.map(subject => (
            <AnimatedCard 
              key={subject.id}
              onClick={() => setSelectedSubject(subject.id)}
              className={`cursor-pointer hover:shadow-lg transition-shadow ${subject.color} text-gray-100 p-6 rounded-xl`}
            >
              <h3 className="text-xl font-semibold mb-2 text-white">{subject.name}</h3>
              <ProgressBar 
                progress={subject.progress} 
                className="h-2 bg-white/20" 
                barClassName="bg-white"
              />
              <p className="mt-2 text-white">
                {subject.completedTopics} of {subject.totalTopics} topics completed
              </p>
            </AnimatedCard>
          ))}
        </div>
      </div>
    );
  }

  // Render quiz type selection
  if (!selectedQuizType) {
    const subject = state.subjects.find(s => s.id === selectedSubject);
    
    return (
      <div className="py-6">
        <button 
          onClick={() => setSelectedSubject(null)}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <span className="mr-2">←</span> Back to Subjects
        </button>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {subject?.name} Quiz
        </h2>
        <p className="text-gray-600 mb-6">Choose your quiz mode:</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {quizTypes.map(type => (
            <div 
              key={type.id}
              onClick={() => setSelectedQuizType(type.id)}
              className="border rounded-lg p-6 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors bg-white"
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-800">{type.name}</h3>
              <p className="text-gray-600">{type.description}</p>
            </div>
          ))}
        </div>
        
        <div className="bg-gray-100 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3">Quiz Settings</h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="hints"
                className="mr-2"
                checked={quizConfig.useHints}
                onChange={() => setQuizConfig({...quizConfig, useHints: !quizConfig.useHints})}
              />
              <label htmlFor="hints" className="text-gray-700">Enable hints</label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="explanations"
                className="mr-2"
                checked={quizConfig.showExplanations}
                onChange={() => setQuizConfig({...quizConfig, showExplanations: !quizConfig.showExplanations})}
              />
              <label htmlFor="explanations" className="text-gray-700">Show explanations after answering</label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="track-progress"
                className="mr-2"
                checked={quizConfig.trackProgress}
                onChange={() => setQuizConfig({...quizConfig, trackProgress: !quizConfig.trackProgress})}
              />
              <label htmlFor="track-progress" className="text-gray-700">Track progress in profile</label>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex justify-end">
          <button 
            onClick={startQuiz}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-md"
          >
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  // Render active quiz
  if (activeQuiz && !quizResults) {
    const currentQuestion = activeQuiz.questions[currentQuestionIndex];
    
    return (
      <div className="py-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{activeQuiz.title}</h2>
          <div className="text-right">
            <div className="text-sm text-gray-600 mb-1">Question {currentQuestionIndex + 1} of {activeQuiz.questions.length}</div>
            <div className="text-sm font-medium text-blue-600">
              Time Remaining: {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">{currentQuestion.question}</h3>
          
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
                {option}
              </div>
            ))}
          </div>
          
          {quizConfig.showExplanations && selectedAnswers[currentQuestion.id] !== undefined && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg">
              <p className="font-semibold text-gray-800">Explanation:</p>
              <p className="text-gray-700">{currentQuestion.explanation}</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-between">
          <button
            onClick={moveToPreviousQuestion}
            className="px-4 py-2 border rounded-md hover:bg-gray-50"
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </button>
          
          <button
            onClick={moveToNextQuestion}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {currentQuestionIndex === activeQuiz.questions.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    );
  }

  // Render quiz results
  if (quizResults) {
    return (
      <div className="py-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Quiz Results</h2>
        
        <div className="bg-white shadow-lg rounded-xl p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Your Score</h3>
            <div className="text-3xl font-bold text-blue-600">{quizResults.score}%</div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="border rounded-lg p-4">
              <div className="text-gray-600 mb-1">Questions</div>
              <div className="text-2xl font-semibold">
                {quizResults.correctAnswers}/{quizResults.totalQuestions} correct
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="text-gray-600 mb-1">Time Taken</div>
              <div className="text-2xl font-semibold">
                {Math.floor(quizResults.timeTaken / 60)}:{String(quizResults.timeTaken % 60).padStart(2, '0')}
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-blue-800 mb-2">Feedback</h4>
            <p className="text-blue-700">{quizResults.feedback}</p>
          </div>
          
          <div className="mt-6">
            <h4 className="font-semibold text-gray-800 mb-3">Question Analysis</h4>
            <div className="space-y-3">
              {quizResults.detailedResults.map((result, index) => (
                <div key={index} className="flex items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${result.isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {result.isCorrect ? '✓' : '✗'}
                  </div>
                  <div className="text-gray-800">
                    Question {index + 1}
                    <span className="text-sm text-gray-500 ml-2">
                      ({result.timeTaken} seconds)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-4">
          <button
            onClick={resetQuiz}
            className="px-6 py-3 border rounded-md hover:bg-gray-50"
          >
            Take Another Quiz
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default Quizzes; 