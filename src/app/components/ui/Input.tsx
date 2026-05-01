import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({ 
  label, 
  error, 
  helperText, 
  className = '', 
  ...props 
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-5 py-3 
          bg-white/70 backdrop-blur-sm 
          border border-slate-200/50 
          rounded-2xl
          text-slate-800 placeholder:text-slate-400
          transition-gentle
          focus:outline-none focus:ring-2 focus:ring-[#a598b8]/50 focus:border-[#a598b8]
          hover:bg-white/90
          ${error ? 'border-red-300 focus:ring-red-500/50 focus:border-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-2 text-sm text-slate-500">{helperText}</p>
      )}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Textarea({ 
  label, 
  error, 
  helperText, 
  className = '', 
  ...props 
}: TextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {label}
        </label>
      )}
      <textarea
        className={`
          w-full px-5 py-3 
          bg-white/70 backdrop-blur-sm 
          border border-slate-200/50 
          rounded-2xl
          text-slate-800 placeholder:text-slate-400
          transition-gentle
          focus:outline-none focus:ring-2 focus:ring-[#a598b8]/50 focus:border-[#a598b8]
          hover:bg-white/90
          resize-y
          min-h-[120px]
          ${error ? 'border-red-300 focus:ring-red-500/50 focus:border-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-2 text-sm text-slate-500">{helperText}</p>
      )}
    </div>
  );
}