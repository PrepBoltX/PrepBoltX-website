import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import ProgressBar from '../common/ProgressBar';
import UserManager from '../../services/UserManager';

const UserProfile = () => {
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: 'John Smith',
    email: 'john.smith@example.com',
    college: 'University of Technology',
    graduationYear: '2025',
    bio: 'Computer Science student passionate about software development and preparing for placements.',
    goal: 'Secure a placement at a top tech company'
  });

  // Dummy user data
  const userData = {
    name: formData.name,
    email: formData.email,
    joined: 'September 2023',
    profilePicture: 'https://i.pravatar.cc/300',
    college: formData.college,
    graduationYear: formData.graduationYear,
    bio: formData.bio,
    goal: formData.goal,
    dailyStreak: UserManager.getInstance().getUserProgress()?.dailyStreak || 15,
    achievements: [
      { id: 'quiz-master', name: 'Quiz Master', description: 'Completed 50 quizzes', date: '2023-11-15', icon: '🏆' },
      { id: 'streak-7', name: 'Week Warrior', description: 'Maintained a 7-day streak', date: '2023-11-10', icon: '🔥' },
      { id: 'mock-pro', name: 'Interview Pro', description: 'Scored 90%+ on 3 mock interviews', date: '2023-11-05', icon: '🎯' },
      { id: 'subject-master', name: 'DBMS Expert', description: 'Completed all DBMS topics', date: '2023-10-28', icon: '📚' }
    ],
    activityHistory: [
      { date: '2023-11-20', quizzes: 3, mockTests: 1, topicsStudied: 2, totalPoints: 250 },
      { date: '2023-11-19', quizzes: 2, mockTests: 0, topicsStudied: 3, totalPoints: 180 },
      { date: '2023-11-18', quizzes: 5, mockTests: 0, topicsStudied: 1, totalPoints: 220 },
      { date: '2023-11-17', quizzes: 0, mockTests: 1, topicsStudied: 4, totalPoints: 270 },
      { date: '2023-11-16', quizzes: 4, mockTests: 0, topicsStudied: 2, totalPoints: 200 },
      { date: '2023-11-15', quizzes: 3, mockTests: 1, topicsStudied: 0, totalPoints: 190 },
      { date: '2023-11-14', quizzes: 2, mockTests: 0, topicsStudied: 3, totalPoints: 160 }
    ],
    preferences: {
      dailyNotifications: true,
      weeklyReport: true,
      publicProfile: false,
      darkMode: false
    }
  };

  // Profile tabs
  const tabs = [
    { id: 'overview', name: 'Overview' },
    { id: 'achievements', name: 'Achievements' },
    { id: 'activity', name: 'Activity' },
    { id: 'settings', name: 'Settings' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleToggleChange = (preference) => {
    // In a real app, would update user preferences in the database
    console.log(`Toggled ${preference}`);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    // In a real app, would save to database
    setIsEditing(false);
  };

  // Calculate overall progress as average of all subjects
  const calculateOverallProgress = () => {
    if (!state.subjects || state.subjects.length === 0) return 0;
    
    const total = state.subjects.reduce((sum, subject) => sum + subject.progress, 0);
    return Math.round(total / state.subjects.length);
  };

  // Render overview tab
  const renderOverview = () => {
    return (
      <div>
        <div className="bg-white shadow-md rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Progress Overview</h3>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-700">Overall Completion</span>
              <span className="text-sm font-medium text-blue-600">{calculateOverallProgress()}%</span>
            </div>
            <ProgressBar
              progress={calculateOverallProgress()}
              className="h-2 bg-gray-200"
              barClassName="bg-blue-600"
            />
          </div>
          
          <div className="space-y-4">
            {state.subjects.map(subject => (
              <div key={subject.id}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">{subject.name}</span>
                  <span className="text-sm font-medium text-gray-600">{subject.progress}%</span>
                </div>
                <ProgressBar
                  progress={subject.progress}
                  className="h-2 bg-gray-200"
                  barClassName={`${subject.color}`}
                />
              </div>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white shadow-md rounded-xl p-6 text-center">
            <div className="text-4xl font-bold text-blue-600 mb-1">{userData.dailyStreak}</div>
            <div className="text-gray-700">Day Streak</div>
          </div>
          
          <div className="bg-white shadow-md rounded-xl p-6 text-center">
            <div className="text-4xl font-bold text-green-600 mb-1">
              {userData.activityHistory.reduce((sum, day) => sum + day.quizzes, 0)}
            </div>
            <div className="text-gray-700">Quizzes Taken</div>
          </div>
          
          <div className="bg-white shadow-md rounded-xl p-6 text-center">
            <div className="text-4xl font-bold text-purple-600 mb-1">
              {userData.activityHistory.reduce((sum, day) => sum + day.mockTests, 0)}
            </div>
            <div className="text-gray-700">Mock Tests</div>
          </div>
        </div>
        
        <div className="bg-white shadow-md rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">About Me</h3>
          
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-500 mb-1">Bio</h4>
            <p className="text-gray-800">{userData.bio}</p>
          </div>
          
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-500 mb-1">Placement Goal</h4>
            <p className="text-gray-800">{userData.goal}</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">College</h4>
              <p className="text-gray-800">{userData.college}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Graduation Year</h4>
              <p className="text-gray-800">{userData.graduationYear}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow-md rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Recent Achievements</h3>
            <button 
              onClick={() => setActiveTab('achievements')}
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              View All
            </button>
          </div>
          
          <div className="space-y-4">
            {userData.achievements.slice(0, 3).map(achievement => (
              <div key={achievement.id} className="flex items-center">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                  {achievement.icon}
                </div>
                <div className="ml-4">
                  <div className="font-medium text-gray-800">{achievement.name}</div>
                  <div className="text-sm text-gray-500">{achievement.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Render achievements tab
  const renderAchievements = () => {
    return (
      <div>
        <div className="bg-white shadow-md rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">All Achievements</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userData.achievements.map(achievement => (
              <div key={achievement.id} className="border rounded-lg p-4 flex items-center">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-3xl">
                  {achievement.icon}
                </div>
                <div className="ml-4">
                  <div className="font-medium text-gray-800">{achievement.name}</div>
                  <div className="text-sm text-gray-500 mb-1">{achievement.description}</div>
                  <div className="text-xs text-gray-400">Earned on {new Date(achievement.date).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white shadow-md rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Upcoming Achievements</h3>
          
          <div className="space-y-4">
            <div className="border border-dashed rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-2xl text-gray-400">
                  🚀
                </div>
                <div className="ml-4">
                  <div className="font-medium text-gray-800">Perfect Score</div>
                  <div className="text-sm text-gray-500">Achieve 100% in a mock test</div>
                </div>
              </div>
              <div className="mt-2">
                <ProgressBar
                  progress={75}
                  className="h-2 bg-gray-200"
                  barClassName="bg-gray-400"
                />
                <div className="text-xs text-right mt-1 text-gray-500">75% Complete</div>
              </div>
            </div>
            
            <div className="border border-dashed rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-2xl text-gray-400">
                  🔥
                </div>
                <div className="ml-4">
                  <div className="font-medium text-gray-800">30 Day Streak</div>
                  <div className="text-sm text-gray-500">Log in for 30 consecutive days</div>
                </div>
              </div>
              <div className="mt-2">
                <ProgressBar
                  progress={(userData.dailyStreak / 30) * 100}
                  className="h-2 bg-gray-200"
                  barClassName="bg-gray-400"
                />
                <div className="text-xs text-right mt-1 text-gray-500">{userData.dailyStreak}/30 Days</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render activity tab
  const renderActivity = () => {
    return (
      <div>
        <div className="bg-white shadow-md rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Weekly Activity</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quizzes</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mock Tests</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Topics Studied</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points Earned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {userData.activityHistory.map((day, index) => (
                  <tr key={index} className={index === 0 ? 'bg-blue-50' : ''}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        {index === 0 && <span className="ml-2 text-xs text-blue-600 font-medium">Today</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{day.quizzes}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{day.mockTests}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{day.topicsStudied}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{day.totalPoints}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Mock Test Performance Section */}
        <div className="bg-white shadow-md rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Mock Test Performance</h3>
          
          {state.user && state.user.mockTestAttempts && state.user.mockTestAttempts.length > 0 ? (
            <div className="space-y-6">
              {state.user.mockTestAttempts.map((attempt, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium text-gray-800">
                        {attempt.testId && typeof attempt.testId === 'string' && attempt.testId.startsWith('custom-') 
                          ? 'Custom Mock Test' 
                          : 'Mock Test'}
                      </h4>
                      <div className="text-sm text-gray-500">
                        {new Date(attempt.date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-800">{Math.round(attempt.score)}%</div>
                      <div className="text-sm text-gray-500">
                        {attempt.correctAnswers} of {attempt.totalQuestions} correct
                      </div>
                    </div>
                  </div>
                  
                  {/* Subject-wise Performance */}
                  {attempt.sectionWiseScores && attempt.sectionWiseScores.length > 0 && (
                    <div className="mt-3">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Subject-wise Performance</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {attempt.sectionWiseScores.map((section, sIdx) => {
                          const percentage = Math.round((section.correctAnswers / section.totalQuestions) * 100);
                          let barColor = 'bg-red-500';
                          if (percentage >= 70) barColor = 'bg-green-500';
                          else if (percentage >= 40) barColor = 'bg-yellow-500';
                          
                          return (
                            <div key={sIdx} className="bg-gray-50 p-2 rounded">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium text-gray-700">{section.section}</span>
                                <span className="text-xs font-medium text-gray-600">{percentage}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${barColor}`} 
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {section.correctAnswers}/{section.totalQuestions} correct
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No mock tests attempted yet.</p>
              <p className="mt-2 text-sm">Complete mock tests to see your performance here.</p>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white shadow-md rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Activity by Subject</h3>
            
            {state.subjects.map(subject => {
              // Generate random activity data (in a real app, would use actual data)
              const quizCount = Math.floor(Math.random() * 20) + 5;
              const mockTestCount = Math.floor(Math.random() * 5) + 1;
              const hoursSpent = Math.floor(Math.random() * 10) + 2;
              
              return (
                <div key={subject.id} className="mb-4 last:mb-0">
                  <div className="font-medium text-gray-800 mb-1">{subject.name}</div>
                  <div className="text-sm text-gray-500">
                    {quizCount} quizzes · {mockTestCount} mock tests · {hoursSpent} hours spent
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="bg-white shadow-md rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Streak</h3>
            
            <div className="flex items-center justify-center mb-4">
              <div className="w-32 h-32 rounded-full border-8 border-orange-500 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-bold text-orange-600">{userData.dailyStreak}</div>
                  <div className="text-gray-600">days</div>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-gray-600 mb-2">Keep your streak alive! Log in daily to maintain progress.</p>
              <p className="text-sm text-gray-500">Next milestone: 30 days</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render settings tab
  const renderSettings = () => {
    return (
      <div>
        {isEditing ? (
          <div className="bg-white shadow-md rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Edit Profile</h3>
            
            <form onSubmit={handleFormSubmit}>
              <div className="grid grid-cols-1 gap-6 mb-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-black"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-black"
                  />
                </div>
                
                <div>
                  <label htmlFor="college" className="block text-sm font-medium text-gray-700 mb-1">College</label>
                  <input
                    type="text"
                    id="college"
                    name="college"
                    value={formData.college}
                    onChange={handleInputChange}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-black"
                  />
                </div>
                
                <div>
                  <label htmlFor="graduationYear" className="block text-sm font-medium text-gray-700 mb-1">Graduation Year</label>
                  <select
                    id="graduationYear"
                    name="graduationYear"
                    value={formData.graduationYear}
                    onChange={handleInputChange}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-black"
                  >
                    {['2024', '2025', '2026', '2027', '2028'].map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows="3"
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-black"
                  ></textarea>
                </div>
                
                <div>
                  <label htmlFor="goal" className="block text-sm font-medium text-gray-700 mb-1">Placement Goal</label>
                  <textarea
                    id="goal"
                    name="goal"
                    rows="2"
                    value={formData.goal}
                    onChange={handleInputChange}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-black"
                  ></textarea>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-white hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-xl p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Profile Information</h3>
              <button
                onClick={() => setIsEditing(true)}
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                Edit Profile
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center">
                <div className="text-sm font-medium text-gray-500 sm:w-48">Name</div>
                <div className="text-gray-800">{userData.name}</div>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center">
                <div className="text-sm font-medium text-gray-500 sm:w-48">Email</div>
                <div className="text-gray-800">{userData.email}</div>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center">
                <div className="text-sm font-medium text-gray-500 sm:w-48">College</div>
                <div className="text-gray-800">{userData.college}</div>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center">
                <div className="text-sm font-medium text-gray-500 sm:w-48">Graduation Year</div>
                <div className="text-gray-800">{userData.graduationYear}</div>
              </div>
              
              <div className="flex flex-col sm:flex-row">
                <div className="text-sm font-medium text-gray-500 sm:w-48">Bio</div>
                <div className="text-gray-800">{userData.bio}</div>
              </div>
              
              <div className="flex flex-col sm:flex-row">
                <div className="text-sm font-medium text-gray-500 sm:w-48">Placement Goal</div>
                <div className="text-gray-800">{userData.goal}</div>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-white shadow-md rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Settings</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-800">Daily Notification Reminders</div>
                <div className="text-sm text-gray-500">Receive daily reminders to maintain your streak</div>
              </div>
              <div className="flex items-center">
                <label className="inline-flex relative items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={userData.preferences.dailyNotifications}
                    onChange={() => handleToggleChange('dailyNotifications')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-800">Weekly Progress Report</div>
                <div className="text-sm text-gray-500">Get a weekly email summarizing your progress</div>
              </div>
              <div className="flex items-center">
                <label className="inline-flex relative items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={userData.preferences.weeklyReport}
                    onChange={() => handleToggleChange('weeklyReport')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-800">Public Profile</div>
                <div className="text-sm text-gray-500">Allow others to see your achievements and progress</div>
              </div>
              <div className="flex items-center">
                <label className="inline-flex relative items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={userData.preferences.publicProfile}
                    onChange={() => handleToggleChange('publicProfile')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-800">Dark Mode</div>
                <div className="text-sm text-gray-500">Switch to dark theme for comfortable nighttime studying</div>
              </div>
              <div className="flex items-center">
                <label className="inline-flex relative items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={userData.preferences.darkMode}
                    onChange={() => handleToggleChange('darkMode')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button className="px-4 py-2 text-red-600 hover:text-red-800 font-medium">
            Delete Account
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="py-6">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end">
          <div className="mb-4 sm:mb-0 sm:mr-6">
            <img
              src={userData.profilePicture}
              alt="Profile"
              className="w-24 h-24 rounded-full border-4 border-white shadow-md"
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">{userData.name}</h2>
            <p className="text-gray-600">Member since {userData.joined}</p>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex space-x-2 overflow-x-auto pb-2">
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
      </div>
      
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'achievements' && renderAchievements()}
      {activeTab === 'activity' && renderActivity()}
      {activeTab === 'settings' && renderSettings()}
    </div>
  );
};

export default UserProfile; 