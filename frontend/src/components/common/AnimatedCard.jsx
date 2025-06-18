import React from 'react';

const AnimatedCard = ({ 
  children, 
  className = '', 
  onClick,
  delay = 0 
}) => {
  return (
    <div
      className={`
        bg-white rounded-xl shadow-lg hover:shadow-xl 
        transform hover:scale-105 transition-all duration-300 ease-in-out
        animate-fadeInUp cursor-pointer border border-gray-100
        ${className}
      `}
      style={{ animationDelay: `${delay}ms` }}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default AnimatedCard; 