import React, { useState, useEffect } from 'react';
import { Play, Clock, BookOpen, CheckCircle, ArrowRight } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import AnimatedCard from '../common/AnimatedCard';
import ProgressBar from '../common/ProgressBar';

const DailyTopic = () => {
    const { state } = useApp();
    const [timeRemaining, setTimeRemaining] = useState(120); // 2 minutes in seconds
    const [isPlaying, setIsPlaying] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);

    useEffect(() => {
        let interval;

        if (isPlaying && timeRemaining > 0) {
            interval = setInterval(() => {
                setTimeRemaining((prev) => {
                    if (prev <= 1) {
                        setIsCompleted(true);
                        setIsPlaying(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [isPlaying, timeRemaining]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = ((120 - timeRemaining) / 120) * 100;

    if (!state.dailyTopic) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">No daily topic available</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Today's 2-Minute Learning</h1>
                <p className="text-gray-600">Quick daily dose of knowledge to keep you sharp</p>
            </div>

            {/* Main Content */}
            <AnimatedCard>
                <div className="p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">{state.dailyTopic.title}</h2>
                                <p className="text-gray-600 capitalize">{state.dailyTopic.subject} • {state.dailyTopic.duration} min read</p>
                            </div>
                        </div>

                        <div className="text-right">
                            <div className="text-3xl font-bold text-blue-600">{formatTime(timeRemaining)}</div>
                            <p className="text-sm text-gray-500">Time Remaining</p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-6">
                        <ProgressBar progress={progress} animated={isPlaying} />
                    </div>

                    {/* Content */}
                    <div className={`prose max-w-none transition-opacity duration-300 ${isPlaying ? 'opacity-100' : 'opacity-75'}`}>
                        <p className="text-lg text-gray-700 leading-relaxed mb-6">
                            {state.dailyTopic.content}
                        </p>

                        {isPlaying && (
                            <div className="space-y-4 animate-fadeIn">
                                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                                    <h3 className="font-bold text-blue-900 mb-2">Key Points:</h3>
                                    <ul className="text-blue-800 space-y-1">
                                        <li>• Database normalization reduces data redundancy</li>
                                        <li>• First Normal Form (1NF) eliminates duplicate columns</li>
                                        <li>• Higher normal forms ensure better data integrity</li>
                                        <li>• Proper normalization improves query performance</li>
                                    </ul>
                                </div>

                                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                                    <h3 className="font-bold text-green-900 mb-2">Quick Example:</h3>
                                    <p className="text-green-800">
                                        Instead of storing customer address in every order record,
                                        create a separate customers table and reference it with a foreign key.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-center space-x-4 mt-8">
                        {!isCompleted ? (
                            <button
                                onClick={() => setIsPlaying(!isPlaying)}
                                className={`flex items-center space-x-2 px-8 py-3 rounded-lg font-medium transition-all duration-300 ${isPlaying
                                        ? 'bg-red-500 hover:bg-red-600 text-white'
                                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                                    }`}
                            >
                                <Play className={`w-5 h-5 ${isPlaying ? 'rotate-90' : ''} transition-transform`} />
                                <span>{isPlaying ? 'Pause Learning' : 'Start Learning'}</span>
                            </button>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2 text-green-600">
                                    <CheckCircle className="w-6 h-6" />
                                    <span className="font-medium">Completed!</span>
                                </div>
                                <button
                                    onClick={() => {
                                        setTimeRemaining(120);
                                        setIsCompleted(false);
                                        setIsPlaying(false);
                                    }}
                                    className="text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Review Again
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </AnimatedCard>

            {/* Related Actions */}
            {isCompleted && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AnimatedCard delay={300}>
                        <div className="p-6 text-center">
                            <Clock className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Take a Quiz</h3>
                            <p className="text-gray-600 mb-4">Test your understanding of today's topic</p>
                            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                                Start Quiz
                            </button>
                        </div>
                    </AnimatedCard>

                    <AnimatedCard delay={400}>
                        <div className="p-6 text-center">
                            <ArrowRight className="w-12 h-12 text-green-600 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Explore More</h3>
                            <p className="text-gray-600 mb-4">Dive deeper into {state.dailyTopic.subject}</p>
                            <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                                View Subject
                            </button>
                        </div>
                    </AnimatedCard>
                </div>
            )}
        </div>
    );
};

export default DailyTopic; 