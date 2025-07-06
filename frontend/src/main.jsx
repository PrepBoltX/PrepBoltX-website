import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AppProvider } from './contexts/AppContext'

// Try to import GoogleOAuthProvider only if available
let GoogleOAuthProvider;
try {
  GoogleOAuthProvider = require('@react-oauth/google').GoogleOAuthProvider;
} catch (error) {
  console.warn('Google OAuth package not available:', error.message);
}

// Set initial URL path if needed
const setInitialPath = () => {
  // If we're at the root path with a hash, replace it with a clean URL
  if (window.location.pathname === '/' && window.location.hash) {
    const path = window.location.hash.replace('#', '');
    window.history.replaceState({}, '', path || '/login');
  }
  // If we're at the root path with no hash, default to login
  else if (window.location.pathname === '/') {
    window.history.replaceState({}, '', '/login');
  }
};

// Call this function before rendering
setInitialPath();

// Get client ID from environment variables
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root'));

// If Google OAuth is available and client ID is configured, use GoogleOAuthProvider
if (GoogleOAuthProvider && googleClientId && googleClientId !== 'your-google-client-id') {
  root.render(
    <React.StrictMode>
      <GoogleOAuthProvider clientId={googleClientId}>
        <AppProvider>
          <App />
        </AppProvider>
      </GoogleOAuthProvider>
    </React.StrictMode>
  );
} else {
  // Otherwise render without Google OAuth
  console.warn('Google OAuth is disabled: No valid client ID found or package not installed');
  root.render(
    <React.StrictMode>
      <AppProvider>
        <App />
      </AppProvider>
    </React.StrictMode>
  );
} 