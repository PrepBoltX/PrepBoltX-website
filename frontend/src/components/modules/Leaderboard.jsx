import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import ProgressBar from '../common/ProgressBar';

const Leaderboard = () => {
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState('overall');
  const [timeRange, setTimeRange] = useState('week');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Sample tabs for leaderboard categories
  const tabs = [
    { id: 'overall', name: 'Overall' },
    { id: 'quizzes', name: 'Quizzes' },
    { id: 'mock-tests', name: 'Mock Tests' },
    { id: 'streaks', name: 'Streaks' },
    { id: 'subjects', name: 'Subjects' }
  ];

  // Sample time range options
  const timeRanges = [
    { id: 'week', name: 'This Week' },
    { id: 'month', name: 'This Month' },
    { id: 'year', name: 'This Year' },
    { id: 'all', name: 'All Time' }
  ];

  // Generate mock leaderboard data
  useEffect(() => {
    const fetchLeaderboardData = () => {
      setIsLoading(true);
      
      // Simulate API call delay
      setTimeout(() => {
        const data = generateMockLeaderboardData(activeTab, timeRange);
        setLeaderboardData(data);
        setIsLoading(false);
      }, 800);
    };
    
    fetchLeaderboardData();
  }, [activeTab, timeRange]);

  // Generate mock leaderboard data based on category and time range
  const generateMockLeaderboardData = (category, range) => {
    // Names for mock users
    const names = [
      'Alex Johnson', 'Taylor Smith', 'Jordan Williams', 'Casey Brown', 'Morgan Davis',
      'Riley Wilson', 'Jamie Miller', 'Quinn Moore', 'Avery Thomas', 'Jordan Anderson'
    ];
    
    // Generate 10 leaderboard entries with mock data
    return Array.from({ length: 10 }, (_, i) => {
      // Current user is randomly placed in the leaderboard
      const isCurrentUser = i === Math.floor(Math.random() * 10);
      
      // Generate scores and stats based on category
      let score, details;
      
      switch (category) {
        case 'overall':
          score = 10000 - (i * 500) - Math.floor(Math.random() * 300);
          details = {
            quizzesTaken: 45 - Math.floor(i * 2.5),
            testsTaken: 12 - Math.floor(i * 0.8),
            streak: 15 - Math.floor(i * 0.7)
          };
          break;
        
        case 'quizzes':
          score = 500 - (i * 30) - Math.floor(Math.random() * 20);
          details = {
            accuracy: Math.floor(95 - (i * 2.5) - Math.random() * 5) + '%',
            completed: 35 - Math.floor(i * 2.2),
            avgTime: Math.floor(25 + (i * 1.5) + Math.random() * 10) + 's'
          };
          break;
        
        case 'mock-tests':
          score = 950 - (i * 40) - Math.floor(Math.random() * 30);
          details = {
            avgScore: Math.floor(98 - (i * 3.2) - Math.random() * 5) + '%',
            completed: 12 - Math.floor(i * 0.7),
            hardestPassed: i < 3 ? 'Advanced' : i < 7 ? 'Intermediate' : 'Basic'
          };
          break;
        
        case 'streaks':
          score = 60 - (i * 4) - Math.floor(Math.random() * 3);
          details = {
            currentStreak: score,
            longestStreak: score + Math.floor(Math.random() * 15),
            totalDays: score + Math.floor(120 - i * 5)
          };
          break;
        
        case 'subjects':
          const subjectNames = ['DBMS', 'OOPs', 'System Design', 'Aptitude', 'Business'];
          const subjectIndex = Math.floor(Math.random() * subjectNames.length);
          score = 92 - (i * 3) - Math.floor(Math.random() * 5);
          details = {
            subject: subjectNames[subjectIndex],
            questionsAnswered: 150 - (i * 9),
            accuracy: score + '%'
          };
          break;
        
        default:
          score = 1000 - (i * 50);
          details = {
            generic: 'No specific details available'
          };
      }
      
      return {
        rank: i + 1,
        name: isCurrentUser ? 'You' : names[i],
        score,
        details,
        isCurrentUser,
        avatar: `https://i.pravatar.cc/100?img=${(i + 10)}`,
        trend: Math.random() > 0.7 ? (Math.random() > 0.5 ? 'up' : 'down') : 'stable'
      };
    });
  };

  // Get the appropriate label for the score based on category
  const getScoreLabel = () => {
    switch (activeTab) {
      case 'overall': return 'Points';
      case 'quizzes': return 'Quiz Score';
      case 'mock-tests': return 'Test Score';
      case 'streaks': return 'Days';
      case 'subjects': return 'Mastery';
      default: return 'Score';
    }
  };

  // Render the details for each leaderboard entry
  const renderDetails = (details) => {
    if (!details) return null;
    
    switch (activeTab) {
      case 'overall':
        return (
          <div className="text-xs text-gray-500 mt-1">
            <span className="mr-3">{details.quizzesTaken} quizzes</span>
            <span className="mr-3">{details.testsTaken} tests</span>
            <span>{details.streak} day streak</span>
          </div>
        );
      
      case 'quizzes':
        return (
          <div className="text-xs text-gray-500 mt-1">
            <span className="mr-3">{details.accuracy} accuracy</span>
            <span className="mr-3">{details.completed} completed</span>
            <span>Avg: {details.avgTime}/question</span>
          </div>
        );
      
      case 'mock-tests':
        return (
          <div className="text-xs text-gray-500 mt-1">
            <span className="mr-3">{details.avgScore} avg score</span>
            <span className="mr-3">{details.completed} completed</span>
            <span>Highest: {details.hardestPassed}</span>
          </div>
        );
      
      case 'streaks':
        return (
          <div className="text-xs text-gray-500 mt-1">
            <span className="mr-3">Current: {details.currentStreak} days</span>
            <span className="mr-3">Longest: {details.longestStreak} days</span>
            <span>Total active: {details.totalDays} days</span>
          </div>
        );
      
      case 'subjects':
        return (
          <div className="text-xs text-gray-500 mt-1">
            <span className="mr-3">Subject: {details.subject}</span>
            <span className="mr-3">{details.questionsAnswered} answers</span>
            <span>{details.accuracy} accuracy</span>
          </div>
        );
      
      default:
        return null;
    }
  };

  // Render trend indicator
  const renderTrend = (trend) => {
    switch (trend) {
      case 'up':
        return (
          <div className="flex items-center text-green-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
            </svg>
            <span className="text-xs">+2</span>
          </div>
        );
      case 'down':
        return (
          <div className="flex items-center text-red-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1v-5a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586l-4.293-4.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
            </svg>
            <span className="text-xs">-1</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7 10a1 1 0 011-1h9a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-xs">0</span>
          </div>
        );
    }
  };

  return (
    <div className="py-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Leaderboard</h2>
      <p className="text-gray-600 mb-6">
        Compete with your peers and track your progress across different categories.
      </p>
      
      {/* Tabs and time range selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div className="flex space-x-1 mb-4 sm:mb-0 overflow-x-auto pb-2 sm:pb-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-4 py-2 rounded-md whitespace-nowrap
                ${activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'}
              `}
            >
              {tab.name}
            </button>
          ))}
        </div>
        
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {timeRanges.map(range => (
            <option key={range.id} value={range.id}>{range.name}</option>
          ))}
        </select>
      </div>
      
      {/* Leaderboard table */}
      <div className="bg-white shadow-md rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center p-12">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '600ms' }}></div>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {getScoreLabel()}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Trend
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leaderboardData.map((entry) => (
                  <tr 
                    key={entry.rank} 
                    className={entry.isCurrentUser ? 'bg-blue-50' : 'hover:bg-gray-50'}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-800 font-semibold">
                        {entry.rank}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          className="h-10 w-10 rounded-full border border-gray-200"
                          src={entry.avatar}
                          alt={`${entry.name}'s avatar`}
                        />
                        <div className="ml-4">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900 mr-1">
                              {entry.name}
                            </div>
                            {entry.isCurrentUser && (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                You
                              </span>
                            )}
                          </div>
                          {renderDetails(entry.details)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {entry.score}
                        {activeTab === 'subjects' && '%'}
                      </div>
                      <ProgressBar
                        progress={activeTab === 'overall' ? (entry.score / 100) : entry.score}
                        className="h-1 bg-gray-200 w-24 mt-1"
                        barClassName="bg-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      {renderTrend(entry.trend)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Call to action */}
      <div className="mt-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white text-center">
        <h3 className="text-xl font-bold mb-2">Keep Up The Momentum!</h3>
        <p className="mb-4">Complete quizzes and practice tests to climb the leaderboard and earn rewards.</p>
        <button className="bg-white text-blue-600 px-6 py-2 rounded-md font-medium hover:bg-blue-50">
          Start a Challenge
        </button>
      </div>
    </div>
  );
};

export default Leaderboard; 