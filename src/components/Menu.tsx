import React, { useState, useRef, useEffect } from 'react';

export interface MenuOption {
  id: string;
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface MenuProps {
  trigger: React.ReactNode;
  options: MenuOption[];
  children?: React.ReactNode;
  className?: string;
  menuClassName?: string;
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
}

export const Menu: React.FC<MenuProps> = ({
  trigger,
  options,
  children,
  className = '',
  menuClassName = '',
  position = 'bottom-right'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option: MenuOption) => {
    if (!option.disabled) {
      option.onClick();
      setIsOpen(false);
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-left':
        return 'top-full left-0 mt-1';
      case 'bottom-right':
        return 'top-full right-0 mt-1';
      case 'top-left':
        return 'bottom-full left-0 mb-1';
      case 'top-right':
        return 'bottom-full right-0 mb-1';
      default:
        return 'top-full right-0 mt-1';
    }
  };

  return (
    <div className={`relative inline-block ${className}`} ref={menuRef}>
      {/* Trigger */}
      <div onClick={handleToggle} className="cursor-pointer">
        {trigger}
      </div>

      {/* Menu Dropdown */}
      {isOpen && (
        <div
          className={`absolute z-50 min-w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 ${getPositionClasses()} ${menuClassName}`}
        >
          {/* Children content */}
          {children && (
            <div className="px-4 py-3 border-b border-gray-100">
              {children}
            </div>
          )}

          {/* Options */}
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleOptionClick(option)}
                disabled={option.disabled}
                className={`
                  w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 
                  disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center gap-2 transition-colors duration-150
                  ${option.disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {option.icon && <span className="flex-shrink-0">{option.icon}</span>}
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
