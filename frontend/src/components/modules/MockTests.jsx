import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import AnimatedCard from '../common/AnimatedCard';
import ProgressBar from '../common/ProgressBar';
import { getAllMockTests, getMockTestById, generateCustomMockTest, submitMockTestAttempt, getAllQuizzes, getQuizById, getMockTestsBySubject, getSeededMockTestsBySubject, generateFullSDEMockTest } from '../../services/ApiService';

// Constants for standardized tests
const TEST_DURATION = 1800; // 30 minutes in seconds
const QUESTIONS_PER_TEST = 30;
const MARKS_PER_QUESTION = 4; // Always 4 marks per question
const NEGATIVE_MARKS = 1; // Always -1 for negative marking
const TOTAL_MARKS = QUESTIONS_PER_TEST * MARKS_PER_QUESTION; // 120 marks
const TIME_PER_QUESTION = 60; // 60 seconds (1 minute) per question

// Constants for Full SDE Mock Tests
const FULL_SDE_QUESTIONS = 50;
const FULL_SDE_MARKS_PER_QUESTION = 2; // 2 marks per question for Full SDE Tests
const FULL_SDE_NEGATIVE_MARKS = 1; // -1 for incorrect answers in Full SDE Tests
const FULL_SDE_TOTAL_MARKS = FULL_SDE_QUESTIONS * FULL_SDE_MARKS_PER_QUESTION; // 50 questions × 2 marks = 100 marks
const FULL_SDE_TEST_DURATION = 3000; // 50 minutes in seconds (60 seconds per question)

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

  // Fisher-Yates shuffle algorithm for randomizing questions
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Define generateFullSDETest function before it's used in useEffect
  const generateFullSDETest = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Generate a full SDE mock test
      const response = await generateFullSDEMockTest();
      
      if (!response || !response.mockTest) {
        setError('Failed to generate Full SDE mock test');
        setLoading(false);
        return;
      }
      
      const test = response.mockTest;
      
      // Prepare flat list of questions from all sections
      const allQuestions = [];
      
      test.sections.forEach((section, sectionIndex) => {
        if (!section.questions) return;
        
        section.questions.forEach(question => {
          allQuestions.push({
            ...question,
            sectionTitle: section.title,
            sectionIndex: sectionIndex,
            subjectId: section.subjectRef,
            subjectName: section.title,
            marks: FULL_SDE_MARKS_PER_QUESTION, // 2 marks per question
            negativeMarks: FULL_SDE_NEGATIVE_MARKS // -1 for incorrect
          });
        });
      });
      
      if (allQuestions.length === 0) {
        setError('No questions found in the generated test');
        setLoading(false);
        return;
      }
      
      // Shuffle all questions for randomized order
      const shuffledQuestions = shuffleArray(allQuestions);
      
      // Standardize the test properties
      const standardizedTest = {
        ...test,
        duration: FULL_SDE_TEST_DURATION,
        totalMarks: FULL_SDE_TOTAL_MARKS,
        totalQuestions: FULL_SDE_QUESTIONS,
        difficulty: 'mixed'
      };
      
      setActiveMockTest(standardizedTest);
      setTestQuestions(shuffledQuestions);
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setTestCompleted(false);
      setTestResults(null);
      
      // Set timer with full SDE duration
      setRemainingTime(FULL_SDE_TEST_DURATION);
      
      // Clear existing timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Start the timer
      startTimeRef.current = Date.now();
      setTimerActive(true);
      
      setLoading(false);
    } catch (err) {
      console.error('Error generating Full SDE mock test:', err);
      setError(`Failed to generate Full SDE mock test: ${err.message || 'Unknown error'}`);
      setLoading(false);
    }
  };

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
  
  // Auto-generate Full SDE mock test when needed - moved to top level
  useEffect(() => {
    if (selectedMode === 'full' && mockTests.length === 0 && !loading && !error) {
      generateFullSDETest();
    }
  }, [selectedMode, mockTests.length, loading, error]);

  // Calculate current score with useMemo
  const calculateCurrentScore = useMemo(() => {
    return (answers) => {
      let totalScore = 0;
      let attempted = 0;
      let correct = 0;
      
      testQuestions.forEach((question, index) => {
        const questionId = question._id || index;
        const userAnswer = answers[questionId];
        
        if (userAnswer !== undefined && userAnswer !== null) {
          attempted++;
          
          // Use the marking scheme based on the question's marks and negative marks
          if (userAnswer === question.correctAnswer) {
            // Award marks for correct answer based on question's marks or test type
            totalScore += question.marks || (selectedMode === 'full' ? FULL_SDE_MARKS_PER_QUESTION : MARKS_PER_QUESTION);
            correct++;
          } else {
            // Deduct marks for incorrect answer based on question's negative marks or test type
            totalScore -= question.negativeMarks || (selectedMode === 'full' ? FULL_SDE_NEGATIVE_MARKS : NEGATIVE_MARKS);
          }
        }
      });
      
      // Calculate total possible marks based on question marks and test type
      const totalPossibleMarks = testQuestions.reduce((total, question) => {
        return total + (question.marks || (selectedMode === 'full' ? FULL_SDE_MARKS_PER_QUESTION : MARKS_PER_QUESTION));
      }, 0);
      
      // Calculate percentage (ensure it's not negative)
      const percentage = Math.max(0, (totalScore / totalPossibleMarks) * 100);
      
      console.log('Score calculation:', {
        totalScore,
        attempted,
        correct,
        total: testQuestions.length,
        percentage: percentage.toFixed(2)
      });
      
      return {
        score: totalScore,
        percentage: Math.max(0, percentage), // Ensure percentage is not negative
        attempted,
        correct,
        total: testQuestions.length
      };
    };
  }, [testQuestions, selectedMode]);

  // Define finishTest with useCallback
  const finishTest = useCallback(async () => {
    // Clear the timer if active
    if (timerRef.current) {
      clearInterval(timerRef.current);
      setTimerActive(false);
    }
    
    try {
      setLoading(true);
      
      // Format answers by section index
      const sectionAnswers = {};
      
      // Ensure we're only using the current test questions
      const currentTestQuestions = testQuestions.slice(0, 
        selectedMode === 'full' ? FULL_SDE_QUESTIONS : QUESTIONS_PER_TEST
      );
      
      // First, organize questions by section index
      currentTestQuestions.forEach((question, index) => {
        const sectionIndex = question.sectionIndex || 0;
        const questionId = question._id || index;
        
        if (!sectionAnswers[sectionIndex]) {
          sectionAnswers[sectionIndex] = [];
        }
        
        // Add the user's answer for this question to the appropriate section
        sectionAnswers[sectionIndex].push(selectedAnswers[questionId]);
      });
      
      // Convert the sectionAnswers object to an array format expected by the backend
      const formattedAnswers = [];
      Object.keys(sectionAnswers).forEach(sectionIndex => {
        formattedAnswers[parseInt(sectionIndex)] = sectionAnswers[sectionIndex];
      });
      
      console.log('Formatted answers for submission:', formattedAnswers);
      
      let result;
      
      // Calculate results using our standardized function
      const scoreData = calculateCurrentScore(selectedAnswers);
      console.log('Score data calculated:', scoreData);
      
      // Group questions by section for the results
      const sectionResults = {};
      currentTestQuestions.forEach((question, index) => {
        const sectionTitle = question.sectionTitle || 'General';
        if (!sectionResults[sectionTitle]) {
          sectionResults[sectionTitle] = [];
        }
        
        const questionId = question._id || index;
        const userAnswer = selectedAnswers[questionId];
        const isCorrect = userAnswer === question.correctAnswer;
        
        // Calculate score for this question based on the question's marks
        let questionScore = 0;
        if (isCorrect) {
          questionScore = question.marks || (selectedMode === 'full' ? FULL_SDE_MARKS_PER_QUESTION : MARKS_PER_QUESTION);
        } else if (userAnswer !== undefined) {
          questionScore = -(question.negativeMarks || (selectedMode === 'full' ? FULL_SDE_NEGATIVE_MARKS : NEGATIVE_MARKS));
        }
        
        // Make sure we're capturing and preserving the actual option contents
        sectionResults[sectionTitle].push({
          question: question.question,
          userAnswer,
          correctAnswer: question.correctAnswer,
          isCorrect,
          score: questionScore,
          explanation: question.explanation || '',
          subject: question.subject || sectionTitle,
          options: question.options // Always use the original question options
        });
      });
      
      // Convert sections to array format for consistency
      const resultsArray = Object.entries(sectionResults).map(([sectionTitle, questions]) => ({
        sectionTitle,
        questions
      }));
      
      // Calculate time taken as the difference between the standard time limit and remaining time
      const testDuration = selectedMode === 'full' ? FULL_SDE_TEST_DURATION : TEST_DURATION;
      const timeTaken = testDuration - remainingTime;
      
      // Extract subject information from the test questions for section-wise tracking
      const subjectData = {};
      testQuestions.forEach(question => {
        // For Full SDE tests, we want to track by section title (subject name)
        const subjectKey = selectedMode === 'full' ? 
          (question.sectionTitle || question.subjectName || 'General') : 
          (question.subjectId || 'unknown');
        
        const subjectName = selectedMode === 'full' ? 
          (question.sectionTitle || question.subjectName || 'General') : 
          (question.subjectName || 'Unknown Subject');
        
        if (!subjectData[subjectKey]) {
          subjectData[subjectKey] = {
            name: subjectName,
            total: 0,
            correct: 0
          };
        }
        
        const questionId = question._id || question.id;
        const userAnswer = selectedAnswers[questionId];
        const isCorrect = userAnswer === question.correctAnswer;
        
        subjectData[subjectKey].total++;
        if (isCorrect) {
          subjectData[subjectKey].correct++;
        }
      });
      
      // Convert to section-wise scores format
      const sectionWiseScores = Object.keys(subjectData).map(subjectKey => {
        // Use the appropriate marking scheme based on test type
        const marksPerQ = selectedMode === 'full' ? FULL_SDE_MARKS_PER_QUESTION : MARKS_PER_QUESTION;
        const negativeM = selectedMode === 'full' ? FULL_SDE_NEGATIVE_MARKS : NEGATIVE_MARKS;
        
        return {
          section: subjectData[subjectKey].name,
          score: subjectData[subjectKey].correct * marksPerQ - (subjectData[subjectKey].total - subjectData[subjectKey].correct) * negativeM,
          totalQuestions: subjectData[subjectKey].total,
          correctAnswers: subjectData[subjectKey].correct,
          subjectId: subjectKey // Add subject ID for tracking
        };
      });
      
      // Check if this is a custom test or default mock test
      const isCustomTest = activeMockTest?._id && (activeMockTest._id.startsWith('custom-') || activeMockTest._id.startsWith('default-'));
      
      if (isCustomTest) {
        result = {
          message: 'Mock test submitted successfully',
          score: scoreData.score,
          percentage: scoreData.percentage,
          correctAnswers: scoreData.correct,
          totalQuestions: scoreData.total,
          results: resultsArray,
          sectionWiseScores: sectionWiseScores // Add section-wise scores to result
        };
        
        // Update app context with new test completion
        dispatch({
          type: 'UPDATE_USER_PROGRESS',
          payload: { 
            mockTestCompleted: activeMockTest._id,
            mockTestResult: {
              testId: activeMockTest._id,
              score: scoreData.percentage,
              correctAnswers: scoreData.correct,
              totalQuestions: scoreData.total,
              timeTaken: timeTaken,
              completed: true,
              results: resultsArray, // Include full results
              sectionWiseScores: sectionWiseScores // Add section-wise scores
            }
          }
        });
      } else {
        // For backend tests, send the data to the API
        console.log('Submitting to backend with score data:', scoreData);
        
        try {
          const apiResult = await submitMockTestAttempt(
            activeMockTest._id,
            formattedAnswers,
            timeTaken, // Pass the time taken to complete the test
            {
              score: scoreData.score,
              percentage: scoreData.percentage,
              correctAnswers: scoreData.correct,
              totalQuestions: scoreData.total,
              sectionWiseScores: sectionWiseScores, // Add section-wise scores
              results: resultsArray // Include the full results with options
            }
          );
          
          console.log('API result:', apiResult);
          
          // Use the API result but fallback to our local calculation for consistency
          result = {
            message: apiResult.message || 'Mock test submitted successfully',
            score: apiResult.score || scoreData.score,
            percentage: apiResult.percentage || scoreData.percentage,
            correctAnswers: apiResult.correctAnswers || scoreData.correct,
            totalQuestions: apiResult.totalQuestions || scoreData.total,
            results: apiResult.results || resultsArray,
            sectionWiseScores: sectionWiseScores // Add section-wise scores to result
          };
        } catch (apiError) {
          console.error('API error, using local results:', apiError);
          // If API call fails, use our local calculation
          result = {
            message: 'Mock test submitted successfully',
            score: scoreData.score,
            percentage: scoreData.percentage,
            correctAnswers: scoreData.correct,
            totalQuestions: scoreData.total,
            results: resultsArray,
            sectionWiseScores: sectionWiseScores // Add section-wise scores to result
          };
        }
        
        // Update app context with new test completion
        dispatch({
          type: 'UPDATE_USER_PROGRESS',
          payload: { 
            mockTestCompleted: activeMockTest._id,
            mockTestResult: {
              testId: activeMockTest._id,
              score: result.percentage,
              correctAnswers: result.correctAnswers,
              totalQuestions: result.totalQuestions,
              timeTaken: timeTaken,
              completed: true,
              results: result.results, // Include full results
              sectionWiseScores: sectionWiseScores // Add section-wise scores
            }
          }
        });
      }
      
      console.log('Setting test results:', result);
      setTestResults(result);
      setTestCompleted(true);
      setLoading(false);
    } catch (err) {
      console.error('Error submitting mock test:', err);
      setError('Failed to submit mock test. Please try again later.');
      setLoading(false);
    }
  }, [testQuestions, selectedAnswers, activeMockTest, dispatch, calculateCurrentScore, remainingTime, selectedMode]);

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
  }, [timerActive, finishTest]);

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
    setSelectedSubjectFilter(null);
    setSelectedMockTest(null);
    setMockTests([]);
    
    // If full SDE mock test mode is selected, we need to fetch mock tests of type 'full'
    if (mode === 'full') {
      fetchFullSDEMockTests();
    }
  };
  
  const fetchFullSDEMockTests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all mock tests and filter for 'full' type tests
      const allTests = await getAllMockTests();
      
      if (allTests && allTests.length > 0) {
        const fullTests = allTests.filter(test => test.testType === 'full')
          .map(test => ({
            ...test,
            duration: FULL_SDE_TEST_DURATION,
            totalQuestions: FULL_SDE_QUESTIONS,
            totalMarks: FULL_SDE_TOTAL_MARKS
          }));
        
        setMockTests(fullTests);
      } else {
        setMockTests([]);
      }
    } catch (err) {
      console.error('Error fetching full SDE mock tests:', err);
      setError('Failed to load Full SDE mock tests');
      setMockTests([]);
    } finally {
      setLoading(false);
    }
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
        
        // For custom tests, we need to fetch tests for all selected subjects
        const subjectNames = [];
        const subjectQuestions = {}; // Store questions by subject ID
        
        // Calculate exactly how many questions we need from each subject
        const questionsPerSubject = Math.floor(QUESTIONS_PER_TEST / selectedSubjects.length);
        // Handle remainder if division isn't even
        const remainder = QUESTIONS_PER_TEST % selectedSubjects.length;
        
        console.log(`Distributing ${QUESTIONS_PER_TEST} questions across ${selectedSubjects.length} subjects (${questionsPerSubject} per subject, with ${remainder} extra)`);
        
        // Fetch tests for each selected subject
        for (const [index, subjectId] of selectedSubjects.entries()) {
          try {
            // Find the subject name for display
            const subject = state.subjects.find(s => s._id === subjectId);
            if (subject) {
              subjectNames.push(subject.name);
            }
            
            // Fetch mock tests for this subject
            const subjectTests = await getMockTestsBySubject(subjectId);
            
            if (!subjectTests || subjectTests.length === 0) {
              console.log(`No tests found for subject ID: ${subjectId}`);
              
              // Try getting seeded tests as fallback
              const seededTests = await getSeededMockTestsBySubject(subjectId);
              if (!seededTests || seededTests.length === 0) {
                console.log(`No seeded tests found for subject ID: ${subjectId} either`);
                continue;
              }
              
              // Use seeded tests if available
              const randomTest = seededTests[Math.floor(Math.random() * seededTests.length)];
              const subjectTest = await getMockTestById(randomTest._id);
              
              if (!subjectTest || !subjectTest.sections) {
                console.log(`Invalid test structure for subject ID: ${subjectId}`);
                continue;
              }
              
              // Extract questions from this subject's test
              const allSubjectQuestions = [];
              subjectTest.sections.forEach((section, sectionIndex) => {
                if (section.questions && section.questions.length > 0) {
                  console.log(`Section ${sectionIndex}: ${section.title} has ${section.questions.length} questions`);
                  section.questions.forEach(question => {
                    // Ensure options are preserved as is from the original question
                    allSubjectQuestions.push({
                      ...question,
                      sectionTitle: section.title || subject?.name || `Subject ${subjectId}`,
                      sectionIndex: sectionIndex,
                      subjectId: subjectId,
                      subjectName: subject?.name || `Subject ${subjectId}`,
                      marks: MARKS_PER_QUESTION,
                      negativeMarks: NEGATIVE_MARKS,
                      options: question.options // Explicitly preserve options
                    });
                  });
                } else {
                  console.log(`Section ${sectionIndex} has no questions or is invalid`);
                }
              });
              
              // Shuffle questions from this subject
              const shuffledSubjectQuestions = shuffleArray(allSubjectQuestions);
              
              // Calculate how many questions to take from this subject
              const questionsToTake = questionsPerSubject + (index < remainder ? 1 : 0);
              
              // Store questions for this subject
              subjectQuestions[subjectId] = shuffledSubjectQuestions.slice(0, questionsToTake);
              
              console.log(`Added ${Math.min(shuffledSubjectQuestions.length, questionsToTake)} questions from ${subject?.name || subjectId} (seeded test)`);
              continue;
            }
            
            // Select a random test from the available tests for this subject
            const randomTest = subjectTests[Math.floor(Math.random() * subjectTests.length)];
            const subjectTest = await getMockTestById(randomTest._id);
            
            if (!subjectTest || !subjectTest.sections) {
              console.log(`Invalid test structure for subject ID: ${subjectId}`);
              continue;
            }
            
            console.log(`Found test: ${subjectTest.title} with ${subjectTest.sections.length} sections`);
            
            // Extract questions from this subject's test
            const allSubjectQuestions = [];
            subjectTest.sections.forEach((section, sectionIndex) => {
              if (section.questions && section.questions.length > 0) {
                console.log(`Section ${sectionIndex}: ${section.title} has ${section.questions.length} questions`);
                section.questions.forEach(question => {
                  // Ensure options are preserved as is from the original question
                  allSubjectQuestions.push({
                    ...question,
                    sectionTitle: section.title || subject?.name || `Subject ${subjectId}`,
                    sectionIndex: sectionIndex,
                    subjectId: subjectId,
                    subjectName: subject?.name || `Subject ${subjectId}`,
                    marks: MARKS_PER_QUESTION,
                    negativeMarks: NEGATIVE_MARKS,
                    options: question.options // Explicitly preserve options
                  });
                });
              } else {
                console.log(`Section ${sectionIndex} has no questions or is invalid`);
              }
            });
            
            if (allSubjectQuestions.length === 0) {
              console.log(`No questions found in test for subject ID: ${subjectId}`);
              continue;
            }
            
            // Shuffle questions from this subject
            const shuffledSubjectQuestions = shuffleArray(allSubjectQuestions);
            
            // Calculate how many questions to take from this subject
            // Add one extra question to subjects at the beginning if there's a remainder
            const questionsToTake = questionsPerSubject + (index < remainder ? 1 : 0);
            
            // Store questions for this subject
            subjectQuestions[subjectId] = shuffledSubjectQuestions.slice(0, questionsToTake);
            
            console.log(`Added ${Math.min(shuffledSubjectQuestions.length, questionsToTake)} questions from ${subject?.name || subjectId}`);
          } catch (err) {
            console.error(`Error fetching test for subject ID ${subjectId}:`, err);
            // Continue with other subjects if one fails
          }
        }
        
        // Combine all questions from all subjects
        const allQuestions = [];
        for (const subjectId of selectedSubjects) {
          if (subjectQuestions[subjectId] && subjectQuestions[subjectId].length > 0) {
            allQuestions.push(...subjectQuestions[subjectId]);
          }
        }
        
        if (allQuestions.length === 0) {
          setError('Could not find any questions for the selected subjects');
          setLoading(false);
          return;
        }
        
        // Shuffle all questions to randomize the order across subjects
        const shuffledQuestions = shuffleArray(allQuestions);
        
        // Create a custom test with the collected questions
        test = {
          _id: `custom-${Date.now()}`,
          title: `Custom Test: ${subjectNames.join(', ')}`,
          description: `Custom mock test with questions from ${subjectNames.join(', ')}`,
          testType: 'custom',
          subjects: selectedSubjects,
          duration: TEST_DURATION,
          totalMarks: TOTAL_MARKS,
          sections: []
        };
        
        // Create one section for all questions (they're already mixed)
        test.sections.push({
          title: "Mixed Subjects",
          questions: shuffledQuestions
        });
        
        console.log(`Created custom test with ${shuffledQuestions.length} questions from ${selectedSubjects.length} subjects`);
        
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
        
      } else if (selectedMode === 'full') {
        if (!selectedMockTest) {
          setError('Please select a mock test');
          setLoading(false);
          return;
        }
        
        // Get the specific mock test
        test = await getMockTestById(selectedMockTest._id);
        
        if (!test) {
          setError('Could not load the test');
          setLoading(false);
          return;
        }
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
      
      test.sections.forEach((section, sectionIndex) => {
        if (!section.questions) return;
        
        section.questions.forEach(question => {
          // Use the appropriate marking scheme based on the test type
          const marksPerQuestion = selectedMode === 'full' ? FULL_SDE_MARKS_PER_QUESTION : MARKS_PER_QUESTION;
          const negativeMarks = selectedMode === 'full' ? FULL_SDE_NEGATIVE_MARKS : NEGATIVE_MARKS;
          
          allQuestions.push({
            ...question,
            sectionTitle: section.title,
            sectionIndex: sectionIndex, // Add section index to each question
            marks: marksPerQuestion, // Use the appropriate marks per question
            negativeMarks: negativeMarks // Use the appropriate negative marking
          });
        });
      });
      
      // Select appropriate number of questions based on test type
      const questionsPerTest = selectedMode === 'full' ? FULL_SDE_QUESTIONS : QUESTIONS_PER_TEST;
      const totalMarks = selectedMode === 'full' ? FULL_SDE_TOTAL_MARKS : TOTAL_MARKS;
      const testDuration = selectedMode === 'full' ? FULL_SDE_TEST_DURATION : TEST_DURATION;
      
      let finalQuestions;
      if (selectedMode === 'custom') {
        // For custom tests, we've already prepared the questions with exact distribution
        finalQuestions = allQuestions;
      } else if (allQuestions.length > questionsPerTest) {
        // Shuffle the array and take the first N questions
        finalQuestions = shuffleArray(allQuestions).slice(0, questionsPerTest);
      } else if (allQuestions.length < questionsPerTest) {
        // If less than N questions, duplicate some randomly to reach exactly N
        finalQuestions = [...allQuestions];
        while (finalQuestions.length < questionsPerTest) {
          const randomQuestion = allQuestions[Math.floor(Math.random() * allQuestions.length)];
          finalQuestions.push({...randomQuestion});
        }
      } else {
        // If exactly N questions, shuffle them
        finalQuestions = shuffleArray(allQuestions);
      }
      
      // Create standardized test with appropriate parameters
      const standardizedTest = {
        ...test,
        duration: testDuration,
        totalMarks: totalMarks,
        totalQuestions: questionsPerTest,
        difficulty: 'mixed'
      };
      
      setActiveMockTest(standardizedTest);
      setTestQuestions(finalQuestions);
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setTestCompleted(false);
      setTestResults(null);
      
      // Set up the timer with appropriate time limit
      setRemainingTime(testDuration);
      
      // Clear any existing timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Start the timer
      startTimeRef.current = Date.now();
      setTimerActive(true);
      
      setLoading(false);
    } catch (err) {
      console.error('Error generating mock test:', err);
      setError(`Failed to generate mock test: ${err.message || 'Unknown error'}`);
      setLoading(false);
    }
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
            <p>Total Mock Tests: <span className="font-semibold">1</span></p>
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
  if ((selectedMode === 'subject' || selectedMode === 'full') && selectedMockTest && !activeMockTest) {
    // Use different marking scheme based on test type
    const isFullSDE = selectedMode === 'full';
    const marksPerQuestion = isFullSDE ? FULL_SDE_MARKS_PER_QUESTION : MARKS_PER_QUESTION;
    const negativeMarks = isFullSDE ? FULL_SDE_NEGATIVE_MARKS : NEGATIVE_MARKS;
    const totalQuestions = isFullSDE ? FULL_SDE_QUESTIONS : QUESTIONS_PER_TEST;
    
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
              <div className="text-xl capitalize text-gray-800">{selectedMockTest.difficulty || "Mixed"}</div>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-md">
              <div className="font-medium mb-1 text-gray-700">Questions</div>
              <div className="text-xl text-gray-800">{totalQuestions}</div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-xl font-medium mb-4 text-gray-800">Instructions</h3>
            <ul className="space-y-3 text-gray-700 bg-gray-50 p-4 rounded-md">
              <li className="flex items-start">
                <span className="mr-2 text-blue-600">•</span> 
                <span>Each question carries {marksPerQuestion} marks</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-blue-600">•</span> 
                <span>There is negative marking of {negativeMarks} mark for wrong answers</span>
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
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Full SDE Mock Tests</h1>
          <button
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            onClick={() => setSelectedMode(null)}
          >
            Back
          </button>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="spinner"></div>
            <p className="ml-2">Loading mock tests...</p>
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
        ) : (
          <div className="flex flex-col space-y-6 max-w-4xl mx-auto">
            {/* Removing the About Full SDE Mock Tests white box */}
            
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
              {mockTests.slice(0, 1).map(test => (
                <AnimatedCard
                  key={test._id}
                  className="p-6 cursor-pointer hover:shadow-lg transition-all shadow-md rounded-lg bg-gradient-to-r from-orange-700 to-orange-600 text-white"
                  onClick={() => selectMockTest(test)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-bold text-white">{test.title}</h2>
                    <span className="bg-white text-orange-700 px-3 py-1 rounded-md text-sm font-medium">
                      Full SDE
                    </span>
                  </div>
                  <p className="mb-6 text-white text-lg">{test.description}</p>
                  <div className="grid grid-cols-2 gap-6 text-base">
                    <div>
                      <p className="text-gray-200 font-medium mb-1">Duration:</p>
                      <p className="font-semibold text-white">{Math.floor(test.duration / 60)} mins</p>
                    </div>
                    <div>
                      <p className="text-gray-200 font-medium mb-1">Total Marks:</p>
                      <p className="font-semibold text-white">{test.totalMarks}</p>
                    </div>
                    <div>
                      <p className="text-gray-200 font-medium mb-1">Questions:</p>
                      <p className="font-semibold text-white">{test.totalQuestions || FULL_SDE_QUESTIONS}</p>
                    </div>
                    <div>
                      <p className="text-gray-200 font-medium mb-1">Difficulty:</p>
                      <p className="font-semibold text-white capitalize">Mixed</p>
                    </div>
                  </div>
                </AnimatedCard>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Show mock test details when selected but not yet started
  if ((selectedMode === 'subject' || selectedMode === 'full') && selectedMockTest && !activeMockTest) {
    // Use different marking scheme based on test type
    const isFullSDE = selectedMode === 'full';
    const marksPerQuestion = isFullSDE ? FULL_SDE_MARKS_PER_QUESTION : MARKS_PER_QUESTION;
    const negativeMarks = isFullSDE ? FULL_SDE_NEGATIVE_MARKS : NEGATIVE_MARKS;
    const totalQuestions = isFullSDE ? FULL_SDE_QUESTIONS : QUESTIONS_PER_TEST;
    
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
              <div className="text-xl capitalize text-gray-800">{selectedMockTest.difficulty || "Mixed"}</div>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-md">
              <div className="font-medium mb-1 text-gray-700">Questions</div>
              <div className="text-xl text-gray-800">{totalQuestions}</div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-xl font-medium mb-4 text-gray-800">Instructions</h3>
            <ul className="space-y-3 text-gray-700 bg-gray-50 p-4 rounded-md">
              <li className="flex items-start">
                <span className="mr-2 text-blue-600">•</span> 
                <span>Each question carries {marksPerQuestion} marks</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-blue-600">•</span> 
                <span>There is negative marking of {negativeMarks} mark for wrong answers</span>
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

  // Show test results if completed
  if (testCompleted && testResults) {
    console.log('Rendering test results:', testResults);
    const score = testResults.percentage;
    const feedbackData = generateFeedback(score);
    
    // Generate question breakdown for custom tests if results are missing
    let resultsToDisplay = testResults.results;
    if (!resultsToDisplay || resultsToDisplay.length === 0) {
      console.log('No results found in testResults, generating from test questions and answers');
      
      // Group questions by section for the results
      const sectionResults = {};
      testQuestions.forEach((question, index) => {
        const sectionTitle = question.sectionTitle || 'General';
        if (!sectionResults[sectionTitle]) {
          sectionResults[sectionTitle] = [];
        }
        
        const questionId = question._id || index;
        const userAnswer = selectedAnswers[questionId];
        const isCorrect = userAnswer === question.correctAnswer;
        
        // Calculate score for this question using the appropriate marking scheme
        let questionScore = 0;
        if (isCorrect) {
          questionScore = question.marks || (selectedMode === 'full' ? FULL_SDE_MARKS_PER_QUESTION : MARKS_PER_QUESTION);
        } else if (userAnswer !== undefined) {
          questionScore = -(question.negativeMarks || (selectedMode === 'full' ? FULL_SDE_NEGATIVE_MARKS : NEGATIVE_MARKS));
        }
        
        sectionResults[sectionTitle].push({
          question: question.question,
          userAnswer,
          correctAnswer: question.correctAnswer,
          isCorrect,
          score: questionScore,
          explanation: question.explanation || '',
          subject: question.subject || sectionTitle,
          options: question.options || [] // Preserve the original options
        });
      });
      
      // Convert sections to array format for consistency
      resultsToDisplay = Object.entries(sectionResults).map(([sectionTitle, questions]) => ({
        sectionTitle,
        questions
      }));
      
      console.log('Generated results:', resultsToDisplay);
    } else {
      // Ensure all questions in the results have options but preserve original content
      resultsToDisplay = resultsToDisplay.map(section => {
        if (section.questions) {
          section.questions = section.questions.map(question => {
            // Only use fallback if options are completely missing
            if (!question.options || !Array.isArray(question.options) || question.options.length === 0) {
              // Try to find the matching question in testQuestions to get the original options
              const originalQuestion = testQuestions.find(q => q.question === question.question);
              if (originalQuestion && originalQuestion.options) {
                question.options = originalQuestion.options;
              } else {
                question.options = ['Option A', 'Option B', 'Option C', 'Option D']; // Default options only if necessary
              }
            }
            return question;
          });
        }
        return section;
      });
    }
    
    // Generate subject-wise performance data if it's missing
    if (!testResults.sectionWiseScores || testResults.sectionWiseScores.length === 0) {
      console.log('No section-wise scores found, generating from test questions and answers');
      
      // Extract subject information from the test questions for section-wise tracking
      const subjectData = {};
      testQuestions.forEach(question => {
        // For Full SDE tests, we want to track by section title (subject name)
        const subjectKey = selectedMode === 'full' ? 
          (question.sectionTitle || question.subjectName || 'General') : 
          (question.subjectId || 'unknown');
        
        const subjectName = selectedMode === 'full' ? 
          (question.sectionTitle || question.subjectName || 'General') : 
          (question.subjectName || 'Unknown Subject');
        
        if (!subjectData[subjectKey]) {
          subjectData[subjectKey] = {
            name: subjectName,
            total: 0,
            correct: 0
          };
        }
        
        const questionId = question._id || question.id || question._id;
        const userAnswer = selectedAnswers[questionId];
        const isCorrect = userAnswer === question.correctAnswer;
        
        subjectData[subjectKey].total++;
        if (isCorrect) {
          subjectData[subjectKey].correct++;
        }
      });
      
      // Convert to section-wise scores format
      testResults.sectionWiseScores = Object.keys(subjectData).map(subjectKey => {
        // Use the appropriate marking scheme based on test type
        const marksPerQ = selectedMode === 'full' ? FULL_SDE_MARKS_PER_QUESTION : MARKS_PER_QUESTION;
        const negativeM = selectedMode === 'full' ? FULL_SDE_NEGATIVE_MARKS : NEGATIVE_MARKS;
        
        return {
          section: subjectData[subjectKey].name,
          score: subjectData[subjectKey].correct * marksPerQ - (subjectData[subjectKey].total - subjectData[subjectKey].correct) * negativeM,
          totalQuestions: subjectData[subjectKey].total,
          correctAnswers: subjectData[subjectKey].correct,
          subjectId: subjectKey // Add subject ID for tracking
        };
      });
      
      console.log('Generated section-wise scores:', testResults.sectionWiseScores);
    }
    
    // Calculate the total marks based on test type
    const totalMarksForTest = selectedMode === 'full' ? FULL_SDE_TOTAL_MARKS : TOTAL_MARKS;
    
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
                  {testResults.score} / {totalMarksForTest} marks
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
          
          {/* Subject-wise Performance */}
          <div className="mt-8 mb-6">
            <h3 className="text-xl font-medium mb-4 text-gray-800">Subject-wise Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {testResults.sectionWiseScores && testResults.sectionWiseScores.map((section, index) => (
                <div key={index} className={`p-4 rounded-md border ${
                  (section.correctAnswers / section.totalQuestions * 100) >= 70 ? 'bg-green-50 border-green-200' : 
                  (section.correctAnswers / section.totalQuestions * 100) >= 40 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'
                }`}>
                  <h4 className="font-medium text-gray-800 mb-2">{section.section}</h4>
                  <div className="flex items-center mb-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${
                          (section.correctAnswers / section.totalQuestions * 100) >= 70 ? 'bg-green-500' : 
                          (section.correctAnswers / section.totalQuestions * 100) >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                        }`} 
                        style={{ width: `${section.correctAnswers / section.totalQuestions * 100}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      {Math.round(section.correctAnswers / section.totalQuestions * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <p className="text-gray-600">
                      {section.correctAnswers} correct out of {section.totalQuestions} questions
                    </p>
                    <p className={`font-medium ${section.score > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {section.score > 0 ? '+' : ''}{section.score} marks
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {resultsToDisplay && resultsToDisplay.length > 0 ? (
            <div className="mt-8">
              <h3 className="text-xl font-medium mb-4 text-gray-800">Question Breakdown</h3>
              {resultsToDisplay.map((section, sectionIndex) => (
                <div key={sectionIndex} className="mb-6">
                  <h4 className="font-medium text-lg mb-3 text-gray-800">{section.sectionTitle}</h4>
                  
                  {section.questions && section.questions.map((result, questionIndex) => {
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
                              }`}>
                                {option}
                              </span>
                              
                              {/* Show the answer status with clear labels */}
                              <div className="ml-auto flex items-center">
                                {result.userAnswer === optionIndex && (
                                  <span className={`px-2 py-1 text-sm font-medium rounded ${
                                    result.userAnswer === result.correctAnswer ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                                  }`}>
                                    Your Answer
                                  </span>
                                )}
                                {result.correctAnswer === optionIndex && (
                                  <span className="px-2 py-1 ml-2 bg-green-200 text-green-800 text-sm font-medium rounded">
                                    Correct Answer
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Add a summary of user's answer vs correct answer */}
                        <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200">
                          <div className="flex flex-wrap gap-4">
                            <div>
                              <span className="text-gray-700 font-medium">Your answer:</span> 
                              {result.userAnswer !== undefined && result.userAnswer !== null ? (
                                <span className={`ml-2 ${result.isCorrect ? 'text-green-600' : 'text-red-600'} font-medium`}>
                                  {String.fromCharCode(65 + result.userAnswer)} - {result.options[result.userAnswer]}
                                </span>
                              ) : (
                                <span className="ml-2 text-gray-500 italic">Not answered</span>
                              )}
                            </div>
                            
                            <div>
                              <span className="text-gray-700 font-medium">Correct answer:</span> 
                              {result.correctAnswer !== undefined && result.correctAnswer !== null ? (
                                <span className="ml-2 text-green-600 font-medium">
                                  {String.fromCharCode(65 + result.correctAnswer)} - {result.options[result.correctAnswer]}
                                </span>
                              ) : (
                                <span className="ml-2 text-gray-500 italic">No correct answer provided</span>
                              )}
                            </div>
                          </div>
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
          ) : (
            <div className="mt-8 text-center">
              <p className="text-gray-700">No question breakdown available for this test.</p>
            </div>
          )}
          
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