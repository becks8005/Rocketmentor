import React from 'react';

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  showValue?: boolean;
  labels?: string[];
}

export const Slider: React.FC<SliderProps> = ({
  value,
  onChange,
  min = 1,
  max = 5,
  step = 1,
  label,
  showValue = true,
  labels,
}) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-3">
          <label className="text-sm font-medium text-text-primary">{label}</label>
          {showValue && (
            <span className="text-sm font-semibold text-accent-cyan">{value}/{max}</span>
          )}
        </div>
      )}
      <div className="relative">
        <div className="h-2 bg-bg-hover rounded-full overflow-hidden">
          <div 
            className="h-full bg-accent-blue rounded-full transition-all duration-200"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-accent-blue transition-all duration-200 pointer-events-none"
          style={{ left: `calc(${percentage}% - 8px)` }}
        />
      </div>
      {labels && (
        <div className="flex justify-between mt-2">
          {labels.map((l, i) => {
            const labelValue = i + min;
            const isActive = labelValue === value;

            return (
              <button
                key={l}
                type="button"
                onClick={() => onChange(labelValue)}
                className={`text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/50 rounded px-1 ${
                  isActive ? 'text-accent-cyan font-medium' : 'text-text-muted hover:text-text-secondary'
                }`}
                aria-pressed={isActive}
              >
                {l}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

