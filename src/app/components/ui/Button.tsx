import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'soft' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  className = '',
  ...props 
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center rounded-3xl font-medium transition-gentle focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-gradient-to-r from-[#a598b8] to-[#9b8ba5] text-white hover:opacity-90 shadow-gentle hover:shadow-soft focus:ring-[#a598b8]',
    secondary: 'bg-white/70 backdrop-blur-xl text-slate-700 hover:bg-white/90 border border-slate-200/50 shadow-subtle hover:shadow-gentle',
    ghost: 'bg-transparent hover:bg-white/40 text-slate-700 backdrop-blur-sm',
    soft: 'bg-gradient-to-br from-[#c5a3ab] to-[#d8a5b8] text-white hover:opacity-90 shadow-subtle hover:shadow-gentle',
    accent: 'bg-gradient-to-r from-[#6b7b98] to-[#6b8ba8] text-white hover:opacity-90 shadow-gentle hover:shadow-soft focus:ring-[#6b7b98]',
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };
  
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}