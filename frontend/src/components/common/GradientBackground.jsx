import React from 'react';

const GradientBackground = ({
    children,
    variant = 'primary',
    className = ''
}) => {
    const gradients = {
        primary: 'bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100',
        secondary: 'bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100',
        accent: 'bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100'
    };

    return (
        <div className={`min-h-screen ${gradients[variant]} ${className}`}>
            {children}
        </div>
    );
};

export default GradientBackground;