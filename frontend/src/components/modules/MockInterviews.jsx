import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import AnimatedCard from '../common/AnimatedCard';
import ProgressBar from '../common/ProgressBar';

const MockInterviews = () => {
  const { state } = useApp();
  const [selectedInterviewType, setSelectedInterviewType] = useState(null);
  const [activeInterview, setActiveInterview] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userResponses, setUserResponses] = useState({});
  const [currentResponse, setCurrentResponse] = useState('');
  const [interviewResults, setInterviewResults] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isThinking, setIsThinking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Interview types
  const interviewTypes = [
    { 
      id: 'technical', 
      name: 'Technical Interview', 
      description: 'Practice technical questions focused on algorithms, data structures, and problem-solving',
      icon: '💻',
      difficulty: 'Advanced'
    },
    { 
      id: 'hr', 
      name: 'HR Interview', 
      description: 'Practice common HR and behavioral questions',
      icon: '👥',
      difficulty: 'Intermediate'
    },
    { 
      id: 'system-design', 
      name: 'System Design Interview', 
      description: 'Practice designing large-scale systems and architecture',
      icon: '🏗️',
      difficulty: 'Advanced'
    },
    { 
      id: 'subject', 
      name: 'Subject-specific Interview', 
      description: 'Practice questions related to a specific subject like DBMS, OOPs, etc.',
      icon: '📚',
      difficulty: 'Intermediate'
    }
  ];

  // Sample interview questions by type
  const interviews = {
    technical: {
      title: 'Technical Interview Simulation',
      description: 'This interview will focus on algorithms, data structures, and problem-solving skills.',
      duration: 20, // minutes
      questions: [
        {
          id: 'tech_1',
          question: 'How would you implement a function to check if a string is a palindrome?',
          idealAnswer: 'A palindrome is a string that reads the same backward as forward. To check if a string is a palindrome, I would compare characters from the beginning and end simultaneously, moving inward. If all characters match, it\'s a palindrome. Alternatively, I could reverse the string and compare it with the original.',
          type: 'algorithm',
          difficulty: 'easy',
          tips: ['Consider edge cases like empty strings or single characters', 'Think about case sensitivity', 'Special characters might need to be handled']
        },
        {
          id: 'tech_2',
          question: 'Explain the difference between BFS and DFS traversals in a graph, and when you would use one over the other.',
          idealAnswer: 'BFS (Breadth-First Search) explores all nodes at the present depth before moving to nodes at the next depth level. It uses a queue data structure. DFS (Depth-First Search) explores as far as possible along each branch before backtracking, using a stack. BFS is better for finding the shortest path in unweighted graphs and for searching nodes closer to the given node. DFS is better for maze or puzzle problems, detecting cycles, and when the solution is far from the root.',
          type: 'data_structure',
          difficulty: 'medium',
          tips: ['Consider space complexity of each algorithm', 'Think about the specific problem requirements']
        },
        {
          id: 'tech_3',
          question: 'How would you design a cache system with a limited capacity?',
          idealAnswer: 'I would implement an LRU (Least Recently Used) cache using a combination of a hash map and a doubly linked list. The hash map provides O(1) lookups, while the linked list maintains the order of usage. When the cache reaches capacity, I would remove the least recently used item. The hash map would store keys and pointers to nodes in the linked list, while the linked list would maintain the usage order. Each access would move the accessed item to the front of the list.',
          type: 'system_design',
          difficulty: 'hard',
          tips: ['Consider different cache eviction policies', 'Think about thread safety if needed', 'Consider how to handle cache misses']
        }
      ]
    },
    hr: {
      title: 'HR Interview Simulation',
      description: 'This interview will focus on behavioral questions and cultural fit.',
      duration: 15,
      questions: [
        {
          id: 'hr_1',
          question: 'Tell me about a challenging project you worked on and how you overcame obstacles.',
          idealAnswer: 'A strong answer would describe a specific project, the challenges faced, the actions taken to address them, and the results achieved. The STAR method (Situation, Task, Action, Result) works well here. Demonstrate problem-solving skills, teamwork, and resilience.',
          type: 'behavioral',
          difficulty: 'medium',
          tips: ['Use the STAR method', 'Be specific about your role', 'Quantify results if possible']
        },
        {
          id: 'hr_2',
          question: 'Where do you see yourself in 5 years?',
          idealAnswer: 'A good answer would show ambition but also realistic expectations. Discuss how you want to grow in your career, develop new skills, and take on more responsibilities. Align your goals with potential career paths at the company, showing commitment without seeming like you\'ll outgrow the position too quickly.',
          type: 'career',
          difficulty: 'easy',
          tips: ['Be honest but strategic', 'Show alignment with company goals', 'Emphasize growth and learning']
        },
        {
          id: 'hr_3',
          question: 'Describe a situation where you had a conflict with a team member and how you resolved it.',
          idealAnswer: 'A strong answer would describe a specific conflict, your approach to resolving it, and the positive outcome. Emphasize communication skills, empathy, and willingness to compromise. Show that you can maintain professional relationships even during disagreements.',
          type: 'conflict',
          difficulty: 'medium',
          tips: ['Focus on resolution, not the conflict', 'Demonstrate emotional intelligence', 'Show what you learned']
        }
      ]
    },
    'system-design': {
      title: 'System Design Interview Simulation',
      description: 'This interview will test your ability to design scalable systems.',
      duration: 30,
      questions: [
        {
          id: 'sd_1',
          question: 'Design a URL shortening service like TinyURL.',
          idealAnswer: 'A comprehensive answer would cover requirements clarification (read/write ratio, traffic estimates, storage needs), API design (endpoints for shortening and redirection), database schema (mapping between short and long URLs), encoding algorithm (how to generate short URLs), scalability considerations (caching, load balancing, database sharding), and handling edge cases (duplicate URLs, expired links).',
          type: 'web_service',
          difficulty: 'medium',
          tips: ['Break down the problem', 'Consider scalability from the start', 'Discuss potential bottlenecks']
        },
        {
          id: 'sd_2',
          question: 'How would you design a distributed cache system?',
          idealAnswer: 'A strong answer would cover distributed hash tables, consistency models (eventual vs. strong consistency), replication strategies, partition/sharding approaches, failure handling, eviction policies, and monitoring/metrics. Discuss trade-offs between availability, consistency, and partition tolerance (CAP theorem).',
          type: 'distributed_systems',
          difficulty: 'hard',
          tips: ['Mention the CAP theorem', 'Discuss consistency models', 'Consider failure scenarios']
        }
      ]
    },
    subject: {
      title: 'Subject-specific Interview Simulation',
      description: 'This interview will focus on specific subject knowledge.',
      duration: 20,
      questions: [
        {
          id: 'subj_dbms_1',
          question: 'Explain the ACID properties in database transactions.',
          idealAnswer: 'ACID stands for Atomicity, Consistency, Isolation, and Durability. Atomicity ensures that a transaction is treated as a single, indivisible unit that either completes entirely or not at all. Consistency ensures that a transaction brings the database from one valid state to another. Isolation ensures that concurrent transactions produce the same results as if they were executed sequentially. Durability ensures that once a transaction is committed, it remains so even in the case of system failure.',
          type: 'dbms',
          difficulty: 'medium',
          tips: ['Give examples for each property', 'Discuss trade-offs with these properties', 'Mention isolation levels']
        },
        {
          id: 'subj_oops_1',
          question: 'Explain polymorphism and give an example.',
          idealAnswer: 'Polymorphism is an OOP concept that allows objects of different classes to be treated as objects of a common superclass. It enables one interface to be used for a general class of actions. There are two types: compile-time (method overloading) and runtime (method overriding). Example: An abstract Shape class with a calculateArea() method, implemented differently in derived classes like Circle, Rectangle, and Triangle.',
          type: 'oops',
          difficulty: 'medium',
          tips: ['Distinguish between compile-time and runtime polymorphism', 'Provide a concrete code example', 'Explain benefits of polymorphism']
        }
      ]
    }
  };

  // Feedback categories for evaluating responses
  const feedbackCategories = [
    { id: 'completeness', name: 'Completeness', description: 'How thoroughly the question was answered' },
    { id: 'accuracy', name: 'Technical Accuracy', description: 'Correctness of technical information' },
    { id: 'communication', name: 'Communication', description: 'Clarity, conciseness, and structure of the response' },
    { id: 'confidence', name: 'Confidence', description: 'Confidence displayed while answering' }
  ];

  const startInterview = () => {
    if (!selectedInterviewType) return;
    
    const interview = interviews[selectedInterviewType];
    setActiveInterview(interview);
    setCurrentQuestionIndex(0);
    setUserResponses({});
    setTimeRemaining(interview.duration * 60); // Convert minutes to seconds
    setInterviewResults(null);
  };

  const handleResponseChange = (e) => {
    setCurrentResponse(e.target.value);
  };

  const submitResponse = () => {
    if (!currentResponse.trim()) return;

    setUserResponses({
      ...userResponses,
      [activeInterview.questions[currentQuestionIndex].id]: currentResponse
    });
    
    setCurrentResponse('');
    
    // Simulate AI thinking
    setIsThinking(true);
    setTimeout(() => {
      setIsThinking(false);
      if (currentQuestionIndex < activeInterview.questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        finishInterview();
      }
    }, 2000);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // In a real app, you would start/stop voice recording here
  };

  const finishInterview = () => {
    // Generate feedback for each question
    const questionEvaluations = activeInterview.questions.map(question => {
      const response = userResponses[question.id] || '';
      
      // Generate random scores for demo purposes
      // In a real app, this would use AI to evaluate responses
      const scores = {};
      feedbackCategories.forEach(category => {
        scores[category.id] = Math.floor(Math.random() * 30) + 70; // 70-100 range
      });
      
      const overallScore = Math.floor(
        Object.values(scores).reduce((sum, val) => sum + val, 0) / Object.values(scores).length
      );
      
      return {
        questionId: question.id,
        question: question.question,
        response,
        scores,
        overallScore,
        feedback: generateFeedback(question, response, scores),
        improvements: generateImprovements(question, scores)
      };
    });
    
    const overallScore = Math.floor(
      questionEvaluations.reduce((sum, item) => sum + item.overallScore, 0) / questionEvaluations.length
    );
    
    setInterviewResults({
      evaluations: questionEvaluations,
      overallScore,
      strengths: generateStrengths(questionEvaluations),
      weaknesses: generateWeaknesses(questionEvaluations),
      overallFeedback: generateOverallFeedback(overallScore)
    });
    
    setActiveInterview(null);
  };

  // Generate feedback for a response (simplified for demo)
  const generateFeedback = (question, response, scores) => {
    const avgScore = Object.values(scores).reduce((sum, val) => sum + val, 0) / Object.values(scores).length;
    
    if (avgScore >= 90) {
      return "Excellent answer! You provided a comprehensive explanation with relevant examples.";
    } else if (avgScore >= 80) {
      return "Good answer. You covered the key points, though you could add a bit more depth in some areas.";
    } else if (avgScore >= 70) {
      return "Satisfactory answer. You understood the question, but your response could be more thorough.";
    } else {
      return "Your answer needs improvement. Consider studying this topic more deeply and practicing structured responses.";
    }
  };

  // Generate improvement suggestions
  const generateImprovements = (question, scores) => {
    const improvements = [];
    
    if (scores.completeness < 80) {
      improvements.push("Include more details and examples in your answer.");
    }
    
    if (scores.accuracy < 80) {
      improvements.push("Review the technical concepts related to this question.");
    }
    
    if (scores.communication < 80) {
      improvements.push("Structure your answer more clearly with an introduction, main points, and conclusion.");
    }
    
    if (scores.confidence < 80) {
      improvements.push("Practice speaking more confidently and avoiding filler words.");
    }
    
    return improvements.length > 0 ? improvements : ["Continue practicing to maintain your performance."];
  };

  // Generate list of strengths based on evaluations
  const generateStrengths = (evaluations) => {
    const strengths = [];
    
    // Check for consistent high scores in categories
    const aggregatedScores = {};
    feedbackCategories.forEach(category => {
      const avg = evaluations.reduce((sum, res) => sum + res.scores[category.id], 0) / evaluations.length;
      aggregatedScores[category.id] = avg;
    });
    
    if (aggregatedScores.completeness >= 85) {
      strengths.push("You provide thorough and complete answers to questions.");
    }
    
    if (aggregatedScores.accuracy >= 85) {
      strengths.push("Your technical knowledge is strong and accurate.");
    }
    
    if (aggregatedScores.communication >= 85) {
      strengths.push("You communicate your ideas clearly and effectively.");
    }
    
    if (aggregatedScores.confidence >= 85) {
      strengths.push("You present your answers with confidence.");
    }
    
    return strengths.length > 0 ? strengths : ["You showed consistent effort throughout the interview."];
  };

  // Generate list of weaknesses based on evaluations
  const generateWeaknesses = (evaluations) => {
    const weaknesses = [];
    
    // Check for consistent low scores in categories
    const aggregatedScores = {};
    feedbackCategories.forEach(category => {
      const avg = evaluations.reduce((sum, res) => sum + res.scores[category.id], 0) / evaluations.length;
      aggregatedScores[category.id] = avg;
    });
    
    if (aggregatedScores.completeness < 75) {
      weaknesses.push("Your answers could be more comprehensive and detailed.");
    }
    
    if (aggregatedScores.accuracy < 75) {
      weaknesses.push("Some technical concepts need more review for accuracy.");
    }
    
    if (aggregatedScores.communication < 75) {
      weaknesses.push("Work on structuring your answers more clearly.");
    }
    
    if (aggregatedScores.confidence < 75) {
      weaknesses.push("Practice delivering answers with more confidence.");
    }
    
    return weaknesses.length > 0 ? weaknesses : ["No significant weaknesses identified."];
  };

  // Generate overall feedback
  const generateOverallFeedback = (score) => {
    if (score >= 90) {
      return "Outstanding performance! You're well-prepared for actual interviews. Your answers were thorough, technically accurate, and delivered confidently. Continue practicing to maintain this high level.";
    } else if (score >= 80) {
      return "Good performance! You demonstrated solid knowledge and communication skills. With a bit more practice on the areas noted for improvement, you'll be very well prepared for real interviews.";
    } else if (score >= 70) {
      return "You've made a good start, but there's room for improvement. Focus on the specific areas mentioned in the feedback, and consider doing more practice interviews to build confidence and structure in your responses.";
    } else {
      return "This interview identified several areas where more preparation would be beneficial. Don't be discouraged - use this feedback as a roadmap for improvement. Review the technical concepts, practice structured answers, and work on building confidence in your delivery.";
    }
  };

  // Render interview type selection
  if (!selectedInterviewType && !interviewResults) {
    return (
      <div className="py-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Mock Interviews</h2>
        <p className="text-gray-600 mb-8">
          Practice with AI-powered interviews that simulate real interview conditions.
          Choose an interview type to begin.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {interviewTypes.map(type => (
            <AnimatedCard
              key={type.id}
              onClick={() => setSelectedInterviewType(type.id)}
              className="cursor-pointer hover:shadow-lg transition-shadow border rounded-xl p-6 bg-white"
            >
              <div className="flex items-start">
                <span className="text-3xl mr-4">{type.icon}</span>
                <div>
                  <div className="flex items-center">
                    <h3 className="text-xl font-semibold text-gray-800 mr-2">{type.name}</h3>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {type.difficulty}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-2">{type.description}</p>
                </div>
              </div>
            </AnimatedCard>
          ))}
        </div>
      </div>
    );
  }

  // Render interview preparation screen
  if (selectedInterviewType && !activeInterview && !interviewResults) {
    const interview = interviews[selectedInterviewType];
    const interviewType = interviewTypes.find(t => t.id === selectedInterviewType);
    
    return (
      <div className="py-6">
        <button 
          onClick={() => setSelectedInterviewType(null)}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <span className="mr-2">←</span> Back to Interview Types
        </button>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{interview.title}</h2>
        <p className="text-gray-600 mb-8">{interview.description}</p>
        
        <div className="bg-white shadow-md rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Interview Details</h3>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="font-medium mr-2">Type:</span>
              <span>{interviewType?.name}</span>
            </li>
            <li className="flex items-start">
              <span className="font-medium mr-2">Duration:</span>
              <span>Approximately {interview.duration} minutes</span>
            </li>
            <li className="flex items-start">
              <span className="font-medium mr-2">Questions:</span>
              <span>{interview.questions.length} questions</span>
            </li>
            <li className="flex items-start">
              <span className="font-medium mr-2">Difficulty:</span>
              <span>{interviewType?.difficulty}</span>
            </li>
          </ul>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <h4 className="font-semibold text-blue-800 mb-2">Tips for Success</h4>
          <ul className="space-y-2 text-blue-700">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Find a quiet place without distractions</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Speak clearly and at a moderate pace</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Structure your answers with an intro, main points, and conclusion</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Use the STAR method (Situation, Task, Action, Result) for behavioral questions</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>You can type or record your responses (text analysis only in this demo)</span>
            </li>
          </ul>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={startInterview}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-md"
          >
            Start Interview
          </button>
        </div>
      </div>
    );
  }

  // Render active interview
  if (activeInterview) {
    const currentQuestion = activeInterview.questions[currentQuestionIndex];
    
    return (
      <div className="py-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{activeInterview.title}</h2>
          <div className="text-right">
            <div className="text-sm text-gray-600 mb-1">Question {currentQuestionIndex + 1} of {activeInterview.questions.length}</div>
            <div className="text-sm font-medium text-blue-600">
              Time Remaining: {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <div className="flex items-center mb-2">
            <div className="mr-3 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              AI
            </div>
            <h3 className="text-xl font-semibold text-gray-800">{currentQuestion.question}</h3>
          </div>
          
          {isThinking ? (
            <div className="flex items-center p-4 bg-gray-50 rounded-md mt-6">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '600ms' }}></div>
              </div>
              <span className="ml-3 text-gray-600">AI is analyzing your response...</span>
            </div>
          ) : userResponses[currentQuestion.id] ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md mt-6">
              <p className="text-green-800">Response submitted. 
              {currentQuestionIndex < activeInterview.questions.length - 1 
                ? ' Moving to next question...' 
                : ' Finishing interview...'}
              </p>
            </div>
          ) : (
            <div className="mt-6">
              <div className="mb-4">
                <label htmlFor="response" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Response
                </label>
                <textarea
                  id="response"
                  rows="6"
                  className="w-full border rounded-md p-3 focus:ring-blue-500 focus:border-blue-500 text-black"
                  placeholder="Type your response here..."
                  value={currentResponse}
                  onChange={handleResponseChange}
                ></textarea>
              </div>
              
              <div className="flex items-center justify-between">
                <button
                  onClick={toggleRecording}
                  className={`flex items-center px-4 py-2 border rounded-md ${isRecording ? 'bg-red-50 text-red-600 border-red-300' : 'hover:bg-gray-50'}`}
                >
                  <span className={`mr-2 w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}></span>
                  {isRecording ? 'Stop Recording' : 'Record Answer'}
                </button>
                
                <button
                  onClick={submitResponse}
                  disabled={!currentResponse.trim()}
                  className={`px-4 py-2 rounded-md ${!currentResponse.trim() ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                >
                  Submit Response
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render interview results
  if (interviewResults) {
    return (
      <div className="py-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Interview Feedback</h2>
        
        <div className="bg-white shadow-lg rounded-xl p-8 mb-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-semibold text-gray-800">Overall Performance</h3>
            <div className="text-4xl font-bold text-blue-600">{interviewResults.overallScore}%</div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <h4 className="font-semibold text-blue-800 mb-2">Summary</h4>
            <p className="text-blue-700">{interviewResults.overallFeedback}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">Strengths</h4>
              <ul className="space-y-2 text-green-700">
                {interviewResults.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-semibold text-amber-800 mb-2">Areas to Improve</h4>
              <ul className="space-y-2 text-amber-700">
                {interviewResults.weaknesses.map((weakness, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-amber-500 mr-2">•</span>
                    <span>{weakness}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Question-by-Question Analysis</h4>
          <div className="space-y-6">
            {interviewResults.evaluations.map((res, index) => (
              <div key={index} className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 p-4">
                  <div className="flex justify-between items-center">
                    <h5 className="font-medium text-gray-800">Question {index + 1}</h5>
                    <span className={`
                      px-3 py-1 rounded-full text-sm font-medium
                      ${res.overallScore >= 90 ? 'bg-green-100 text-green-800' : 
                        res.overallScore >= 80 ? 'bg-blue-100 text-blue-800' : 
                        res.overallScore >= 70 ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'}
                    `}>
                      Score: {res.overallScore}%
                    </span>
                  </div>
                  <p className="mt-1 text-gray-600">{res.question}</p>
                </div>
                
                <div className="p-4 border-t">
                  <div className="mb-4">
                    <h6 className="text-sm font-medium text-gray-700 mb-1">Your Response:</h6>
                    <p className="text-gray-600 bg-gray-50 p-3 rounded-md">{res.response || 'No response provided'}</p>
                  </div>
                  
                  <div className="mb-4">
                    <h6 className="text-sm font-medium text-gray-700 mb-2">Performance by Category:</h6>
                    <div className="space-y-3">
                      {feedbackCategories.map(category => (
                        <div key={category.id}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{category.name}</span>
                            <span className={`
                              font-medium
                              ${res.scores[category.id] >= 90 ? 'text-green-600' : 
                                res.scores[category.id] >= 80 ? 'text-blue-600' : 
                                res.scores[category.id] >= 70 ? 'text-yellow-600' : 'text-red-600'}
                            `}>
                              {res.scores[category.id]}%
                            </span>
                          </div>
                          <ProgressBar 
                            progress={res.scores[category.id]}
                            className="h-1 bg-gray-200"
                            barClassName={`
                              ${res.scores[category.id] >= 90 ? 'bg-green-500' : 
                                res.scores[category.id] >= 80 ? 'bg-blue-500' : 
                                res.scores[category.id] >= 70 ? 'bg-yellow-500' : 'bg-red-500'}
                            `}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h6 className="text-sm font-medium text-gray-700 mb-1">Feedback:</h6>
                    <p className="text-gray-600 mb-2">{res.feedback}</p>
                    
                    <h6 className="text-sm font-medium text-gray-700 mb-1">Improvements:</h6>
                    <ul className="list-disc text-gray-600 pl-5 space-y-1">
                      {res.improvements.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => {
              setSelectedInterviewType(null);
              setInterviewResults(null);
            }}
            className="px-6 py-3 border rounded-md hover:bg-gray-50"
          >
            Take Another Interview
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default MockInterviews; 