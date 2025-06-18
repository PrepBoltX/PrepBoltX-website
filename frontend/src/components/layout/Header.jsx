import React from 'react';
import { Bell, Search, Settings } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

const Header = () => {
    const { state } = useApp();

    return (
        <header className="bg-white shadow-sm border-b border-gray-100 fixed top-0 right-0 left-64 z-40">
            <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex-1 max-w-lg">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search courses, topics, or questions..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                            <Bell className="w-6 h-6" />
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                        </button>

                        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                            <Settings className="w-6 h-6" />
                        </button>

                        <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-800">
                                    {state.user?.name || 'John Doe'}
                                </p>
                                <p className="text-xs text-gray-500">Level {state.user?.level || 5}</p>
                            </div>
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-semibold">
                                    {(state.user?.name || 'JD').split(' ').map(n => n[0]).join('')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header; 