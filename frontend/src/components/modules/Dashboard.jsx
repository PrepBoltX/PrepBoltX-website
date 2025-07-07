import React from 'react';
import { TrendingUp, Award, Target, Calendar, BookOpen, Brain } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import AnimatedCard from '../common/AnimatedCard';
import ProgressBar from '../common/ProgressBar';

const Dashboard = () => {
    const { state, dispatch } = useApp();

    const stats = [
        {
            title: 'Total Points',
            value: '2,847',
            change: '+12%',
            icon: Award,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50'
        },
        {
            title: 'Completed Tests',
            value: '47',
            change: '+8%',
            icon: Target,
            color: 'text-green-600',
            bgColor: 'bg-green-50'
        },
        {
            title: 'Study Streak',
            value: '15',
            change: '+1',
            icon: Calendar,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50'
        },
        {
            title: 'Avg. Score',
            value: '87%',
            change: '+5%',
            icon: TrendingUp,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
        }
    ];

    const recentActivities = [
        { id: 1, activity: 'Completed DBMS Quiz', time: '2 hours ago', score: 92 },
        { id: 2, activity: 'Attempted System Design Mock', time: '1 day ago', score: 78 },
        { id: 3, activity: 'Studied OOPs Concepts', time: '2 days ago', score: null },
        { id: 4, activity: 'Mock Interview - Technical', time: '3 days ago', score: 85 }
    ];

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-2xl p-8 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2">
                        Welcome back, {state.user?.name || 'John'}! 👋
                    </h1>
                    <p className="text-blue-100 text-lg mb-6">
                        Ready to continue your learning journey? Let's make today count!
                    </p>

                    {state.dailyTopic && (
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold mb-1">Today's 2-Minute Topic</h3>
                                    <p className="text-blue-100">{state.dailyTopic.title}</p>
                                </div>
                                <button
                                    onClick={() => dispatch({ type: 'SET_ACTIVE_MODULE', payload: 'daily-topic' })}
                                    className="bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                                >
                                    Start Learning
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Decorative Elements */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/5 rounded-full"></div>
                <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-white/5 rounded-full"></div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <AnimatedCard key={`stat-${stat.title}`} delay={index * 100}>
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                                        <Icon className={`w-6 h-6 ${stat.color}`} />
                                    </div>
                                    <span className="text-green-600 text-sm font-medium">{stat.change}</span>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</h3>
                                <p className="text-gray-600">{stat.title}</p>
                            </div>
                        </AnimatedCard>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Subject Progress */}
                <AnimatedCard delay={400} key="subject-progress">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-800">Subject Progress</h2>
                            <button
                                onClick={() => dispatch({ type: 'SET_ACTIVE_MODULE', payload: 'subjects' })}
                                className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                                View All
                            </button>
                        </div>

                        <div className="space-y-4">
                            {state.subjects.slice(0, 4).map((subject, index) => (
                                <div key={subject._id || `subject-${index}`} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-3 h-3 rounded-full ${subject.color}`}></div>
                                            <span className="font-medium text-gray-700">{subject.name}</span>
                                        </div>
                                        <span className="text-sm text-gray-500">{subject.progress}%</span>
                                    </div>
                                    <ProgressBar progress={subject.progress} />
                                </div>
                            ))}
                        </div>
                    </div>
                </AnimatedCard>

                {/* Recent Activity */}
                <AnimatedCard delay={500} key="recent-activity">
                    <div className="p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">Recent Activity</h2>

                        <div className="space-y-4">
                            {recentActivities.map((activity, index) => (
                                <div key={`activity-${activity.id || index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-800">{activity.activity}</p>
                                        <p className="text-sm text-gray-500">{activity.time}</p>
                                    </div>
                                    {activity.score && (
                                        <div className="text-right">
                                            <span className="text-lg font-bold text-green-600">{activity.score}%</span>
                                            <p className="text-xs text-gray-500">Score</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </AnimatedCard>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <AnimatedCard delay={600} onClick={() => dispatch({ type: 'SET_ACTIVE_MODULE', payload: 'quizzes' })} key="quick-action-quiz">
                    <div className="p-6 text-center">
                        <Brain className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Take a Quiz</h3>
                        <p className="text-gray-600">Test your knowledge with interactive quizzes</p>
                    </div>
                </AnimatedCard>

                <AnimatedCard delay={700} onClick={() => dispatch({ type: 'SET_ACTIVE_MODULE', payload: 'mock-tests' })} key="quick-action-mock">
                    <div className="p-6 text-center">
                        <Target className="w-12 h-12 text-green-600 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Mock Test</h3>
                        <p className="text-gray-600">Practice with full-length mock examinations</p>
                    </div>
                </AnimatedCard>

                <AnimatedCard delay={800} onClick={() => dispatch({ type: 'SET_ACTIVE_MODULE', payload: 'subjects' })} key="quick-action-study">
                    <div className="p-6 text-center">
                        <BookOpen className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Study Topics</h3>
                        <p className="text-gray-600">Explore comprehensive study materials</p>
                    </div>
                </AnimatedCard>
            </div>
        </div>
    );
};

export default Dashboard; 