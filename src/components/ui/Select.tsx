import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: { value: string; label: string }[];
}

export function Select({ 
  label, 
  error, 
  helperText, 
  options,
  className = '', 
  ...props 
}: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={`
            w-full px-5 py-3 pr-10
            bg-white/70 backdrop-blur-sm 
            border border-slate-200/50 
            rounded-2xl
            text-slate-800
            appearance-none
            transition-gentle
            focus:outline-none focus:ring-2 focus:ring-[#a598b8]/50 focus:border-[#a598b8]
            hover:bg-white/90
            cursor-pointer
            ${error ? 'border-red-300 focus:ring-red-500/50 focus:border-red-500' : ''}
            ${className}
          `}
          {...props}
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-2 text-sm text-slate-500">{helperText}</p>
      )}
    </div>
  );
}