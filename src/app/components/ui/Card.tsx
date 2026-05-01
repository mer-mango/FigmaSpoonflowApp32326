import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'glass' | 'white' | 'soft';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'lg' | 'xl' | '2xl' | '3xl';
  hover?: boolean;
}

export function Card({ 
  children, 
  className = '', 
  variant = 'white',
  padding = 'lg',
  rounded = '3xl',
  hover = false,
}: CardProps) {
  const variants = {
    glass: 'bg-white/60 backdrop-blur-xl border border-white/50',
    white: 'bg-white/80 backdrop-blur-xl border border-slate-200/50',
    soft: 'bg-gradient-to-br from-white/70 to-white/50 backdrop-blur-xl border border-slate-200/30',
  };
  
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-12',
  };
  
  const roundings = {
    lg: 'rounded-2xl',
    xl: 'rounded-3xl',
    '2xl': 'rounded-[2rem]',
    '3xl': 'rounded-[2.5rem]',
  };
  
  const hoverStyles = hover ? 'hover:shadow-soft transition-gentle cursor-pointer' : '';
  
  return (
    <div className={`${variants[variant]} ${paddings[padding]} ${roundings[rounded]} shadow-gentle ${hoverStyles} ${className}`}>
      {children}
    </div>
  );
}
