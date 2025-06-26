const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables if not already loaded
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * OpenTrivia API integration
 * Used for general knowledge and aptitude questions
 */
const fetchOpenTriviaQuestions = async (category, amount = 10, difficulty = 'medium') => {
  try {
    // Category mapping:
    // 9=General Knowledge, 18=Computers, 19=Mathematics
    const categoryMap = {
      'aptitude': 19,
      'oops': 18, 
      'dbms': 18,
      'system design': 18,
      'operating system': 9,
      'default': 9
    };

    const apiCategory = categoryMap[category.toLowerCase()] || categoryMap.default;
    
    const response = await axios.get('https://opentdb.com/api.php', {
      params: {
        amount,
        category: apiCategory,
        difficulty,
        type: 'multiple'
      }
    });

    if (response.data.response_code !== 0) {
      console.error('OpenTrivia API error code:', response.data.response_code);
      return null;
    }
    
    return response.data.results.map(item => ({
      question: item.question,
      options: [...item.incorrect_answers, item.correct_answer],
      correctAnswer: item.correct_answer,
      explanation: 'Explanation not available from this API source.'
    }));
  } catch (error) {
    console.error('Error fetching from OpenTrivia:', error);
    return null;
  }
};

/**
 * QuizAPI integration
 * Best for programming and technology questions
 */
const fetchQuizApiQuestions = async (topic, limit = 10) => {
  try {
    // Map our topics to QuizAPI categories
    const topicMap = {
      'oops': 'programming',
      'dbms': 'sql',
      'system design': 'devops',
      'operating system': 'linux',
      'default': 'programming'
    };

    const apiTopic = topicMap[topic.toLowerCase()] || topicMap.default;
    
    // You need to get an API key from https://quizapi.io/
    // Add it to your .env file as QUIZ_API_KEY
    const response = await axios.get('https://quizapi.io/api/v1/questions', {
      params: {
        apiKey: process.env.QUIZ_API_KEY || 'YOUR_API_KEY', 
        category: apiTopic,
        limit,
        difficulty: 'Medium'
      }
    });
    
    return response.data.map(question => ({
      question: question.question,
      options: Object.values(question.answers)
        .filter(answer => answer !== null)
        .map(answer => answer.toString()),
      correctAnswer: Object.keys(question.correct_answers)
        .find(key => question.correct_answers[key] === 'true')
        ?.replace('_correct', '') || '',
      explanation: question.explanation || 'Explanation not available.'
    }));
  } catch (error) {
    console.error('Error fetching from QuizAPI:', error);
    return null;
  }
};

/**
 * Get questions for a specific subject using the appropriate API
 */
const getQuestionsForSubject = async (subject, amount = 10, difficulty = 'medium') => {
  const subjectLower = subject.toLowerCase();
  
  try {
    // Try to get technical questions from QuizAPI for programming subjects
    if (['oops', 'dbms', 'system design', 'operating system'].includes(subjectLower)) {
      const quizApiQuestions = await fetchQuizApiQuestions(subjectLower, amount);
      if (quizApiQuestions && quizApiQuestions.length > 0) {
        return quizApiQuestions;
      }
    }
    
    // For all subjects or as fallback, try OpenTrivia API
    const openTriviaQuestions = await fetchOpenTriviaQuestions(subjectLower, amount, difficulty);
    if (openTriviaQuestions && openTriviaQuestions.length > 0) {
      return openTriviaQuestions;
    }
    
    // If both APIs fail, return an error
    console.error(`Failed to fetch questions for ${subject} from any API`);
    return null;
  } catch (error) {
    console.error(`Error in getQuestionsForSubject for ${subject}:`, error);
    return null;
  }
};

module.exports = {
  fetchOpenTriviaQuestions,
  fetchQuizApiQuestions,
  getQuestionsForSubject
}; 