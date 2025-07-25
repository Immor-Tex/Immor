import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Logo: React.FC<LogoProps> = ({ className = '', showText = true, size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-10',
    lg: 'h-12',
    xl: 'h-16'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  return (
    <Link to="/" className={`flex items-center ${className}`} aria-label="IMMORTEX Home">
      {/* Image Logo */}
      <img 
        src="/logo.png" 
        alt="IMMORTEX Logo" 
        className={`${sizeClasses[size]} w-auto`}
        onError={(e) => {
          // Hide image if it fails to load
          e.currentTarget.style.display = 'none';
        }}
      />
      
      {/* Text Logo - shown if showText is true or if image fails to load */}
      {showText && (
        <span className={`font-heading ${textSizes[size]} font-bold text-primary-900 ml-2`}>
          IMMORTEX
        </span>
      )}
    </Link>
  );
};

export default Logo; 