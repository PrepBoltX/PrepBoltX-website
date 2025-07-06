import React, { useState, useEffect } from 'react';
import { useApp } from './contexts/AppContext';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import MainContent from './components/MainContent';
import GradientBackground from './components/common/GradientBackground';
import Login from './components/modules/Login';
import Register from './components/modules/Register';
import { getAllSubjects } from './services/ApiService';

const AppContent = () => {
    const { state, dispatch } = useApp();
    const [showRegister, setShowRegister] = useState(false);

    // Fetch initial data when authenticated
    useEffect(() => {
        if (state.isAuthenticated) {
            const fetchData = async () => {
                try {
                    dispatch({ type: 'SET_LOADING', payload: { key: 'global', value: true } });
                    
                    // Fetch subjects
                    const subjects = await getAllSubjects();
                    dispatch({ type: 'SET_SUBJECTS', payload: subjects });
                    
                    dispatch({ type: 'SET_LOADING', payload: { key: 'global', value: false } });
                } catch (error) {
                    console.error('Error fetching initial data:', error);
                    dispatch({ type: 'SET_LOADING', payload: { key: 'global', value: false } });
                    dispatch({ type: 'SET_ERROR', payload: 'Failed to load initial data' });
                }
            };
            
            fetchData();
        }
    }, [state.isAuthenticated, dispatch]);

    // Update URL when authentication state changes
    useEffect(() => {
        if (state.isAuthenticated) {
            window.history.pushState({}, '', '/dashboard');
        } else {
            window.history.pushState({}, '', showRegister ? '/register' : '/login');
        }
    }, [state.isAuthenticated, showRegister]);

    const handleLoginSuccess = () => {
        // After successful login, redirect to dashboard
        dispatch({ type: 'SET_CURRENT_MODULE', payload: 'dashboard' });
        window.history.pushState({}, '', '/dashboard');
    };

    const toggleAuthMode = () => {
        setShowRegister(!showRegister);
        window.history.pushState({}, '', showRegister ? '/login' : '/register');
    };

    if (!state.isAuthenticated) {
        return (
            <GradientBackground variant="primary">
                {showRegister ? (
                    <Register 
                        onRegisterSuccess={handleLoginSuccess} 
                        onLoginClick={toggleAuthMode} 
                    />
                ) : (
                    <Login 
                        onLoginSuccess={handleLoginSuccess} 
                        onRegisterClick={toggleAuthMode}
                    />
                )}
            </GradientBackground>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto">
                    <MainContent />
                </main>
            </div>
        </div>
    );
};

const App = () => {
    return <AppContent />;
};

export default App;