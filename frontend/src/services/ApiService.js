import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add JWT token to each request if available
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth services
export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const googleLogin = async (token) => {
  try {
    const response = await api.post('/auth/google', { token });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Subject services
export const getAllSubjects = async () => {
  try {
    const response = await api.get('/subject');
    return response.data.subjects;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getSubjectById = async (id) => {
  try {
    const response = await api.get(`/subject/${id}`);
    return response.data.subject;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Topic services
export const getTopicsBySubject = async (subjectId) => {
  try {
    const response = await api.get(`/topic?subject=${subjectId}`);
    return response.data.topics;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getTopicById = async (id) => {
  try {
    const response = await api.get(`/topic/${id}`);
    return response.data.topic;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const markTopicAsCompleted = async (id) => {
  try {
    const response = await api.post(`/topic/${id}/complete`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Quiz services
export const getAllQuizzes = async () => {
  try {
    const response = await api.get('/quiz');
    return response.data.quizzes;
  } catch (error) {
    console.error('Quiz API Error:', error);
    
    // Create a more detailed error object
    const enhancedError = {
      message: error.response?.data?.message || error.message || 'Unknown error',
      status: error.response?.status,
      data: error.response?.data,
      isAxiosError: error.isAxiosError
    };
    
    throw enhancedError;
  }
};

export const getQuizById = async (id) => {
  try {
    const response = await api.get(`/quiz/${id}`);
    return response.data.quiz;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const submitQuizAttempt = async (quizId, answers, timeTaken, questionCount) => {
  try {
    // Get user ID from localStorage if available
    let userId = null;
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        userId = user._id;
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
      }
    }
    
    // Check if token exists before making the request
    const token = localStorage.getItem('token');
    if (!token) {
      throw { 
        status: 401, 
        message: 'Authentication token is missing. Please log in again.' 
      };
    }
    
    const response = await api.post('/quiz/submit', { 
      quizId, 
      answers, 
      timeTaken,
      userId, // Include userId in request body as fallback
      questionCount // Pass the actual number of questions attempted
    });
    return response.data;
  } catch (error) {
    console.error('Quiz submission error:', error);
    
    // Create a more detailed error object
    const enhancedError = {
      message: error.response?.data?.message || error.message || 'Unknown error',
      status: error.response?.status,
      data: error.response?.data,
      isAxiosError: error.isAxiosError
    };
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      // Clear invalid token
      localStorage.removeItem('token');
      enhancedError.message = 'Your session has expired. Please log in again.';
    }
    
    throw enhancedError;
  }
};

// Mock Test services
export const getAllMockTests = async () => {
  try {
    const response = await api.get('/mock-test');
    return response.data.mockTests;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getMockTestById = async (id) => {
  try {
    const response = await api.get(`/mock-test/${id}`);
    return response.data.mockTest;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getMockTestsBySubject = async (subjectId) => {
  try {
    const response = await api.get(`/mock-test/by-subject/${subjectId}`);
    return response.data.mockTests;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getSeededMockTestsBySubject = async (subjectId) => {
  try {
    const response = await api.get(`/mock-test/seeded-by-subject/${subjectId}`);
    return response.data.mockTests;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const generateCustomMockTest = async (subjects, numberOfQuestions = 20) => {
  try {
    // Get user ID from localStorage if available
    let userId = null;
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        userId = user._id;
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
      }
    }
    
    const response = await api.post('/mock-test/generate-custom', { 
      subjects, 
      numberOfQuestions,
      userId // Include userId in request body as fallback
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const submitMockTestAttempt = async (testId, answers, timeTaken, scoreData) => {
  try {
    // Get user ID from localStorage if available
    let userId = null;
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        userId = user._id;
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
      }
    }
    
    console.log('Submitting mock test attempt:', { testId, answers, timeTaken, scoreData });
    
    // Extract section-wise scores if available
    const sectionWiseScores = scoreData?.sectionWiseScores || [];
    
    const response = await api.post('/mock-test/submit', { 
      testId, 
      answers,
      userId, // Include userId in request body as fallback
      timeTaken, // Include the time taken to complete the test
      scoreData, // Include the score data calculated on the frontend
      sectionWiseScores // Include section-wise scores for subject tracking
    });
    
    console.log('Mock test submission response:', response.data);
    
    // Ensure results are properly structured
    if (response.data && !response.data.results) {
      console.warn('No results in API response, creating default structure');
      // Create a default structure if results are missing
      response.data.results = [];
    }
    
    return response.data;
  } catch (error) {
    console.error('Error submitting mock test:', error);
    throw error.response?.data || error.message;
  }
};

// Interview services
export const getAllInterviews = async () => {
  try {
    const response = await api.get('/interview');
    return response.data.interviews;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getInterviewById = async (id) => {
  try {
    const response = await api.get(`/interview/${id}`);
    return response.data.interview;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const submitInterviewAttempt = async (interviewId, answers) => {
  try {
    const response = await api.post('/interview/submit', { interviewId, answers });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Resume services
export const getUserResumes = async () => {
  try {
    const response = await api.get('/resume');
    return response.data.resumes;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const uploadResume = async (resumeData) => {
  try {
    const response = await api.post('/resume/upload', resumeData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const analyzeResume = async (resumeId) => {
  try {
    const response = await api.post(`/resume/${resumeId}/analyze`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// User services
export const getUserProfile = async () => {
  try {
    const response = await api.get('/user/profile');
    return response.data.user;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateUserProfile = async (userData) => {
  try {
    const response = await api.put('/user/profile', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getQuizHistory = async () => {
  try {
    const response = await api.get('/user/quiz-history');
    return response.data.quizHistory;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getMockTestHistory = async () => {
  try {
    const response = await api.get('/user/mock-test-history');
    return response.data.mockTestHistory;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Daily Topic services
export const getTodayTopic = async () => {
  try {
    const response = await api.get('/daily-topic/today');
    return response.data.topic;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Leaderboard services
export const getGlobalLeaderboard = async () => {
  try {
    const response = await api.get('/leaderboard');
    return response.data.leaderboard;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export default api; 