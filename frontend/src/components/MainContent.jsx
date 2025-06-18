import React from 'react';
import { useApp } from '../contexts/AppContext';
import Dashboard from './modules/Dashboard';
import Subjects from './modules/Subjects';
import DailyTopic from './modules/DailyTopic';

const MainContent = () => {
    const { state } = useApp();

    const renderContent = () => {
        switch (state.activeModule) {
            case 'dashboard':
                return <Dashboard />;
            case 'subjects':
                return <Subjects />;
            case 'daily-topic':
                return <DailyTopic />;
            case 'quizzes':
                return (
                    <div className="text-center py-12">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Quizzes Module</h2>
                        <p className="text-gray-600">Coming soon - Interactive quizzes with different strategies</p>
                    </div>
                );
            case 'mock-tests':
                return (
                    <div className="text-center py-12">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Mock Tests Module</h2>
                        <p className="text-gray-600">Coming soon - Comprehensive mock examinations</p>
                    </div>
                );
            case 'resume-analyzer':
                return (
                    <div className="text-center py-12">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Resume Analyzer</h2>
                        <p className="text-gray-600">Coming soon - AI-powered resume analysis</p>
                    </div>
                );
            case 'mock-interviews':
                return (
                    <div className="text-center py-12">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Mock Interviews</h2>
                        <p className="text-gray-600">Coming soon - AI-based interview practice</p>
                    </div>
                );
            case 'leaderboard':
                return (
                    <div className="text-center py-12">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Leaderboard</h2>
                        <p className="text-gray-600">Coming soon - Compete with other learners</p>
                    </div>
                );
            case 'analytics':
                return (
                    <div className="text-center py-12">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Analytics</h2>
                        <p className="text-gray-600">Coming soon - Detailed progress analytics</p>
                    </div>
                );
            case 'profile':
                return (
                    <div className="text-center py-12">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Profile</h2>
                        <p className="text-gray-600">Coming soon - Manage your profile and preferences</p>
                    </div>
                );
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