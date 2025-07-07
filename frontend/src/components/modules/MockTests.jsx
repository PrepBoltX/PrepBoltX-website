import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import AnimatedCard from '../common/AnimatedCard';
import ProgressBar from '../common/ProgressBar';
import { getAllMockTests, getMockTestById, generateCustomMockTest, submitMockTestAttempt, getAllQuizzes, getQuizById, getMockTestsBySubject, getSeededMockTestsBySubject } from '../../services/ApiService';

// Constants for standardized tests
const TEST_DURATION = 1800; // 30 minutes in seconds
const QUESTIONS_PER_TEST = 30;
const MARKS_PER_QUESTION = 4;
const TOTAL_MARKS = QUESTIONS_PER_TEST * MARKS_PER_QUESTION; // 120 marks
const TIME_PER_QUESTION = 60; // 60 seconds (1 minute) per question

const MockTests = () => {
  const { state, dispatch } = useApp();
  const [mockTests, setMockTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedMode, setSelectedMode] = useState(null); // 'timed', 'subject', 'full', 'custom'
  const [selectedMockTest, setSelectedMockTest] = useState(null);
  const [activeMockTest, setActiveMockTest] = useState(null);
  const [testQuestions, setTestQuestions] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [testCompleted, setTestCompleted] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState(null);
  const [timerActive, setTimerActive] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [currentScore, setCurrentScore] = useState(0);
  
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  // Initial fetch for mock tests
  useEffect(() => {
    const fetchMockTests = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const tests = await getAllMockTests();
        
        if (tests && tests.length > 0) {
          // Standardize test parameters
          const standardizedTests = tests.map(test => ({
            ...test,
            duration: TEST_DURATION,
            totalQuestions: QUESTIONS_PER_TEST,
            totalMarks: TOTAL_MARKS,
            passingMarks: 40, // Standard 40% passing
            difficulty: 'mixed'
          }));
          
          setMockTests(standardizedTests);
        } else {
          setMockTests([]);
        }
      } catch (err) {
        console.error('Error fetching mock tests:', err);
        setError('Failed to load mock tests. Please try again later.');
        setMockTests([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMockTests();
  }, []);

  // Define calculateCurrentScore with useMemo
  const calculateCurrentScore = useMemo(() => {
    return (answers) => {
      let totalScore = 0;
      let attempted = 0;
      let correct = 0;
      
      testQuestions.forEach((question, index) => {
        const questionId = question._id || index;
        const userAnswer = answers[questionId];
        
        if (userAnswer !== undefined) {
          attempted++;
          
          if (userAnswer === question.correctAnswer) {
            // Award marks for correct answer
            totalScore += MARKS_PER_QUESTION;
            correct++;
          } else {
            // Deduct marks for incorrect answer
            totalScore -= 1; // Standard 1 mark negative marking
          }
        }
      });
      
      const totalPossibleMarks = testQuestions.length * MARKS_PER_QUESTION;
      const percentage = (totalScore / totalPossibleMarks) * 100;
      
      return {
        score: totalScore,
        percentage: Math.max(0, percentage), // Ensure percentage is not negative
        attempted,
        correct,
        total: testQuestions.length
      };
    };
  }, [testQuestions]);

  // Define finishTest with useCallback
  const finishTest = useCallback(async () => {
    // Clear the timer if active
    if (timerRef.current) {
      clearInterval(timerRef.current);
      setTimerActive(false);
    }
    
    try {
      setLoading(true);
      
      // Format answers by section
      const sectionAnswers = {};
      
      // Ensure we're only using the current test questions (limited to 30)
      const currentTestQuestions = testQuestions.slice(0, QUESTIONS_PER_TEST);
      
      currentTestQuestions.forEach((question, index) => {
        const sectionTitle = question.sectionTitle || 'General';
        if (!sectionAnswers[sectionTitle]) {
          sectionAnswers[sectionTitle] = [];
        }
        sectionAnswers[sectionTitle].push(
          selectedAnswers[question._id || index]
        );
      });
      
      let result;
      
      // Calculate results using our standardized function
      const scoreData = calculateCurrentScore(selectedAnswers);
      
      // Group questions by section for the results
      const sectionResults = {};
      currentTestQuestions.forEach((question, index) => {
        const sectionTitle = question.sectionTitle || 'General';
        if (!sectionResults[sectionTitle]) {
          sectionResults[sectionTitle] = [];
        }
        
        const userAnswer = selectedAnswers[question._id || index];
        const isCorrect = userAnswer === question.correctAnswer;
        
        // Calculate score for this question
        let questionScore = 0;
        if (isCorrect) {
          questionScore = MARKS_PER_QUESTION;
        } else if (userAnswer !== undefined) {
          questionScore = -1; // Standard 1 mark negative marking
        }
        
        sectionResults[sectionTitle].push({
          question: question.question,
          userAnswer,
          correctAnswer: question.correctAnswer,
          isCorrect,
          score: questionScore,
          explanation: question.explanation,
          subject: question.subject,
          options: question.options // Include options for review
        });
      });
      
      // Convert sections to array format for consistency
      const resultsArray = Object.entries(sectionResults).map(([sectionTitle, questions]) => ({
        sectionTitle,
        questions
      }));
      
      // Check if this is a default mock test
      if (activeMockTest?._id && activeMockTest._id.startsWith('default-')) {
        result = {
          message: 'Mock test submitted successfully',
          score: scoreData.score,
          percentage: scoreData.percentage,
          results: resultsArray
        };
        
        // Update app context with new test completion
        dispatch({
          type: 'UPDATE_USER_PROGRESS',
          payload: { mockTestCompleted: activeMockTest._id }
        });
      } else {
        // For backend tests, still use the API but update the local result with our calculated data
        const apiResult = await submitMockTestAttempt(
          activeMockTest._id,
          sectionAnswers
        );
        
        // Use our local calculation for consistency
        result = {
          message: apiResult.message || 'Mock test submitted successfully',
          score: scoreData.score,
          percentage: scoreData.percentage,
          results: resultsArray
        };
        
        // Update app context with new test completion
        dispatch({
          type: 'UPDATE_USER_PROGRESS',
          payload: { mockTestCompleted: activeMockTest._id }
        });
      }
      
      setTestResults(result);
      setTestCompleted(true);
      setLoading(false);
    } catch (err) {
      console.error('Error submitting mock test:', err);
      setError('Failed to submit mock test. Please try again later.');
      setLoading(false);
    }
  }, [testQuestions, selectedAnswers, activeMockTest, dispatch, calculateCurrentScore]);

  // Timer effect
  useEffect(() => {
    if (timerActive && remainingTime > 0) {
      // Clear any existing interval first to prevent multiple timers
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Save the current time when the timer starts
      const startTime = Date.now();
      // Save the initial remaining time
      const initialRemainingTime = remainingTime;
      
      // Update timer every second
      timerRef.current = setInterval(() => {
        // Calculate elapsed time in seconds
        const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
        // Calculate new remaining time
        const newRemainingTime = Math.max(0, initialRemainingTime - elapsedSeconds);
        
        setRemainingTime(newRemainingTime);
        
        // If time is up, finish the test
        if (newRemainingTime === 0) {
          clearInterval(timerRef.current);
          finishTest();
        }
      }, 1000);
      
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [timerActive, remainingTime, finishTest]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        setTimerActive(false);
      }
    };
  }, []);

  const selectMode = (mode) => {
    setSelectedMode(mode);
    setSelectedMockTest(null);
  };

  const selectSubject = async (subject) => {
    try {
      setLoading(true);
      setError(null);
      setSelectedSubjectFilter(subject);
      
      // Fetch seeded mock tests for this subject
      const seededTests = await getSeededMockTestsBySubject(subject._id);
      
      if (!seededTests || seededTests.length === 0) {
        setError(`No mock tests found for ${subject.name}`);
        setMockTests([]);
      } else {
        // Filter out custom tests and ensure standard duration for all tests
        const updatedTests = seededTests
          .filter(test => test.testType !== 'custom')
          .map(test => ({
            ...test,
            duration: TEST_DURATION, // 30 minutes (1800 seconds)
            totalQuestions: QUESTIONS_PER_TEST,
            totalMarks: TOTAL_MARKS, // 4 marks per question × 30 questions = 120 marks
            passingMarks: 40, // Standard 40% passing
            difficulty: 'mixed' // Standardize difficulty
          }));
        setMockTests(updatedTests);
      }
    } catch (err) {
      console.error(`Error fetching seeded mock tests for ${subject.name}:`, err);
      setError(`Failed to load mock tests: ${err.message || 'Unknown error'}`);
      setMockTests([]);
    } finally {
      setLoading(false);
    }
  };

  const selectMockTest = (test) => {
    setSelectedMockTest(test);
  };

  const toggleSubjectSelection = (subjectId) => {
    if (selectedSubjects.includes(subjectId)) {
      setSelectedSubjects(selectedSubjects.filter(id => id !== subjectId));
    } else {
      setSelectedSubjects([...selectedSubjects, subjectId]);
    }
  };

  const generateTest = async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      let test;
      
      if (selectedMode === 'custom') {
        if (selectedSubjects.length === 0) {
          setError('Please select at least one subject');
          setLoading(false);
          return;
        }
        
        // Instead of generating, fetch seeded tests for the first selected subject
        const subjectId = selectedSubjects[0]; // For simplicity, use the first subject
        const seededTests = await getSeededMockTestsBySubject(subjectId);
        
        if (!seededTests || seededTests.length === 0) {
          setError(`No seeded mock tests found for the selected subject`);
          setLoading(false);
          return;
        }
        
        // Select a random test from the seeded tests
        const randomTest = seededTests[Math.floor(Math.random() * seededTests.length)];
        test = await getMockTestById(randomTest._id);
        
      } else if (selectedMode === 'subject') {
        // Fetch the selected mock test directly
        if (!selectedMockTest || !selectedMockTest._id) {
          setError('Please select a mock test');
          setLoading(false);
          return;
        }
        
        test = await getMockTestById(selectedMockTest._id);
        
        if (!test) {
          setError('Could not load the selected mock test');
          setLoading(false);
          return;
        }
        
      } else if (selectedMode === 'timed' || selectedMode === 'full') {
        if (!selectedMockTest) {
          setError('Please select a mock test');
          setLoading(false);
          return;
        }
        
        // Get the specific mock test
        test = await getMockTestById(selectedMockTest._id);
      } else {
        setError('Please select a test mode');
        setLoading(false);
        return;
      }
      
      if (!test) {
        setError('Could not load the test');
        setLoading(false);
        return;
      }
      
      // Prepare flat list of questions from all sections
      const allQuestions = [];
      
      test.sections.forEach(section => {
        section.questions.forEach(question => {
          allQuestions.push({
            ...question,
            sectionTitle: section.title,
            marks: MARKS_PER_QUESTION, // Standardized marks per question
            negativeMarks: 1 // Standardized negative marking
          });
        });
      });
      
      // Limit to exactly 30 questions
      let finalQuestions = allQuestions;
      if (allQuestions.length > QUESTIONS_PER_TEST) {
        finalQuestions = shuffleArray(allQuestions).slice(0, QUESTIONS_PER_TEST);
      } else if (allQuestions.length < QUESTIONS_PER_TEST) {
        // If less than 30 questions, duplicate some randomly
        finalQuestions = [...allQuestions];
        while (finalQuestions.length < QUESTIONS_PER_TEST) {
          const randomQuestion = allQuestions[Math.floor(Math.random() * allQuestions.length)];
          finalQuestions.push({...randomQuestion});
        }
      }
      
      // Create standardized test with consistent parameters
      const standardizedTest = {
        ...test,
        duration: TEST_DURATION, // Always 30 minutes
        totalMarks: TOTAL_MARKS, // Always 120 marks (30 questions × 4 marks)
        totalQuestions: QUESTIONS_PER_TEST, // Always 30 questions
        difficulty: 'mixed'
      };
      
      setActiveMockTest(standardizedTest);
      setTestQuestions(finalQuestions);
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setTestCompleted(false);
      setTestResults(null);
      
      // Set up the timer
      setRemainingTime(TEST_DURATION);
      
      // Clear any existing timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Start the timer
      setTimerActive(true);
      
      setLoading(false);
    } catch (err) {
      console.error('Error generating mock test:', err);
      setError(`Failed to generate mock test: ${err.message || 'Unknown error'}`);
      setLoading(false);
    }
  };

  // Fisher-Yates shuffle algorithm for randomizing questions
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const getTestTitle = () => {
    if (!activeMockTest) return '';
    
    if (selectedMode === 'custom') {
      const subjectNames = selectedSubjects.map(id => {
        const subject = state.subjects.find(s => s._id === id);
        return subject ? subject.name : '';
      }).filter(Boolean);
      
      return `Custom Mock Test: ${subjectNames.join(', ')}`;
    }
    
    return activeMockTest.title;
  };

  const handleAnswerSelect = (questionId, answerIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: answerIndex,
    });
  };

  const moveToNextQuestion = () => {
    if (currentQuestionIndex < testQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const moveToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const generateFeedback = (score) => {
    if (score >= 85) {
      return {
        category: 'Excellent',
        color: 'text-purple-600',
        message: 'Outstanding performance! You have a strong understanding of the subject matter.'
      };
    } else if (score >= 70) {
      return {
        category: 'Good',
        color: 'text-green-600',
        message: 'Great job! You have a solid grasp of most concepts.'
      };
    } else if (score >= 50) {
      return {
        category: 'Above Average',
        color: 'text-blue-600',
        message: 'You\'re doing well! Focus on improving the areas you missed.'
      };
    } else {
      return {
        category: 'Average',
        color: 'text-yellow-600',
        message: 'Keep practicing! Review the topics you struggled with and try again.'
      };
    }
  };

  const calculateSubjectPerformance = (questions, answers) => {
    const subjectPerformance = {};
    
    questions.forEach((question, index) => {
      const questionId = question._id || index;
      const userAnswer = answers[questionId];
      const isCorrect = userAnswer === question.correctAnswer;
      
      const subject = question.subject;
      if (!subjectPerformance[subject]) {
        subjectPerformance[subject] = {
          total: 0,
          correct: 0,
          percentage: 0
        };
      }
      
      subjectPerformance[subject].total++;
      if (isCorrect) {
        subjectPerformance[subject].correct++;
      }
    });
    
    // Calculate percentages
    Object.keys(subjectPerformance).forEach(subject => {
      const { total, correct } = subjectPerformance[subject];
      subjectPerformance[subject].percentage = Math.round((correct / total) * 100);
    });
    
    return subjectPerformance;
  };

  const resetTest = () => {
    // Clear the timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      setTimerActive(false);
    }
    
    // Reset all test-related state
    setActiveMockTest(null);
    setTestQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setTestCompleted(false);
    setTestResults(null);
    setRemainingTime(0);
    
    // Allow user to go back to subject selection
    setSelectedMockTest(null);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  // Calculate timer color based on remaining time
  const getTimerColor = (seconds) => {
    if (seconds < 60) return 'text-red-600'; // Last minute: red
    if (seconds < 300) return 'text-yellow-600'; // Last 5 minutes: yellow
    return 'text-green-600'; // More than 5 minutes: green
  };
  
  // Update current score whenever answers change
  useEffect(() => {
    if (testQuestions.length > 0) {
      const score = calculateCurrentScore(selectedAnswers);
      setCurrentScore(score.score);
    }
  }, [selectedAnswers, testQuestions, calculateCurrentScore]);

  if (loading && !activeMockTest) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="spinner"></div>
        <p className="ml-2">Loading mock tests...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <div className="text-red-600 mb-4">{error}</div>
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded-md"
          onClick={() => setError(null)}
        >
          Try Again
        </button>
      </div>
    );
  }

  // Show main section selection if no mode is selected
  if (!selectedMode && !selectedMockTest && !activeMockTest) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Mock Tests</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AnimatedCard
            className="p-6 cursor-pointer hover:shadow-lg transition-all bg-gradient-to-r from-purple-700 to-purple-600 text-white shadow-md rounded-lg"
            onClick={() => selectMode('subject')}
          >
            <h2 className="text-2xl font-bold mb-2">Subject-wise Tests</h2>
            <p className="mb-8">Focus on one subject at a time with specialized mock tests.</p>
            <p>One test per subject</p>
          </AnimatedCard>
          
          <AnimatedCard
            className="p-6 cursor-pointer hover:shadow-lg transition-all bg-gradient-to-r from-orange-700 to-orange-600 text-white shadow-md rounded-lg"
            onClick={() => selectMode('full')}
          >
            <h2 className="text-2xl font-bold mb-2">Full SDE Mocks</h2>
            <p className="mb-8">Comprehensive tests covering all subjects for complete preparation.</p>
            <p>Total Mock Tests: <span className="font-semibold">3</span></p>
          </AnimatedCard>
          
          <AnimatedCard
            className="p-6 cursor-pointer hover:shadow-lg transition-all bg-gradient-to-r from-green-700 to-green-600 text-white shadow-md rounded-lg"
            onClick={() => selectMode('custom')}
          >
            <h2 className="text-2xl font-bold mb-2">Custom Test</h2>
            <p className="mb-8">Create your own test by selecting the subjects you want to practice.</p>
            <p>Personalized for your needs</p>
          </AnimatedCard>
        </div>
      </div>
    );
  }

  // Show subject-wise test selection
  if (selectedMode === 'subject' && !selectedMockTest && !activeMockTest && !selectedSubjectFilter) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Select a Subject</h1>
          <button
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            onClick={() => setSelectedMode(null)}
          >
            Back
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {state.subjects && state.subjects.map(subject => (
            <AnimatedCard
              key={subject._id}
              className="p-6 cursor-pointer hover:shadow-lg transition-all bg-white rounded-lg shadow"
              onClick={() => selectSubject(subject)}
            >
              <h2 className="text-2xl font-bold mb-2 text-gray-800">{subject.name}</h2>
              <p className="mb-8 text-gray-700">{subject.description || `Learn all about ${subject.name} concepts and prepare for interviews.`}</p>
              <p className="text-gray-800 font-medium">1 Mock Test Available</p>
            </AnimatedCard>
          ))}
        </div>
      </div>
    );
  }
  
  // Show list of seeded mock tests for selected subject
  if (selectedMode === 'subject' && selectedSubjectFilter && !selectedMockTest && !activeMockTest) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            {selectedSubjectFilter.name} Mock Test
          </h1>
          <button
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            onClick={() => {
              setSelectedSubjectFilter(null);
              setMockTests([]);
            }}
          >
            Back to Subjects
          </button>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="spinner"></div>
            <p className="ml-2">Loading mock test...</p>
          </div>
        ) : error ? (
          <div className="text-center p-4">
            <div className="text-red-600 mb-4">{error}</div>
            <button 
              className="px-4 py-2 bg-blue-500 text-white rounded-md"
              onClick={() => setError(null)}
            >
              Try Again
            </button>
          </div>
        ) : mockTests.length === 0 ? (
          <div className="text-center p-4">
            <p className="text-gray-700 mb-4">No mock tests found for this subject.</p>
            <button 
              className="px-4 py-2 bg-blue-500 text-white rounded-md"
              onClick={() => selectSubject(selectedSubjectFilter)}
            >
              Refresh
            </button>
          </div>
        ) : (
          <div className="flex flex-col space-y-6 max-w-4xl mx-auto">
            {/* Show only the first non-custom mock test */}
            {mockTests.filter(test => test.testType !== 'custom').slice(0, 1).map(test => (
              <AnimatedCard
                key={test._id}
                className="p-6 cursor-pointer hover:shadow-lg transition-all shadow-md rounded-lg bg-gradient-to-r from-gray-700 to-gray-600 text-white"
                onClick={() => selectMockTest(test)}
              >
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-white">{test.title}</h2>
                  <span className="bg-white text-gray-800 px-3 py-1 rounded-md text-sm font-medium">
                    Mixed
                  </span>
                </div>
                <p className="mb-8 text-white text-lg">{test.description}</p>
                <div className="grid grid-cols-2 gap-6 text-base">
                  <div>
                    <p className="text-gray-200 font-medium mb-1">Duration:</p>
                    <p className="font-semibold text-white">{Math.floor(test.duration / 60)} mins</p>
                  </div>
                  <div>
                    <p className="text-gray-200 font-medium mb-1">Total Marks:</p>
                    <p className="font-semibold text-white">120</p>
                  </div>
                  <div>
                    <p className="text-gray-200 font-medium mb-1">Questions:</p>
                    <p className="font-semibold text-white">{QUESTIONS_PER_TEST}</p>
                  </div>
                  <div>
                    <p className="text-gray-200 font-medium mb-1">Difficulty:</p>
                    <p className="font-semibold text-white capitalize">{test.difficulty}</p>
                  </div>
                </div>
              </AnimatedCard>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Show mock test details when selected but not yet started
  if (selectedMode === 'subject' && selectedMockTest && !activeMockTest) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            {selectedMockTest.title}
          </h1>
          <button
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            onClick={() => {
              setSelectedMockTest(null);
            }}
          >
            Back to Subjects
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <div className="mb-6">
            <h2 className="text-2xl font-medium mb-4 text-gray-800">Test Description</h2>
            <p className="text-lg text-gray-700">{selectedMockTest.description}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-md">
              <div className="font-medium mb-1 text-gray-700">Duration</div>
              <div className="text-xl text-gray-800">{Math.floor(selectedMockTest.duration / 60)} mins</div>
            </div>
            
            <div className="p-4 bg-green-50 rounded-md">
              <div className="font-medium mb-1 text-gray-700">Total Marks</div>
              <div className="text-xl text-gray-800">{selectedMockTest.totalMarks}</div>
            </div>
            
            <div className="p-4 bg-amber-50 rounded-md">
              <div className="font-medium mb-1 text-gray-700">Difficulty</div>
              <div className="text-xl capitalize text-gray-800">{selectedMockTest.difficulty}</div>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-md">
              <div className="font-medium mb-1 text-gray-700">Questions</div>
              <div className="text-xl text-gray-800">{selectedMockTest.totalQuestions || QUESTIONS_PER_TEST}</div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-xl font-medium mb-4 text-gray-800">Instructions</h3>
            <ul className="space-y-3 text-gray-700 bg-gray-50 p-4 rounded-md">
              <li className="flex items-start">
                <span className="mr-2 text-blue-600">•</span> 
                <span>Each question carries {MARKS_PER_QUESTION} marks</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-blue-600">•</span> 
                <span>There is negative marking of 1 mark for wrong answers</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-blue-600">•</span> 
                <span>The test will automatically submit when time expires</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-blue-600">•</span> 
                <span>Do not refresh the page during the test</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-blue-600">•</span> 
                <span>You can review and change your answers before submission</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 flex justify-center">
          <button
            className="px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700"
            onClick={generateTest}
          >
            Start Test
          </button>
        </div>
      </div>
    );
  }

  // Show custom test creation UI
  if (selectedMode === 'custom' && !activeMockTest && !selectedMockTest) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Create Custom Test</h1>
          <button 
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            onClick={() => setSelectedMode(null)}
          >
            Back
          </button>
        </div>
        
        <h2 className="text-xl font-medium mb-4 text-gray-700">Select Subjects (at least one)</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {state.subjects.map((subject) => (
            <div 
              key={subject._id}
              className={`p-4 rounded-md border cursor-pointer transition-all ${
                selectedSubjects.includes(subject._id)
                  ? 'border-green-600 bg-green-50 text-gray-800'
                  : 'border-gray-300 hover:border-green-400 text-gray-700'
              }`}
              onClick={() => toggleSubjectSelection(subject._id)}
            >
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={selectedSubjects.includes(subject._id)}
                  onChange={() => {}}
                  className="mr-3 h-4 w-4 text-green-600"
                />
                <span>{subject.name}</span>
              </div>
            </div>
          ))}
        </div>
        
        <button 
          className={`px-6 py-3 rounded-md font-medium ${
            selectedSubjects.length > 0 
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          onClick={generateTest}
          disabled={selectedSubjects.length === 0}
        >
          Generate Test
        </button>
      </div>
    );
  }

  // Show test selection for Full SDE Mocks mode
  if (selectedMode === 'full' && !selectedMockTest && !activeMockTest) {
    const fullMockTests = mockTests.filter(test => test.testType === 'full');
    
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Full SDE Mocks</h1>
          <button
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            onClick={() => setSelectedMode(null)}
          >
            Back
          </button>
        </div>
        
        {fullMockTests.length === 0 ? (
          <p className="text-gray-700">No full mock tests available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fullMockTests.map((test) => (
              <AnimatedCard
                key={test._id}
                className="p-6 cursor-pointer hover:shadow-lg transition-all bg-white border border-gray-200"
                onClick={() => selectMockTest(test)}
              >
                <h3 className="text-xl font-medium text-gray-800">{test.title}</h3>
                <p className="text-gray-600 mt-2">{test.description}</p>
                <div className="mt-4">
                  <div className="flex items-center mb-2">
                    <span className="mr-2 text-gray-700">Duration:</span>
                    <span className="font-semibold text-gray-800">{formatTime(test.duration)}</span>
                  </div>
                  <div className="flex items-center mb-2">
                    <span className="mr-2 text-gray-700">Total Marks:</span>
                    <span className="font-semibold text-gray-800">{test.totalMarks}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2 text-gray-700">Difficulty:</span>
                    <span className="font-semibold capitalize text-gray-800">{test.difficulty || 'Medium'}</span>
                  </div>
                </div>
              </AnimatedCard>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Show test details before starting
  if (selectedMockTest && !activeMockTest) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">{selectedMockTest.title}</h1>
          <button 
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            onClick={() => setSelectedMockTest(null)}
          >
            Back
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <p className="text-lg mb-4 text-gray-700">{selectedMockTest.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-md">
              <div className="font-medium mb-1 text-gray-700">Duration</div>
              <div className="text-xl text-gray-800">{formatTime(selectedMockTest.duration)}</div>
            </div>
            
            <div className="p-4 bg-green-50 rounded-md">
              <div className="font-medium mb-1 text-gray-700">Total Marks</div>
              <div className="text-xl text-gray-800">{selectedMockTest.totalMarks}</div>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-md">
              <div className="font-medium mb-1 text-gray-700">Difficulty</div>
              <div className="text-xl capitalize text-gray-800">{selectedMockTest.difficulty}</div>
            </div>
            
            <div className="p-4 bg-amber-50 rounded-md">
              <div className="font-medium mb-1 text-gray-700">Questions</div>
              <div className="text-xl text-gray-800">{selectedMockTest.totalQuestions || QUESTIONS_PER_TEST}</div>
            </div>
          </div>
          
        </div>
        
        <div className="mt-8 flex justify-center">
          <button
            className="px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700"
            onClick={generateTest}
          >
            Start Test
          </button>
        </div>
      </div>
    );
  }

  // Show test results if completed
  if (testCompleted && testResults) {
    const score = testResults.percentage;
    const feedbackData = generateFeedback(score);
    
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Test Results</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <div className="mb-6">
            <h2 className="text-2xl font-medium mb-2 text-gray-800">Your Score</h2>
            <div className="flex items-center justify-center">
              <div className="w-48 h-48 rounded-full bg-gray-100 flex flex-col items-center justify-center border-8 border-blue-500">
                <span className="text-4xl font-bold text-gray-800">{Math.round(score)}%</span>
                <span className="text-gray-600 mt-2">
                  {testResults.score} / {TOTAL_MARKS} marks
                </span>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <div className={`text-lg font-bold ${feedbackData.color}`}>
                {feedbackData.category}
              </div>
              <p className="mt-2 text-gray-700">
                {feedbackData.message}
              </p>
            </div>
          </div>
          
          <div className="mt-8">
            <h3 className="text-xl font-medium mb-4 text-gray-800">Question Breakdown</h3>
            {testResults.results.map((section, sectionIndex) => (
              <div key={sectionIndex} className="mb-6">
                <h4 className="font-medium text-lg mb-3 text-gray-800">{section.sectionTitle}</h4>
                
                {section.questions.map((result, questionIndex) => {
                  const questionNumber = sectionIndex * section.questions.length + questionIndex + 1;
                  const isCorrect = result.isCorrect;
                  
                  return (
                    <div 
                      key={questionIndex} 
                      className={`mb-4 p-4 rounded-md ${
                        isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                      }`}
                    >
                      <p className="font-medium text-gray-800">{questionNumber}. {result.question}</p>
                      
                      <div className="mt-3 ml-1 space-y-1">
                        {result.options && result.options.map((option, optionIndex) => (
                          <div key={optionIndex} className={`flex items-center p-2 rounded ${
                            result.correctAnswer === optionIndex ? 'bg-green-100' :
                            result.userAnswer === optionIndex ? (result.correctAnswer !== optionIndex ? 'bg-red-100' : 'bg-green-100') : 'bg-gray-50 border border-gray-200'
                          }`}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                              result.correctAnswer === optionIndex ? 'bg-green-500 text-white' :
                              result.userAnswer === optionIndex ? (result.correctAnswer !== optionIndex ? 'bg-red-500 text-white' : 'bg-green-500 text-white') : 'bg-gray-300 text-gray-700'
                            }`}>
                              {String.fromCharCode(65 + optionIndex)}
                            </div>
                            <span className={`${
                              result.correctAnswer === optionIndex ? 'text-green-800 font-medium' :
                              result.userAnswer === optionIndex ? (result.correctAnswer !== optionIndex ? 'text-red-800' : 'text-green-800 font-medium') : 'text-gray-700'
                            }`}>{option}</span>
                            
                            {result.correctAnswer === optionIndex && (
                              <span className="ml-2 text-green-700 text-sm font-medium">(Correct Answer)</span>
                            )}
                            {result.userAnswer === optionIndex && result.userAnswer !== result.correctAnswer && (
                              <span className="ml-2 text-red-700 text-sm font-medium">(Your Answer)</span>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {result.explanation && (
                        <p className="mt-3 text-gray-700 bg-gray-50 p-2 rounded">
                          <span className="font-medium">Explanation:</span> {result.explanation}
                        </p>
                      )}
                      
                      <div className="mt-2 text-sm">
                        <span className={`${result.score > 0 ? 'text-green-600' : result.score < 0 ? 'text-red-600' : 'text-gray-600'} font-medium`}>
                          {result.score > 0 ? `+${result.score}` : result.score} marks
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          
          <div className="mt-8 flex justify-center">
            <button
              className="px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700"
              onClick={resetTest}
            >
              Return to Mock Tests
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show active test
  const currentQuestion = testQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / testQuestions.length) * 100;
  const questionId = currentQuestion?._id || currentQuestionIndex;
  
  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{getTestTitle()}</h1>
        {remainingTime > 0 && (
          <div className="flex items-center">
            <div className="mr-2 text-gray-700">Time Remaining:</div>
            <div className={`text-xl font-bold ${getTimerColor(remainingTime)}`}>
              {formatTime(remainingTime)}
            </div>
          </div>
        )}
      </div>
      
      <div className="mb-6">
        <ProgressBar progress={progress} />
        <div className="mt-2 text-sm text-gray-700">
          Question {currentQuestionIndex + 1} of {testQuestions.length}
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        {currentQuestion && (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-medium text-gray-800 mb-2">{currentQuestion.question}</h2>
            </div>
            
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-md border cursor-pointer transition-all ${
                    selectedAnswers[questionId] === index 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => handleAnswerSelect(questionId, index)}
                >
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center mr-3 ${
                      selectedAnswers[questionId] === index
                        ? 'border-blue-500 bg-blue-500 text-white'
                        : 'border-gray-400 text-gray-800'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="text-gray-800">{option}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 text-sm text-gray-700">
              <div>Marks: {currentQuestion.marks || MARKS_PER_QUESTION}</div>
              {currentQuestion.negativeMarks > 0 && (
                <div className="text-red-600">
                  Negative marks: {currentQuestion.negativeMarks}
                </div>
              )}
            </div>
          </>
        )}
      </div>
      
      <div className="flex justify-between mb-6">
        <button
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50 hover:bg-gray-300"
          onClick={moveToPreviousQuestion}
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </button>
        
        {currentQuestionIndex === testQuestions.length - 1 ? (
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={finishTest}
          >
            Finish Test
          </button>
        ) : (
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={moveToNextQuestion}
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default MockTests; 