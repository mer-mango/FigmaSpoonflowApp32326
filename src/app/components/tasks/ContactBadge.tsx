import React from 'react';
import { User } from 'lucide-react';

interface ContactBadgeProps {
  name: string;
  avatar?: string;
  color?: string;
  onClick?: () => void;
}

export function ContactBadge({ name, avatar, color, onClick }: ContactBadgeProps) {
  // Generate initials from name
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Default to soft plum if no color provided
  const badgeColor = color || '#a598b8';

  const Component = onClick ? 'button' : 'div';

  return (
    <Component 
      className={`
        inline-flex items-center gap-2 px-3 py-1.5 
        bg-[#9fb8cf]/15 backdrop-blur-sm rounded-xl border border-slate-200/50
        ${onClick ? 'cursor-pointer hover:bg-[#9fb8cf]/25 hover:shadow-subtle transition-gentle' : ''}
      `}
      onClick={onClick}
    >
      {/* Avatar or Initials */}
      {avatar ? (
        <img 
          src={avatar} 
          alt={name}
          className="w-5 h-5 rounded-full object-cover"
        />
      ) : (
        <div 
          className="w-5 h-5 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${badgeColor}30` }}
        >
          <span 
            className="text-[10px] font-semibold"
            style={{ color: badgeColor }}
          >
            {getInitials(name)}
          </span>
        </div>
      )}
      
      {/* Name */}
      <span className="text-xs font-medium text-slate-700">
        {name}
      </span>
    </Component>
  );
}