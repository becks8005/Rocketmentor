import React from 'react';
import { motion } from 'framer-motion';

interface ProgressProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  gradient?: boolean;
  className?: string;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  size = 'md',
  showLabel = false,
  gradient = true,
  className = '',
}) => {
  const percentage = Math.min(100, (value / max) * 100);

  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-sm mb-1">
          <span className="text-text-secondary">Progress</span>
          <span className="text-text-primary font-medium">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={`w-full bg-bg-hover rounded-full overflow-hidden ${sizes[size]}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full rounded-full bg-accent-blue"
        />
      </div>
    </div>
  );
};

