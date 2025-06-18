import React from 'react';
import { ArrowRight, Clock, CheckCircle, BookOpen } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import AnimatedCard from '../common/AnimatedCard';
import ProgressBar from '../common/ProgressBar';

const Subjects = () => {
    const { state, dispatch } = useApp();

    const handleSubjectClick = (subjectId) => {
        // Navigate to specific subject content
        console.log(`Opening subject: ${subjectId}`);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Subjects</h1>
                    <p className="text-gray-600 mt-2">Master the fundamentals with comprehensive study materials</p>
                </div>

                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">Overall Progress</span>
                        <span className="text-lg font-bold">67%</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {state.subjects.map((subject, index) => (
                    <AnimatedCard
                        key={subject.id}
                        delay={index * 100}
                        onClick={() => handleSubjectClick(subject.id)}
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-lg ${subject.color} bg-opacity-10`}>
                                    <div className={`w-8 h-8 ${subject.color} rounded-lg flex items-center justify-center`}>
                                        <BookOpen className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                            </div>

                            <h3 className="text-xl font-bold text-gray-800 mb-2">{subject.name}</h3>

                            <div className="space-y-3 mb-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Progress</span>
                                    <span className="font-medium text-gray-800">{subject.progress}%</span>
                                </div>
                                <ProgressBar progress={subject.progress} color={subject.color} />
                            </div>

                            <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                                <div className="flex items-center space-x-1">
                                    <CheckCircle className="w-4 h-4" />
                                    <span>{subject.completedTopics} completed</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{subject.totalTopics - subject.completedTopics} remaining</span>
                                </div>
                            </div>

                            <div className="flex space-x-2">
                                <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                                    Study
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        dispatch({ type: 'SET_ACTIVE_MODULE', payload: 'quizzes' });
                                    }}
                                    className="flex-1 border border-blue-600 text-blue-600 py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                                >
                                    Quiz
                                </button>
                            </div>
                        </div>
                    </AnimatedCard>
                ))}
            </div>

            {/* Study Resources */}
            <div className="mt-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Study Resources</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { title: 'Notes', description: 'Comprehensive study notes', icon: BookOpen, color: 'bg-blue-500' },
                        { title: 'Flashcards', description: 'Quick revision cards', icon: CheckCircle, color: 'bg-green-500' },
                        { title: 'Practice Questions', description: 'Topic-wise questions', icon: ArrowRight, color: 'bg-purple-500' },
                        { title: 'Video Lectures', description: 'Expert explanations', icon: Clock, color: 'bg-orange-500' }
                    ].map((resource, index) => {
                        const Icon = resource.icon;
                        return (
                            <AnimatedCard key={resource.title} delay={600 + index * 100}>
                                <div className="p-6 text-center">
                                    <div className={`w-12 h-12 ${resource.color} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-2">{resource.title}</h3>
                                    <p className="text-gray-600 text-sm">{resource.description}</p>
                                </div>
                            </AnimatedCard>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Subjects; 