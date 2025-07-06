import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../contexts/AppContext';
import { QuizContext, TimedQuizStrategy, PracticeQuizStrategy, AdaptiveQuizStrategy } from '../../services/QuizStrategies';
import { BaseQuiz, HintsDecorator, ExplanationDecorator, ProgressTrackingDecorator } from '../../services/QuizDecorator';
import AnimatedCard from '../common/AnimatedCard';
import ProgressBar from '../common/ProgressBar';
import { getAllQuizzes, getQuizById, submitQuizAttempt, getUserProfile } from '../../services/ApiService';

const Quizzes = () => {
  const { state, dispatch } = useApp();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { subjects } = state;
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedQuizType, setSelectedQuizType] = useState(null);
  const [quizConfig, setQuizConfig] = useState({
    useHints: false,
    showExplanations: true,
    trackProgress: true
  });
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  
  // Configuration for the number of questions in a quiz
  const MAX_QUESTIONS = 15; // Can be changed to any number (e.g., 20)
  
  // Standard time limit for all quizzes (20 minutes in seconds)
  const STANDARD_TIME_LIMIT = 1200;
  
  // Use a ref to track the timer interval
  const timerRef = useRef(null);
  
  // Fetch all quizzes on component mount
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        const data = await getAllQuizzes();
        setQuizzes(data);
      } catch (err) {
        console.error('Error fetching quizzes:', err);
        setError('Failed to load quizzes. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);
  
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
        
        // If time is up, finish the quiz
        if (newRemainingTime === 0) {
          clearInterval(timerRef.current);
          finishQuiz();
        }
      }, 1000);
      
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [timerActive]);
  
  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject);
    
    // Fetch quizzes for the selected subject
    const fetchSubjectQuizzes = async () => {
      try {
        setLoading(true);
        const data = await getAllQuizzes();
        // Filter quizzes by selected subject ID
        const filteredQuizzes = data.filter(quiz => 
          quiz.subject && quiz.subject._id === subject._id
        );
        setQuizzes(filteredQuizzes);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching subject quizzes:', err);
        setError('Failed to load quizzes for this subject. Please try again later.');
        setLoading(false);
      }
    };

    fetchSubjectQuizzes();
  };

  const startQuiz = async (quizId) => {
    try {
      setLoading(true);
      const quiz = await getQuizById(quizId);
      
      // Get random questions from the quiz
      let randomQuestions = [];
      if (quiz.questions && quiz.questions.length > 0) {
        // If there are fewer questions than MAX_QUESTIONS, use all of them
        if (quiz.questions.length <= MAX_QUESTIONS) {
          randomQuestions = [...quiz.questions];
        } else {
          // Select MAX_QUESTIONS random questions
          const questionsCopy = [...quiz.questions];
          while (randomQuestions.length < MAX_QUESTIONS && questionsCopy.length > 0) {
            const randomIndex = Math.floor(Math.random() * questionsCopy.length);
            randomQuestions.push(questionsCopy.splice(randomIndex, 1)[0]);
          }
        }
      }
    
      // Use the standard time limit for all quizzes
      setActiveQuiz({
        ...quiz,
        questions: randomQuestions,
        questionCount: randomQuestions.length, // Store the actual question count
        timeLimit: STANDARD_TIME_LIMIT // Override with standard time limit
      });
      
      // Set the current quiz in the app context
      dispatch({
        type: 'SET_CURRENT_QUIZ',
        payload: {
          ...quiz,
          questionCount: randomQuestions.length, // Include the question count in context
          timeLimit: STANDARD_TIME_LIMIT // Include standard time limit
        }
      });
    
      setQuizQuestions(randomQuestions);
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setQuizCompleted(false);
      setQuizResults(null);
      
      // Set up the timer with standard time limit
      setRemainingTime(STANDARD_TIME_LIMIT);
      setTimerActive(true);
      
      setLoading(false);
    } catch (err) {
      console.error('Error starting quiz:', err);
      setError('Failed to load quiz. Please try again later.');
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId, answerIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: answerIndex,
    });
  };

  const moveToNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const moveToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const finishQuiz = async () => {
    // Clear the timer if active
    if (timerRef.current) {
      clearInterval(timerRef.current);
      setTimerActive(false);
    }
    
    try {
      setLoading(true);
      
      // Calculate time taken as the difference between the standard time limit and remaining time
      const timeTaken = STANDARD_TIME_LIMIT - remainingTime;
      
      // Submit answers to the backend with the actual question count
      const result = await submitQuizAttempt(
        activeQuiz._id,
        selectedAnswers,
        timeTaken,
        activeQuiz.questionCount || quizQuestions.length // Pass the actual question count
      );
      
      setQuizResults(result);
      setQuizCompleted(true);
      setLoading(false);
      
      // Update app context with new quiz completion
      dispatch({
        type: 'UPDATE_USER_PROGRESS',
        payload: { 
          quizCompleted: activeQuiz._id,
          quizResult: {
            quizId: activeQuiz._id,
            score: result.results.score,
            correctAnswers: result.results.correctAnswers,
            totalQuestions: result.results.totalQuestions, // Use the value from the backend
            timeTaken: timeTaken,
            completed: true,
            date: new Date()
          }
        }
      });
      
      // Fetch updated user profile to reflect changes
      try {
        const userProfile = await getUserProfile();
        if (userProfile) {
          dispatch({
            type: 'LOGIN',
            payload: { 
              user: userProfile,
              token: localStorage.getItem('token')
            }
          });
        }
      } catch (profileErr) {
        console.error('Error updating user profile:', profileErr);
      }
      
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError('Failed to submit quiz. Please try again later.');
      setLoading(false);
    }
  };

  const resetQuiz = () => {
    setSelectedSubject(null);
    setSelectedQuizType(null);
    setActiveQuiz(null);
    setQuizQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizCompleted(false);
    setQuizResults(null);
    setRemainingTime(0);
    setTimerActive(false);
    
    // Clear the current quiz from the app context
    dispatch({
      type: 'SET_CURRENT_QUIZ',
      payload: null
    });
  };

  // Format time in minutes:seconds
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
  
  if (loading && !activeQuiz) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="spinner"></div>
        <p className="ml-2 text-gray-800">Loading quizzes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <div className="text-red-700 mb-4">{error}</div>
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded-md"
          onClick={() => setError(null)}
        >
          Try Again
        </button>
      </div>
    );
  }

  // Show subject selection if no quiz is active
  if (!activeQuiz) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Quizzes</h1>
        
        {!selectedSubject ? (
          <div>
            <h2 className="text-2xl font-medium mb-4 text-gray-800">Select a Subject</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {state.subjects && state.subjects.map((subject) => (
                <AnimatedCard
                  key={subject.id}
                  className={`p-6 cursor-pointer hover:shadow-lg transition-all bg-${subject.color}-100 border border-${subject.color}-300`}
                  onClick={() => handleSubjectSelect(subject)}
                >
                  <h3 className="text-xl font-medium text-gray-800">{subject.name}</h3>
                  <p className="mt-2 text-gray-700">{subject.description}</p>
                  <div className="mt-4 flex items-center">
                    <span className="mr-2 text-gray-700">Total Quizzes:</span>
                    <span className="font-semibold text-gray-800">{
                      quizzes && quizzes.filter(q => q.subject?._id === subject._id).length
                    }</span>
                  </div>
                </AnimatedCard>
              ))}
            </div>
        </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-medium text-gray-800">{selectedSubject.name} Quizzes</h2>
              <button 
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                onClick={() => setSelectedSubject(null)}
              >
                Back to Subjects
              </button>
            </div>
            
            {quizzes.length === 0 ? (
              <p className="text-gray-800">No quizzes available for this subject.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quizzes.map((quiz) => (
                  <AnimatedCard
                    key={quiz._id}
                    className="p-6 cursor-pointer hover:shadow-lg transition-all bg-white border border-gray-200"
                    onClick={() => startQuiz(quiz._id)}
                  >
                    <div className={`w-16 h-6 mb-3 rounded-full text-xs flex items-center justify-center ${
                      quiz.difficulty === 'easy' 
                        ? 'bg-green-500 text-white' 
                        : quiz.difficulty === 'medium' 
                          ? 'bg-yellow-500 text-black' 
                          : 'bg-red-500 text-white'
                    }`}>
                      {quiz.difficulty}
                    </div>
                    <h3 className="text-xl font-medium text-gray-800">{quiz.title}</h3>
                    <p className="text-gray-600 mt-2">{quiz.description}</p>
                    <div className="mt-4 flex items-center">
                      <span className="mr-2 text-gray-700">Questions:</span>
                      <span className="font-semibold text-gray-800">{MAX_QUESTIONS}</span>
                    </div>
                    <div className="mt-2 flex items-center">
                      <span className="mr-2 text-gray-700">Time Limit:</span>
                      <span className="font-semibold text-gray-800">{formatTime(STANDARD_TIME_LIMIT)}</span>
                    </div>
                  </AnimatedCard>
                ))}
            </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Show quiz results if completed
  if (quizCompleted && quizResults) {
    const score = quizResults.results.score;
    
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Quiz Results</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <div className="mb-6">
            <h2 className="text-2xl font-medium mb-2 text-gray-800">Your Score</h2>
            <div className="flex items-center justify-center">
              <div className="w-48 h-48 rounded-full bg-gray-100 flex flex-col items-center justify-center border-8 border-blue-500">
                <span className="text-4xl font-bold text-gray-800">{Math.round(score)}%</span>
                <span className="text-gray-600 mt-2">
                  {quizResults.results.correctAnswers} / {quizQuestions.length} correct
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <h3 className="text-xl font-medium mb-4 text-gray-800">Question Breakdown</h3>
            {quizQuestions.map((question, index) => {
              const questionId = question._id || index;
              const userAnswer = selectedAnswers[questionId];
              const correctAnswer = question.correctAnswer;
              const isCorrect = userAnswer === correctAnswer;
              
              return (
                <div 
                  key={questionId} 
                  className={`mb-4 p-4 rounded-md ${
                    isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <p className="font-medium text-gray-800">{index + 1}. {question.question}</p>
                  <div className="mt-2">
                    <p className={`${isCorrect ? 'text-green-700' : 'text-red-700'}`}> 
                      {isCorrect ? 'Correct' : 'Incorrect'} - 
                      You selected: {question.options[userAnswer] || 'No answer'} 
                    </p>
                    {!isCorrect && (
                      <p className="text-green-700 mt-1">
                        Correct answer: {question.options[correctAnswer]}
                      </p>
                    )}
                    {question.explanation && (
                      <p className="mt-2 text-gray-700">{question.explanation}</p>
                    )}
                  </div>
              </div>
              );
            })}
          </div>
          
          <div className="mt-8 flex justify-center">
          <button
              className="px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700"
              onClick={resetQuiz}
          >
              Return to Quizzes
          </button>
          </div>
        </div>
      </div>
    );
  }

  // Show active quiz
  const currentQuestion = quizQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;
  const questionId = currentQuestion?._id || currentQuestionIndex;
  
    return (
    <div className="max-w-3xl mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{activeQuiz.title}</h1>
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
          Question {currentQuestionIndex + 1} of {quizQuestions.length}
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
          </>
        )}
      </div>
      
      <div className="flex justify-between">
        <button
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50 hover:bg-gray-300"
          onClick={moveToPreviousQuestion}
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </button>
        
        {currentQuestionIndex === quizQuestions.length - 1 ? (
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={finishQuiz}
          >
            Finish Quiz
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

export default Quizzes; 