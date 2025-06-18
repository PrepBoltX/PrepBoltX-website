import React from 'react';
import {
    Home,
    BookOpen,
    Brain,
    FileText,
    MessageSquare,
    Award,
    User,
    BarChart3,
    Target,
    Calendar
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

const Sidebar = () => {
    const { state, dispatch } = useApp();

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
        { id: 'subjects', label: 'Subjects', icon: BookOpen },
        { id: 'quizzes', label: 'Quizzes', icon: Brain },
        { id: 'mock-tests', label: 'Mock Tests', icon: Target },
        { id: 'resume-analyzer', label: 'Resume Analyzer', icon: FileText },
        { id: 'mock-interviews', label: 'Mock Interviews', icon: MessageSquare },
        { id: 'leaderboard', label: 'Leaderboard', icon: Award },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'daily-topic', label: 'Daily Topic', icon: Calendar },
        { id: 'profile', label: 'Profile', icon: User },
    ];

    const handleModuleChange = (moduleId) => {
        dispatch({ type: 'SET_ACTIVE_MODULE', payload: moduleId });
    };

    return (
        <div className="w-64 bg-white shadow-xl h-screen fixed left-0 top-0 z-50 border-r border-gray-100">
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">StudyPro</h1>
                        <p className="text-sm text-gray-500">Advanced Learning</p>
                    </div>
                </div>
            </div>

            <nav className="mt-6 px-4">
                {menuItems.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = state.activeModule === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => handleModuleChange(item.id)}
                            className={`
                w-full flex items-center space-x-3 px-4 py-3 rounded-lg mb-2
                transition-all duration-200 ease-in-out group
                ${isActive
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                                }
              `}
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'group-hover:text-blue-600'}`} />
                            <span className="font-medium">{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            <div className="absolute bottom-6 left-4 right-4">
                <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-lg p-4 text-white">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Daily Streak</span>
                        <span className="text-lg font-bold">15🔥</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                        <div className="bg-white rounded-full h-2 w-3/4"></div>
                    </div>
                    <p className="text-xs mt-2 opacity-90">Keep it up! 3 more days for next level</p>
                </div>
            </div>
        </div>
    );
};

export default Sidebar; 