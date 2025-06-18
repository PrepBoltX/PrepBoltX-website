import React, { createContext, useContext, useReducer } from 'react';
import UserManager from '../services/UserManager';

const initialState = {
    user: null,
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
            id: 'business-aptitude',
            name: 'Business Aptitude',
            icon: 'TrendingUp',
            color: 'bg-red-500',
            progress: 55,
            totalTopics: 18,
            completedTopics: 10
        }
    ],
    dailyTopic: {
        id: '1',
        title: 'Understanding Database Normalization',
        content: 'Learn the fundamentals of database normalization and its importance in designing efficient databases.',
        subject: 'dbms',
        date: new Date().toISOString(),
        duration: 2,
        videoUrl: 'https://example.com/video'
    },
    isLoading: false,
    activeModule: 'dashboard'
};

const appReducer = (state, action) => {
    switch (action.type) {
        case 'SET_USER':
            UserManager.getInstance().setCurrentUser(action.payload);
            return { ...state, user: action.payload };
        case 'SET_SUBJECTS':
            return { ...state, subjects: action.payload };
        case 'SET_DAILY_TOPIC':
            return { ...state, dailyTopic: action.payload };
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };
        case 'SET_ACTIVE_MODULE':
            return { ...state, activeModule: action.payload };
        case 'UPDATE_SUBJECT_PROGRESS':
            return {
                ...state,
                subjects: state.subjects.map(subject =>
                    subject.id === action.payload.subjectId
                        ? { ...subject, progress: action.payload.progress }
                        : subject
                )
            };
        default:
            return state;
    }
};

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
    const [state, dispatch] = useReducer(appReducer, initialState);

    return (
        <AppContext.Provider value={{ state, dispatch }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
}; 