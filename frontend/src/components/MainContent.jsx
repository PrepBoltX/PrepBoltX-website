import React from 'react';
import { useApp } from '../contexts/AppContext';
import Dashboard from './modules/Dashboard';
import Subjects from './modules/Subjects';
import DailyTopic from './modules/DailyTopic';
import Quizzes from './modules/Quizzes';
import MockTests from './modules/MockTests';
import ResumeAnalyzer from './modules/ResumeAnalyzer';
import MockInterviews from './modules/MockInterviews';
import Leaderboard from './modules/Leaderboard';
import UserProfile from './modules/UserProfile';

const MainContent = () => {
    const { state } = useApp();

    const renderContent = () => {
        switch (state.currentModule) {
            case 'dashboard':
                return <Dashboard />;
            case 'subjects':
                return <Subjects />;
            case 'daily-topic':
                return <DailyTopic />;
            case 'quizzes':
                return <Quizzes />;
            case 'mock-tests':
                return <MockTests />;
            case 'resume-analyzer':
                return <ResumeAnalyzer />;
            case 'mock-interviews':
                return <MockInterviews />;
            case 'leaderboard':
                return <Leaderboard />;
            case 'analytics':
                return (
                    <div className="text-center py-12">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Analytics</h2>
                        <p className="text-gray-600">Coming soon - Detailed progress analytics</p>
                    </div>
                );
            case 'profile':
                return <UserProfile />;
            default:
                return <Dashboard />;
        }
    };

    return (
        <main className="ml-64 mt-20 p-6 min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto">
                {renderContent()}
            </div>
        </main>
    );
};

export default MainContent; 