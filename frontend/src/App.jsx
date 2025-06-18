import React, { useEffect } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import GradientBackground from './components/common/GradientBackground';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import MainContent from './components/MainContent';

const AppContent = () => {
    const { dispatch } = useApp();

    useEffect(() => {
        // Initialize with mock user data
        const mockUser = {
            id: '1',
            name: 'John Doe',
            email: 'john.doe@example.com',
            avatar: '',
            streak: 15,
            totalPoints: 2847,
            level: 5,
            joinedDate: '2024-01-15'
        };

        dispatch({ type: 'SET_USER', payload: mockUser });
    }, [dispatch]);

    return (
        <GradientBackground>
            <div className="flex min-h-screen">
                <Sidebar />
                <div className="flex-1">
                    <Header />
                    <MainContent />
                </div>
            </div>
        </GradientBackground>
    );
};

const App = () => {
    return (
        <AppProvider>
            <AppContent />
        </AppProvider>
    );
};

export default App;