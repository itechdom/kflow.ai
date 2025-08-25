import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  overlay?: boolean;
  className?: string;
}

const Loader: React.FC<LoaderProps> = ({ 
  size = 'md', 
  text = 'Loading...', 
  overlay = true,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-20 w-20'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const loaderContent = (
    <div className="flex flex-col items-center space-y-4">
      <div className={`animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600 ${sizeClasses[size]}`}></div>
      {text && (
        <p className={`text-gray-600 font-medium ${textSizes[size]}`}>
          {text}
        </p>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 ${className}`}>
        {loaderContent}
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      {loaderContent}
    </div>
  );
};

export default Loader;
