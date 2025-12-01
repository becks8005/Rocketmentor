import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends Omit<HTMLMotionProps<"button">, 'ref'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'text-white focus:ring-offset-2',
    secondary: 'border focus:ring-border-subtle',
    ghost: 'border bg-transparent focus:ring-border-subtle',
    danger: 'bg-accent-rose/10 text-accent-rose border border-accent-rose/20 hover:bg-accent-rose/20 focus:ring-accent-rose',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-5 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2',
  };

  const getButtonStyle = () => {
    if (variant === 'primary') {
      return {
        backgroundColor: 'var(--accent-main)',
        color: 'white',
        border: 'none',
      };
    } else if (variant === 'secondary') {
      return {
        backgroundColor: 'var(--bg-surface)',
        color: 'var(--text-primary)',
        borderColor: 'var(--border-subtle)',
      };
    } else if (variant === 'ghost') {
      return {
        backgroundColor: 'transparent',
        color: 'var(--text-secondary)',
        borderColor: 'var(--border-subtle)',
      };
    }
    return {};
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (variant === 'primary') {
      e.currentTarget.style.backgroundColor = '#E85A4A';
    } else if (variant === 'secondary') {
      e.currentTarget.style.backgroundColor = 'rgba(15, 15, 15, 0.04)';
    } else if (variant === 'ghost') {
      e.currentTarget.style.color = 'var(--text-primary)';
      e.currentTarget.style.backgroundColor = 'rgba(15, 15, 15, 0.04)';
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (variant === 'primary') {
      e.currentTarget.style.backgroundColor = 'var(--accent-main)';
    } else if (variant === 'secondary') {
      e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
    } else if (variant === 'ghost') {
      e.currentTarget.style.color = 'var(--text-secondary)';
      e.currentTarget.style.backgroundColor = 'transparent';
    }
  };

  const buttonStyle = {
    ...getButtonStyle(),
    borderRadius: '4px',
  };

  return (
    <motion.button
      whileTap={disabled ? {} : { scale: 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      style={buttonStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : icon}
      {children}
    </motion.button>
  );
};

