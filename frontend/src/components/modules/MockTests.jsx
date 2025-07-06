import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../contexts/AppContext';
import AnimatedCard from '../common/AnimatedCard';
import ProgressBar from '../common/ProgressBar';
import { getAllMockTests, getMockTestById, generateCustomMockTest, submitMockTestAttempt } from '../../services/ApiService';

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
  
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  // Fetch all mock tests on component mount
  useEffect(() => {
    const fetchMockTests = async () => {
      try {
        setLoading(true);
        setError(null); // Clear any previous errors
        console.log('Fetching mock tests...');
        const data = await getAllMockTests();
        console.log('Mock tests data:', data);
        
        // If no mock tests are available, create some default ones
        if (!data || data.length === 0) {
          console.log('No mock tests available, creating default ones');
          setMockTests([
            {
              _id: 'default-timed',
              title: 'Timed Mock Test',
              description: 'A timed mock test with questions from various subjects',
              testType: 'timed',
              duration: 1800, // 30 minutes
              totalMarks: 100
            },
            {
              _id: 'default-subject',
              title: 'Subject-wise Mock Test',
              description: 'A subject-focused mock test with questions from a single subject',
              testType: 'subject',
              duration: 1800, // 30 minutes
              totalMarks: 100
            },
            {
              _id: 'default-full',
              title: 'Full SDE Mock Test',
              description: 'A comprehensive mock test covering all subjects',
              testType: 'full',
              duration: 3600, // 60 minutes
              totalMarks: 200
            }
          ]);
        } else {
          setMockTests(data);
        }
      } catch (err) {
        console.error('Error fetching mock tests:', err);
        setError(`Failed to load mock tests: ${err.message || 'Unknown error'}`);
        
        // Set default mock tests on error
        setMockTests([
          {
            _id: 'default-timed',
            title: 'Timed Mock Test',
            description: 'A timed mock test with questions from various subjects',
            testType: 'timed',
            duration: 1800, // 30 minutes
            totalMarks: 100
          },
          {
            _id: 'default-subject',
            title: 'Subject-wise Mock Test',
            description: 'A subject-focused mock test with questions from a single subject',
            testType: 'subject',
            duration: 1800, // 30 minutes
            totalMarks: 100
          },
          {
            _id: 'default-full',
            title: 'Full SDE Mock Test',
            description: 'A comprehensive mock test covering all subjects',
            testType: 'full',
            duration: 3600, // 60 minutes
            totalMarks: 200
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchMockTests();
  }, []);
  
  // Timer effect
  useEffect(() => {
    if (activeMockTest && remainingTime > 0) {
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const remaining = Math.max(0, remainingTime - elapsed);
        
        setRemainingTime(remaining);
        
        if (remaining === 0) {
          clearInterval(timerRef.current);
          finishTest();
        }
      }, 1000);
      
      return () => clearInterval(timerRef.current);
    }
  }, [activeMockTest, remainingTime]);
  
  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const selectMode = (mode) => {
    setSelectedMode(mode);
    setSelectedMockTest(null);
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
        
        console.log('Generating custom test with subjects:', selectedSubjects);
        // Generate custom test with selected subjects
        const response = await generateCustomMockTest(selectedSubjects, 20); // Limit to 20 questions
        console.log('Custom test response:', response);
        test = response.mockTest;
      } else {
        // Check if this is a default mock test
        if (selectedMockTest._id.startsWith('default-')) {
          console.log('Using default mock test:', selectedMockTest);
          // Create a mock test structure with sample questions
          test = {
            ...selectedMockTest,
            sections: [
              {
                title: 'Sample Section',
                questions: Array(10).fill(0).map((_, i) => ({
                  _id: `sample-q-${i}`,
                  question: `Sample question ${i + 1}?`,
                  options: [
                    `Option A for question ${i + 1}`,
                    `Option B for question ${i + 1}`,
                    `Option C for question ${i + 1}`,
                    `Option D for question ${i + 1}`
                  ],
                  correctAnswer: Math.floor(Math.random() * 4),
                  marks: 1,
                  negativeMarks: 0.25,
                  explanation: `This is the explanation for question ${i + 1}`,
                  subject: 'Sample Subject',
                  difficulty: 'medium'
                }))
              }
            ]
          };
        } else {
          // Fetch existing mock test
          console.log('Fetching mock test with ID:', selectedMockTest._id);
          test = await getMockTestById(selectedMockTest._id);
          console.log('Mock test data:', test);
        }
        
        // Limit each section to a total of 20 questions
        const limitedSections = [];
        let totalQuestions = 0;
        const maxQuestions = 20;
        
        for (const section of test.sections) {
          if (totalQuestions >= maxQuestions) break;
          
          const sectionQuestions = section.questions.slice(0, Math.min(
            section.questions.length, 
            maxQuestions - totalQuestions
          ));
          
          limitedSections.push({
            ...section,
            questions: sectionQuestions,
            questionsCount: sectionQuestions.length
          });
          
          totalQuestions += sectionQuestions.length;
        }
        
        test.sections = limitedSections;
      }
      
      // Prepare flat list of questions from all sections
      const allQuestions = [];
      
      test.sections.forEach(section => {
        section.questions.forEach(question => {
          allQuestions.push({
            ...question,
            sectionTitle: section.title
          });
        });
      });
      
      setActiveMockTest(test);
      setTestQuestions(allQuestions);
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setTestCompleted(false);
      setTestResults(null);
      
      // Set up the timer if test has duration
      if (test.duration) {
        setRemainingTime(test.duration);
        startTimeRef.current = Date.now();
      }
      
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

  const finishTest = async () => {
    // Clear the timer if active
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    try {
      setLoading(true);
      
      // Format answers by section
      const sectionAnswers = {};
      
      testQuestions.forEach((question, index) => {
        const sectionTitle = question.sectionTitle;
        if (!sectionAnswers[sectionTitle]) {
          sectionAnswers[sectionTitle] = [];
        }
        sectionAnswers[sectionTitle].push(
          selectedAnswers[question._id || index]
        );
      });
      
      let result;
      
      // Check if this is a default mock test
      if (activeMockTest._id && activeMockTest._id.startsWith('default-')) {
        console.log('Calculating results for default mock test');
        // Calculate results locally for default mock tests
        const totalQuestions = testQuestions.length;
        let correctAnswers = 0;
        
        testQuestions.forEach((question, index) => {
          const userAnswer = selectedAnswers[question._id || index];
          if (userAnswer === question.correctAnswer) {
            correctAnswers++;
          }
        });
        
        const score = correctAnswers;
        const percentage = (correctAnswers / totalQuestions) * 100;
        
        result = {
          message: 'Mock test submitted successfully',
          score,
          percentage,
          results: [
            {
              sectionTitle: 'Sample Section',
              questions: testQuestions.map((question, index) => {
                const userAnswer = selectedAnswers[question._id || index];
                const isCorrect = userAnswer === question.correctAnswer;
                
                return {
                  question: question.question,
                  userAnswer,
                  correctAnswer: question.correctAnswer,
                  isCorrect,
                  score: isCorrect ? question.marks : 0,
                  explanation: question.explanation
                };
              })
            }
          ]
        };
        
        // Update app context with new test completion
        dispatch({
          type: 'UPDATE_USER_PROGRESS',
          payload: { mockTestCompleted: activeMockTest._id }
        });
      } else {
        // Submit answers to the backend for real mock tests
        result = await submitMockTestAttempt(
          activeMockTest._id,
          sectionAnswers
        );
        
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
  };

  const generateFeedback = (score) => {
    if (score >= 90) {
      return "Excellent! You have mastered this subject. Ready for the placement interviews!";
    } else if (score >= 75) {
      return "Great job! You have a strong understanding of the subject. Review a few weak areas.";
    } else if (score >= 60) {
      return "Good effort! You're on the right track, but need to strengthen your knowledge in some areas.";
    } else if (score >= 40) {
      return "You've made a start, but need more practice. Focus on the topics you missed.";
    } else {
      return "You need to review this subject thoroughly. Don't worry, with practice you'll improve!";
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
    setActiveMockTest(null);
    setSelectedMockTest(null);
    setTestQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setTestCompleted(false);
    setTestResults(null);
    setRemainingTime(0);
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    return hours > 0
      ? `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`
      : `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
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

  // Show mode selection if no mode is selected
  if (!selectedMode) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-8">Mock Tests</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatedCard
            className="p-6 cursor-pointer hover:shadow-lg transition-all bg-blue-500 text-white"
            onClick={() => selectMode('timed')}
          >
            <h3 className="text-xl font-medium mb-3">Timed Tests</h3>
            <p>Complete tests with fixed time limits to simulate exam conditions.</p>
          </AnimatedCard>
          
          <AnimatedCard
            className="p-6 cursor-pointer hover:shadow-lg transition-all bg-purple-500 text-white"
            onClick={() => selectMode('subject')}
          >
            <h3 className="text-xl font-medium mb-3">Subject-wise Tests</h3>
            <p>Focus on one subject at a time with specialized tests.</p>
          </AnimatedCard>
          
          <AnimatedCard
            className="p-6 cursor-pointer hover:shadow-lg transition-all bg-orange-500 text-white"
            onClick={() => selectMode('full')}
          >
            <h3 className="text-xl font-medium mb-3">Full SDE Mocks</h3>
            <p>Comprehensive tests covering all subjects for complete preparation.</p>
          </AnimatedCard>
          
            <AnimatedCard
            className="p-6 cursor-pointer hover:shadow-lg transition-all bg-green-500 text-white"
            onClick={() => selectMode('custom')}
          >
            <h3 className="text-xl font-medium mb-3">Custom Tests</h3>
            <p>Create your own test by selecting the subjects you want to practice.</p>
            </AnimatedCard>
        </div>
      </div>
    );
  }

  // Show subject selection for custom tests
  if (selectedMode === 'custom' && !activeMockTest) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Create Custom Test</h1>
        <button 
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md"
            onClick={() => setSelectedMode(null)}
        >
            Back
        </button>
        </div>
        
        <h2 className="text-xl font-medium mb-4">Select Subjects (at least one)</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {state.subjects.map((subject) => (
            <div 
              key={subject._id}
              className={`p-4 rounded-md border cursor-pointer transition-all ${
                selectedSubjects.includes(subject._id)
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-green-300'
              }`}
              onClick={() => toggleSubjectSelection(subject._id)}
                >
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                  checked={selectedSubjects.includes(subject._id)}
                  onChange={() => {}}
                  className="mr-3 h-4 w-4 text-green-500"
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

  // Show test selection for other modes
  if (!selectedMockTest && !activeMockTest) {
    const filteredTests = mockTests.filter(test => {
      if (selectedMode === 'timed') return test.testType === 'timed';
      if (selectedMode === 'subject') return test.testType === 'subject';
      if (selectedMode === 'full') return test.testType === 'full';
      return false;
    });
    
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">
            {selectedMode === 'timed' && 'Timed Tests'}
            {selectedMode === 'subject' && 'Subject-wise Tests'}
            {selectedMode === 'full' && 'Full SDE Mocks'}
          </h1>
          <button
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md"
            onClick={() => setSelectedMode(null)}
          >
            Back
          </button>
        </div>
        
        {filteredTests.length === 0 ? (
          <p>No tests available for this category.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTests.map((test) => (
              <AnimatedCard
                key={test._id}
                className="p-6 cursor-pointer hover:shadow-lg transition-all bg-white border border-gray-200"
                onClick={() => selectMockTest(test)}
              >
                <h3 className="text-xl font-medium">{test.title}</h3>
                <p className="text-gray-600 mt-2">{test.description}</p>
                <div className="mt-4">
                  <div className="flex items-center mb-2">
                    <span className="mr-2">Duration:</span>
                    <span className="font-semibold">{formatTime(test.duration)}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2">Total Marks:</span>
                    <span className="font-semibold">{test.totalMarks}</span>
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
          <h1 className="text-3xl font-bold">{selectedMockTest.title}</h1>
          <button 
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md"
            onClick={() => setSelectedMockTest(null)}
          >
            Back
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <p className="text-lg mb-4">{selectedMockTest.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-md">
              <div className="font-medium mb-1">Duration</div>
              <div className="text-xl">{formatTime(selectedMockTest.duration)}</div>
            </div>
            
            <div className="p-4 bg-green-50 rounded-md">
              <div className="font-medium mb-1">Total Marks</div>
              <div className="text-xl">{selectedMockTest.totalMarks}</div>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-md">
              <div className="font-medium mb-1">Passing Score</div>
              <div className="text-xl">{selectedMockTest.passingMarks}%</div>
          </div>
            
            <div className="p-4 bg-amber-50 rounded-md">
              <div className="font-medium mb-1">Difficulty</div>
              <div className="text-xl capitalize">{selectedMockTest.difficulty}</div>
        </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">Test Sections</h3>
            <div className="space-y-3">
              {selectedMockTest.sections?.map((section, index) => (
                <div key={index} className="p-3 border border-gray-200 rounded-md">
                  <div className="font-medium">{section.title}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Questions: {section.questionsCount} · 
                    Marks: {section.totalMarks}
                </div>
              </div>
            ))}
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
      </div>
    );
  }

  // Show test results if completed
  if (testCompleted && testResults) {
    const score = testResults.percentage;
    const feedback = generateFeedback(score);
    const subjectPerformance = calculateSubjectPerformance(testQuestions, selectedAnswers);
    
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Test Results</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <div className="mb-6">
            <h2 className="text-2xl font-medium mb-2">Your Score</h2>
            <div className="flex items-center justify-center">
              <div className={`w-48 h-48 rounded-full bg-gray-100 flex flex-col items-center justify-center border-8 ${
                score >= activeMockTest.passingMarks ? 'border-green-500' : 'border-red-500'
              }`}>
                <span className="text-4xl font-bold">{Math.round(score)}%</span>
                <span className="text-gray-500 mt-2">
                  {testResults.score} / {activeMockTest.totalMarks} marks
                </span>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <div className={`text-lg font-medium ${
                score >= activeMockTest.passingMarks ? 'text-green-600' : 'text-red-600'
              }`}>
                {score >= activeMockTest.passingMarks ? 'PASSED' : 'FAILED'}
              </div>
              <p className="mt-2 text-gray-700">
                {feedback}
              </p>
            </div>
          </div>
          
          <div className="mt-8">
            <h3 className="text-xl font-medium mb-4">Section Performance</h3>
            {testResults.results.map((section, index) => (
              <div key={index} className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">{section.sectionTitle}</h4>
                  <span className="text-sm bg-blue-100 text-blue-800 py-1 px-2 rounded">
                    Score: {Math.round((section.questions.filter(q => q.isCorrect).length / section.questions.length) * 100)}%
                  </span>
          </div>
          
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                  <div 
                    className="h-full bg-blue-600" 
                    style={{ width: `${(section.questions.filter(q => q.isCorrect).length / section.questions.length) * 100}%` }}
                  ></div>
                  </div>
                
                <div className="text-xs text-gray-500 mb-4">
                  {section.questions.filter(q => q.isCorrect).length} correct out of {section.questions.length} questions
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8">
            <h3 className="text-xl font-medium mb-4">Subject Performance</h3>
            {Object.entries(subjectPerformance).map(([subject, data], index) => (
              <div key={index} className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">{subject}</h4>
                  <span className="text-sm bg-blue-100 text-blue-800 py-1 px-2 rounded">
                    {data.percentage}%
                  </span>
                </div>
                
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                  <div 
                    className={`h-full ${
                      data.percentage >= 80 ? 'bg-green-600' :
                      data.percentage >= 60 ? 'bg-blue-600' :
                      data.percentage >= 40 ? 'bg-yellow-600' : 'bg-red-600'
                    }`}
                    style={{ width: `${data.percentage}%` }}
                  ></div>
                  </div>
                
                <div className="text-xs text-gray-500">
                  {data.correct} correct out of {data.total} questions
                </div>
              </div>
            ))}
        </div>
        
          <div className="mt-8 flex justify-center">
          <button
              className="px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700"
            onClick={resetTest}
          >
              Back to Mock Tests
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
        <h1 className="text-2xl font-bold">{getTestTitle()}</h1>
        {remainingTime > 0 && (
          <div className="text-xl font-medium">
            Time: <span className={remainingTime < 300 ? 'text-red-600' : ''}>
              {formatTime(remainingTime)}
            </span>
          </div>
        )}
      </div>
      
      <div className="mb-6">
        <ProgressBar progress={progress} />
        <div className="mt-2 text-sm text-gray-600 flex justify-between">
          <div>
            Question {currentQuestionIndex + 1} of {testQuestions.length}
          </div>
          <div>
            Section: {currentQuestion?.sectionTitle}
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        {currentQuestion && (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-medium mb-2">{currentQuestion.question}</h2>
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
                        : 'border-gray-400'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span>{option}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 text-sm text-gray-600">
              <div>Marks: {currentQuestion.marks || 1}</div>
              {currentQuestion.negativeMarks > 0 && (
                <div className="text-red-600">
                  Negative marks: {currentQuestion.negativeMarks}
                </div>
              )}
            </div>
          </>
        )}
      </div>
      
      <div className="flex justify-between">
        <button
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50"
          onClick={moveToPreviousQuestion}
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </button>
        
        {currentQuestionIndex === testQuestions.length - 1 ? (
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
            onClick={finishTest}
          >
            Finish Test
          </button>
        ) : (
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
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