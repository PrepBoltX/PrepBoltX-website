import React from 'react';

const ProgressBar = ({
    progress,
    className = '',
    animated = true,
    color = 'bg-blue-500'
}) => {
    return (
        <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
            <div
                className={`h-2 rounded-full transition-all duration-500 ease-out ${color} ${animated ? 'animate-pulse' : ''
                    }`}
                style={{ width: `${Math.min(progress, 100)}%` }}
            />
        </div>
    );
};

export default ProgressBar; 