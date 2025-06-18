import React from 'react';

const GradientBackground = ({
    children,
    variant = 'primary',
    className = ''
}) => {
    const gradients = {
        primary: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50',
        secondary: 'bg-gradient-to-br from-green-50 via-teal-50 to-cyan-50',
        accent: 'bg-gradient-to-br from-orange-50 via-red-50 to-pink-50'
    };

    return (
        <div className={`min-h-screen ${gradients[variant]} ${className}`}>
            {children}
        </div>
    );
};

export default GradientBackground;