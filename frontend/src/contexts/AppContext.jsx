import React, { createContext, useContext, useReducer, useEffect } from 'react';
import UserManager from '../services/UserManager';

// Initial state for the app
const initialState = {
    currentModule: 'dashboard',
    isAuthenticated: false,
    user: null,
    token: null,
    theme: localStorage.getItem('theme') || 'light',
    loading: {
        global: false,
        subjects: false,
        quizzes: false,
    },
    subjects: [
        {
            id: 'dbms',
            name: 'Database Management',
            icon: 'Database',
            color: 'bg-blue-500',
            progress: 65,
            totalTopics: 25,
            completedTopics: 16
        },
        {
            id: 'oops',
            name: 'Object Oriented Programming',
            icon: 'Code2',
            color: 'bg-green-500',
            progress: 80,
            totalTopics: 20,
            completedTopics: 16
        },
        {
            id: 'system-design',
            name: 'System Design',
            icon: 'Network',
            color: 'bg-purple-500',
            progress: 45,
            totalTopics: 30,
            completedTopics: 14
        },
        {
            id: 'aptitude',
            name: 'Aptitude',
            icon: 'Calculator',
            color: 'bg-orange-500',
            progress: 90,
            totalTopics: 15,
            completedTopics: 13
        },
        {
            id: 'operating-system',
            name: 'Operating System',
            icon: 'TrendingUp',
            color: 'bg-red-500',
            progress: 55,
            totalTopics: 18,
            completedTopics: 10
        }
    ],
    quizzes: [],
    mockTests: [],
    interviews: [],
    dailyTopic: null,
    currentQuiz: null,
    currentMockTest: null,
    currentInterview: null,
    userProgress: null,
    notifications: [],
    error: null,
};

// Create the context
const AppContext = createContext();

// Action types
const SET_CURRENT_MODULE = 'SET_CURRENT_MODULE';
const LOGIN = 'LOGIN';
const LOGOUT = 'LOGOUT';
const SET_THEME = 'SET_THEME';
const SET_LOADING = 'SET_LOADING';
const SET_SUBJECTS = 'SET_SUBJECTS';
const SET_QUIZZES = 'SET_QUIZZES';
const SET_MOCK_TESTS = 'SET_MOCK_TESTS';
const SET_INTERVIEWS = 'SET_INTERVIEWS';
const SET_DAILY_TOPIC = 'SET_DAILY_TOPIC';
const SET_CURRENT_QUIZ = 'SET_CURRENT_QUIZ';
const SET_CURRENT_MOCK_TEST = 'SET_CURRENT_MOCK_TEST';
const SET_CURRENT_INTERVIEW = 'SET_CURRENT_INTERVIEW';
const UPDATE_USER_PROGRESS = 'UPDATE_USER_PROGRESS';
const ADD_NOTIFICATION = 'ADD_NOTIFICATION';
const REMOVE_NOTIFICATION = 'REMOVE_NOTIFICATION';
const SET_ERROR = 'SET_ERROR';
const CLEAR_ERROR = 'CLEAR_ERROR';

// Reducer function to handle state updates
const appReducer = (state, action) => {
    switch (action.type) {
        case SET_CURRENT_MODULE:
            return { ...state, currentModule: action.payload };
        case LOGIN:
            localStorage.setItem('token', action.payload.token);
            localStorage.setItem('user', JSON.stringify(action.payload.user));
            return {
                ...state,
                isAuthenticated: true,
                user: action.payload.user,
                token: action.payload.token,
            };
        case LOGOUT:
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return {
                ...state,
                isAuthenticated: false,
                user: null,
                token: null,
            };
        case SET_THEME:
            localStorage.setItem('theme', action.payload);
            return { ...state, theme: action.payload };
        case SET_LOADING:
            return {
                ...state,
                loading: { ...state.loading, [action.payload.key]: action.payload.value },
            };
        case SET_SUBJECTS:
            return { ...state, subjects: action.payload };
        case SET_QUIZZES:
            return { ...state, quizzes: action.payload };
        case SET_MOCK_TESTS:
            return { ...state, mockTests: action.payload };
        case SET_INTERVIEWS:
            return { ...state, interviews: action.payload };
        case SET_DAILY_TOPIC:
            return { ...state, dailyTopic: action.payload };
        case SET_CURRENT_QUIZ:
            return { ...state, currentQuiz: action.payload };
        case SET_CURRENT_MOCK_TEST:
            return { ...state, currentMockTest: action.payload };
        case SET_CURRENT_INTERVIEW:
            return { ...state, currentInterview: action.payload };
        case UPDATE_USER_PROGRESS:
            // Create a new user object with updated quiz progress
            let updatedUser = { ...state.user };
            
            // Handle quiz completion
            if (action.payload.quizCompleted && updatedUser) {
                // Add the quiz to the user's completed quizzes if not already there
                if (!updatedUser.quizAttempts) {
                    updatedUser.quizAttempts = [];
                }
                
                // Add the quiz result to the user's quiz attempts
                if (action.payload.quizResult) {
                    updatedUser.quizAttempts.push(action.payload.quizResult);
                }
                
                // Update subject progress if applicable
                if (state.currentQuiz && state.currentQuiz.subject) {
                    const subjectIndex = updatedUser.subjects?.findIndex(
                        s => s.subjectId === state.currentQuiz.subject._id
                    );
                    
                    if (subjectIndex !== -1 && subjectIndex !== undefined) {
                        if (!updatedUser.subjects[subjectIndex].quizzesCompleted) {
                            updatedUser.subjects[subjectIndex].quizzesCompleted = [];
                        }
                        
                        if (!updatedUser.subjects[subjectIndex].quizzesCompleted.includes(action.payload.quizCompleted)) {
                            updatedUser.subjects[subjectIndex].quizzesCompleted.push(action.payload.quizCompleted);
                        }
                    } else if (updatedUser.subjects) {
                        updatedUser.subjects.push({
                            subjectId: state.currentQuiz.subject._id,
                            progress: 0,
                            quizzesCompleted: [action.payload.quizCompleted]
                        });
                    }
                }
                
                // Update local storage
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }
            
            return { 
                ...state, 
                user: updatedUser,
                userProgress: {
                    ...state.userProgress,
                    ...action.payload
                }
            };
        case ADD_NOTIFICATION:
            return {
                ...state,
                notifications: [...state.notifications, action.payload],
            };
        case REMOVE_NOTIFICATION:
            return {
                ...state,
                notifications: state.notifications.filter(
                    (notification) => notification.id !== action.payload
                ),
            };
        case SET_ERROR:
            return { ...state, error: action.payload };
        case CLEAR_ERROR:
            return { ...state, error: null };
        default:
            return state;
    }
};

// Provider component
export const AppProvider = ({ children }) => {
    const [state, dispatch] = useReducer(appReducer, initialState);

    // Check for saved authentication on mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');

        if (token && user) {
            dispatch({
                type: LOGIN,
                payload: { token, user: JSON.parse(user) },
            });
        }
    }, []);

    return (
        <AppContext.Provider value={{ state, dispatch }}>
            {children}
        </AppContext.Provider>
    );
};

// Custom hook to use the AppContext
export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};

export default AppContext; 