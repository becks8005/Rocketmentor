import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  hint,
  icon,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-2.5 
            focus:outline-none focus:ring-2
            transition-all duration-200 ease-out
            ${icon ? 'pl-10' : ''}
            ${className}
          `}
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: error ? '#f43f5e' : 'var(--border-subtle)',
            borderWidth: '1px',
            borderRadius: '4px',
            color: 'var(--text-primary)',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent-main)';
            e.currentTarget.style.boxShadow = '0 0 0 2px rgba(255, 107, 87, 0.1)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error ? '#f43f5e' : 'var(--border-subtle)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          {...props}
        />
      </div>
      {hint && !error && (
        <p className="mt-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>{hint}</p>
      )}
      {error && (
        <p className="mt-1.5 text-xs" style={{ color: '#f43f5e' }}>{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

