import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  padding = 'md',
  onClick,
  style,
}) => {
  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const baseStyles = `
    border
    ${paddingStyles[padding]}
    ${hover ? 'card-hover cursor-pointer' : ''}
    ${className}
  `;

  const cardStyle = {
    backgroundColor: 'var(--bg-surface)',
    borderColor: 'var(--border-subtle)',
    borderWidth: '1px',
    borderRadius: '5px',
    ...style,
  };

  if (onClick) {
    return (
      <motion.div
        whileHover={hover ? {} : undefined}
        whileTap={hover ? {} : undefined}
        className={baseStyles}
        style={cardStyle}
        onClick={onClick}
      >
        {children}
      </motion.div>
    );
  }

  return <div className={baseStyles} style={cardStyle}>{children}</div>;
};

