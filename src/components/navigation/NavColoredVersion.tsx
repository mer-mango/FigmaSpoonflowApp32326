import React, { useState } from 'react';
import { 
  Calendar, 
  CheckSquare, 
  Users, 
  Target, 
  Inbox, 
  Settings, 
  Sparkles,
  Home,
  Search,
  Pin,
  Sprout,
  UtensilsCrossed,
} from 'lucide-react';

interface NavItem {
  icon: any;
  label: string;
  count: number | null;
  color: string;
  bgColor: string;
  isActive?: boolean;
}

export function NavColoredVersion() {
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);

  const navItems: NavItem[] = [
    { 
      icon: Home, 
      label: 'Today', 
      count: null, 
      color: 'text-slate-600',
      bgColor: 'bg-slate-600',
      isActive: true 
    },
    { 
      icon: Calendar, 
      label: 'Calendar', 
      count: 3, // Total meetings from EHS Mtgs calendar
      color: 'text-[#6b7b98]', // Dusty roe/Slate blue
      bgColor: 'bg-[#6b7b98]'
    },
    { 
      icon: CheckSquare, 
      label: 'Tasks', 
      count: 12, // Total active tasks
      color: 'text-[#8d7f9a]', // Dusty berry/Soft plum
      bgColor: 'bg-[#8d7f9a]'
    },
    { 
      icon: Pin, 
      label: 'Content', 
      count: 5, // Total active content
      color: 'text-[#d4a5a5]', // Dusty rose (from day at a glance widget)
      bgColor: 'bg-[#d4a5a5]'
    },
    { 
      icon: Users, 
      label: 'Contacts', 
      count: 47, // Total contacts
      color: 'text-[#8ba5a8]', // Muted cyan/teal
      bgColor: 'bg-[#8ba5a8]'
    },
    { 
      icon: Sprout, 
      label: 'Nurtures', 
      count: 8, // Total nurtures
      color: 'text-[#8fa890]', // Sage/Seafoam
      bgColor: 'bg-[#8fa890]'
    },
    { 
      icon: Target, 
      label: 'Goals', 
      count: 4, // Total goals
      color: 'text-[#a389aa]', // Goals purple
      bgColor: 'bg-[#a389aa]'
    },
  ];

  return (
    <div className="min-h-screen bg-[#e5e7f0] flex">
      {/* Sidebar */}
      <div className="w-[200px] bg-white/90 backdrop-blur-xl border-r border-slate-200/50 flex flex-col py-6 px-3">
        {/* Logo */}
        <div className="mb-6 px-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <span className="font-serif font-semibold text-slate-800">SpoonFlow</span>
          </div>
        </div>

        {/* Main Nav */}
        <div className="flex-1 space-y-0.5">
          {navItems.map((item, idx) => (
            <button 
              key={idx} 
              className={`w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl transition-all relative ${
                item.isActive
                  ? `${item.bgColor} text-white shadow-soft` 
                  : 'text-slate-700 hover:bg-slate-100/60'
              }`}
              onMouseEnter={() => setHoveredItem(idx)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div className={`w-7 h-7 rounded-full ${item.bgColor} flex items-center justify-center flex-shrink-0`}>
                <item.icon className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium text-sm">{item.label}</span>
              
              {/* Count appears on hover */}
              {item.count && hoveredItem === idx && (
                <span className={`ml-auto text-xs font-semibold transition-all ${
                  item.isActive ? 'text-white/70' : 'text-slate-500'
                }`}>
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Bottom Nav */}
        <div className="space-y-0.5 pt-4 border-t border-slate-200/50">
          <button className="w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl bg-[#6b2358] text-white hover:bg-[#6b2358]/90 shadow-soft transition-all">
            <Sparkles className="w-4.5 h-4.5" />
            <span className="font-medium text-sm">Jamie AI</span>
          </button>
          <button className="w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100/60 transition-all">
            <Settings className="w-4.5 h-4.5" />
            <span className="font-medium text-sm">Settings</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="space-y-4">
          <div>
            <h2 className="text-3xl font-serif font-semibold text-slate-800 mb-2">Today</h2>
            <p className="text-sm text-slate-600">Friday, December 5, 2025</p>
          </div>

          {/* Example Content */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/50 shadow-subtle">
            <div className="space-y-4">
              <div className="text-center text-slate-500 py-12">
                <UtensilsCrossed className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-sm">Your timeline content would appear here</p>
                <p className="text-xs text-slate-400 mt-2">Hover over navigation items to see totals</p>
              </div>

              {/* Color Key */}
              <div className="mt-8 pt-6 border-t border-slate-200/50">
                <div className="text-xs font-semibold text-slate-400 mb-3">NAVIGATION COLORS</div>
                <div className="grid grid-cols-2 gap-3">
                  {navItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-lg ${item.bgColor} flex items-center justify-center`}>
                        <item.icon className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-sm text-slate-600">
                        {item.label} {item.count && <span className="text-slate-400">({item.count})</span>}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}