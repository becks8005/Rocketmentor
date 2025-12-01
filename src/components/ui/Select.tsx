import React, { useState, useRef, useEffect } from 'react';
import { CaretDown, Check } from '@phosphor-icons/react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  onChange?: (value: string) => void;
  value?: string;
  className?: string;
  disabled?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  placeholder = 'Select an option',
  onChange,
  value,
  className = '',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
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

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (optionValue: string) => {
    onChange?.(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
          {label}
        </label>
      )}
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            w-full px-4 py-2.5 pr-10
            cursor-pointer
            focus:outline-none focus:ring-2
            transition-all duration-200 ease-out
            text-left
            flex items-center justify-between
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: error ? '#f43f5e' : 'var(--border-subtle)',
            borderWidth: '1px',
            borderRadius: '4px',
            color: value ? 'var(--text-primary)' : 'var(--text-secondary)',
          }}
          onFocus={(e) => {
            if (!disabled) {
              e.currentTarget.style.borderColor = 'var(--accent-main)';
              e.currentTarget.style.boxShadow = '0 0 0 2px rgba(255, 107, 87, 0.1)';
            }
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error ? '#f43f5e' : 'var(--border-subtle)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          onMouseEnter={(e) => {
            if (!disabled) {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = error ? '#f43f5e' : 'var(--border-subtle)';
          }}
        >
          <span style={{ color: value ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <CaretDown
            className={`w-5 h-5 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
            style={{ color: 'var(--text-secondary)' }}
          />
        </button>

        {isOpen && (
          <div
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 border overflow-hidden animate-fade-in"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-subtle)',
              borderWidth: '1px',
              borderRadius: '4px',
              boxShadow: '0 8px 24px rgba(15, 15, 15, 0.08)',
            }}
          >
            <div className="max-h-60 overflow-y-auto custom-scrollbar">
              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className="w-full px-4 py-2.5 text-left transition-colors duration-150 flex items-center justify-between"
                    style={{
                      color: 'var(--text-primary)',
                      backgroundColor: isSelected ? 'rgba(15, 15, 15, 0.04)' : 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(15, 15, 15, 0.04)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = isSelected ? 'rgba(15, 15, 15, 0.04)' : 'transparent';
                    }}
                  >
                    <span>{option.label}</span>
                    {isSelected && (
                      <Check className="w-4 h-4 flex-shrink-0 ml-2" style={{ color: 'var(--accent-main)' }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-xs" style={{ color: '#f43f5e' }}>{error}</p>
      )}
    </div>
  );
};

