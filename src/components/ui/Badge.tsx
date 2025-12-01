import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'blue' | 'purple' | 'cyan' | 'green' | 'amber' | 'rose';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  className = '',
}) => {
  const variants = {
    default: { bg: 'var(--bg-sidebar)', text: 'var(--text-secondary)', border: 'transparent' },
    blue: { bg: 'var(--tag-blue)', text: 'var(--text-primary)', border: 'transparent' },
    purple: { bg: 'var(--tag-violet)', text: 'var(--text-primary)', border: 'transparent' },
    cyan: { bg: 'var(--tag-mint)', text: 'var(--text-primary)', border: 'transparent' },
    green: { bg: 'var(--tag-mint)', text: 'var(--text-primary)', border: 'transparent' },
    amber: { bg: 'var(--accent-soft-peach)', text: 'var(--text-primary)', border: 'transparent' },
    rose: { bg: 'var(--accent-soft-peach)', text: 'var(--text-primary)', border: 'transparent' },
  };

  const sizes = {
    sm: 'px-2 py-0.5',
    md: 'px-2.5 py-1',
  };

  const variantStyle = variants[variant];

  return (
    <span
      className={`
        inline-flex items-center font-mono
        ${sizes[size]}
        ${className}
      `}
      style={{
        backgroundColor: variantStyle.bg,
        color: variantStyle.text,
        border: variantStyle.border ? `1px solid ${variantStyle.border}` : 'none',
        fontSize: '11px',
        fontWeight: 500,
        letterSpacing: '0.05em',
        borderRadius: '3px',
      }}
    >
      {children}
    </span>
  );
};

