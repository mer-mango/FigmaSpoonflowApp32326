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
  Zap,
  Pin,
  Sprout,
} from 'lucide-react';

interface RefinedOption {
  id: string;
  name: string;
  description: string;
}

const refinedOptions: RefinedOption[] = [
  { id: '1', name: 'Counts on Hover', description: 'Numbers appear only when hovering each item' },
  { id: '2', name: 'Subtle Gray Text', description: 'Small muted numbers next to labels (always visible)' },
  { id: '3', name: 'Stats at Top', description: 'Overview card showing all counts, clean nav below' },
  { id: '4', name: 'Progress Indicators', description: 'Thin colored bars showing relative volume' },
  { id: '5', name: 'No Counts in Nav', description: 'Pure navigation, see counts only in page headers' },
];

const navItems = [
  { icon: Home, label: 'Today', count: null },
  { icon: Calendar, label: 'Calendar', count: 3 },
  { icon: CheckSquare, label: 'Tasks', count: 12 },
  { icon: Pin, label: 'Content', count: 5 },
  { icon: Users, label: 'Contacts', count: 47 },
  { icon: Sprout, label: 'Nurtures', count: 8 },
  { icon: Target, label: 'Goals', count: 4 },
  { icon: Inbox, label: 'Inbox', count: 24 },
];

export function NavRefinedOptions() {
  const [selectedOption, setSelectedOption] = useState('1');
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);

  const activeIndex = 0; // Today is active

  return (
    <div className="min-h-screen bg-[#e5e7f0] p-8">
      <div className="max-w-[1800px] mx-auto">
        {/* Option Selector */}
        <div className="mb-6">
          <h1 className="text-3xl font-serif font-semibold text-slate-800 mb-2">Refined Sidebar Options</h1>
          <p className="text-sm text-slate-600 mb-4">Slimmer sidebar (200px) with different approaches to showing counts</p>
          <div className="flex gap-3 flex-wrap">
            {refinedOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedOption(option.id)}
                className={`px-4 py-2 rounded-2xl font-medium text-sm transition-all ${
                  selectedOption === option.id
                    ? 'bg-[#6b2358] text-white shadow-soft'
                    : 'bg-white/70 text-slate-700 hover:bg-white border border-slate-200/50'
                }`}
              >
                {option.name}
              </button>
            ))}
          </div>
          <p className="text-sm text-slate-600 mt-3">
            {refinedOptions.find(o => o.id === selectedOption)?.description}
          </p>
        </div>

        {/* Preview */}
        <div className="bg-white/40 rounded-3xl p-1 border border-slate-200/50">
          <div className="bg-[#e5e7f0] rounded-[22px] h-[800px] flex overflow-hidden">
            
            {/* Option 1: Counts on Hover */}
            {selectedOption === '1' && (
              <>
                <div className="w-[200px] bg-white/90 backdrop-blur-xl border-r border-slate-200/50 flex flex-col py-6 px-3">
                  {/* Logo */}
                  <div className="mb-6 px-1">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-serif font-semibold text-slate-800">MyApp</span>
                    </div>
                  </div>

                  {/* Main Nav */}
                  <div className="flex-1 space-y-0.5">
                    {navItems.map((item, idx) => (
                      <button 
                        key={idx} 
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl transition-all relative ${
                          idx === activeIndex
                            ? 'bg-slate-800 text-white shadow-soft' 
                            : 'text-slate-700 hover:bg-slate-100/60'
                        }`}
                        onMouseEnter={() => setHoveredItem(idx)}
                        onMouseLeave={() => setHoveredItem(null)}
                      >
                        <item.icon className="w-4.5 h-4.5 flex-shrink-0" />
                        <span className="font-medium text-sm">{item.label}</span>
                        
                        {/* Count appears on hover */}
                        {item.count && hoveredItem === idx && (
                          <span className={`ml-auto text-xs font-semibold transition-all ${
                            idx === activeIndex ? 'text-white/70' : 'text-slate-500'
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
                <div className="flex-1 p-8 overflow-auto">
                  <DemoContent />
                </div>
              </>
            )}

            {/* Option 2: Subtle Gray Text */}
            {selectedOption === '2' && (
              <>
                <div className="w-[200px] bg-white/90 backdrop-blur-xl border-r border-slate-200/50 flex flex-col py-6 px-3">
                  {/* Logo */}
                  <div className="mb-6 px-1">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-serif font-semibold text-slate-800">MyApp</span>
                    </div>
                  </div>

                  {/* Main Nav */}
                  <div className="flex-1 space-y-0.5">
                    {navItems.map((item, idx) => (
                      <button 
                        key={idx} 
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl transition-all ${
                          idx === activeIndex
                            ? 'bg-slate-800 text-white shadow-soft' 
                            : 'text-slate-700 hover:bg-slate-100/60'
                        }`}
                      >
                        <item.icon className="w-4.5 h-4.5 flex-shrink-0" />
                        <span className="font-medium text-sm flex-1 text-left">{item.label}</span>
                        
                        {/* Subtle count always visible */}
                        {item.count && (
                          <span className={`text-xs font-medium ${
                            idx === activeIndex ? 'text-white/50' : 'text-slate-400'
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
                <div className="flex-1 p-8 overflow-auto">
                  <DemoContent />
                </div>
              </>
            )}

            {/* Option 3: Stats at Top */}
            {selectedOption === '3' && (
              <>
                <div className="w-[200px] bg-white/90 backdrop-blur-xl border-r border-slate-200/50 flex flex-col py-6 px-3">
                  {/* Logo */}
                  <div className="mb-4 px-1">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-serif font-semibold text-slate-800">MyApp</span>
                    </div>
                  </div>

                  {/* Overview Stats Card */}
                  <div className="mb-5 bg-gradient-to-br from-slate-50 to-slate-100/40 rounded-2xl p-3 border border-slate-200/30">
                    <div className="text-xs font-semibold text-slate-500 mb-2">TODAY</div>
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div>
                        <div className="text-lg font-semibold text-slate-800">12</div>
                        <div className="text-xs text-slate-500">Tasks</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-slate-800">5</div>
                        <div className="text-xs text-slate-500">Content</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-slate-800">3</div>
                        <div className="text-xs text-slate-500">Events</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-slate-800">8</div>
                        <div className="text-xs text-slate-500">Nurtures</div>
                      </div>
                    </div>
                  </div>

                  {/* Main Nav - No Counts */}
                  <div className="flex-1 space-y-0.5">
                    {navItems.map((item, idx) => (
                      <button 
                        key={idx} 
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl transition-all ${
                          idx === activeIndex
                            ? 'bg-slate-800 text-white shadow-soft' 
                            : 'text-slate-700 hover:bg-slate-100/60'
                        }`}
                      >
                        <item.icon className="w-4.5 h-4.5 flex-shrink-0" />
                        <span className="font-medium text-sm">{item.label}</span>
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
                <div className="flex-1 p-8 overflow-auto">
                  <DemoContent />
                </div>
              </>
            )}

            {/* Option 4: Progress Indicators */}
            {selectedOption === '4' && (
              <>
                <div className="w-[200px] bg-white/90 backdrop-blur-xl border-r border-slate-200/50 flex flex-col py-6 px-3">
                  {/* Logo */}
                  <div className="mb-6 px-1">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-serif font-semibold text-slate-800">MyApp</span>
                    </div>
                  </div>

                  {/* Main Nav */}
                  <div className="flex-1 space-y-0.5">
                    {navItems.map((item, idx) => {
                      const maxCount = 50; // For scaling the indicator
                      const percentage = item.count ? Math.min((item.count / maxCount) * 100, 100) : 0;
                      
                      return (
                        <div key={idx}>
                          <button 
                            className={`w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl transition-all ${
                              idx === activeIndex
                                ? 'bg-slate-800 text-white shadow-soft' 
                                : 'text-slate-700 hover:bg-slate-100/60'
                            }`}
                          >
                            <item.icon className="w-4.5 h-4.5 flex-shrink-0" />
                            <span className="font-medium text-sm">{item.label}</span>
                          </button>
                          
                          {/* Subtle progress bar below */}
                          {item.count && percentage > 0 && (
                            <div className="h-0.5 mx-2.5 mt-1 mb-0.5 bg-slate-200/50 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all ${
                                  idx === activeIndex ? 'bg-white/40' : 'bg-slate-400/40'
                                }`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
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
                <div className="flex-1 p-8 overflow-auto">
                  <DemoContent />
                </div>
              </>
            )}

            {/* Option 5: No Counts in Nav */}
            {selectedOption === '5' && (
              <>
                <div className="w-[200px] bg-white/90 backdrop-blur-xl border-r border-slate-200/50 flex flex-col py-6 px-3">
                  {/* Logo */}
                  <div className="mb-6 px-1">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-serif font-semibold text-slate-800">MyApp</span>
                    </div>
                  </div>

                  {/* Main Nav - Clean, no indicators */}
                  <div className="flex-1 space-y-0.5">
                    {navItems.map((item, idx) => (
                      <button 
                        key={idx} 
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl transition-all ${
                          idx === activeIndex
                            ? 'bg-slate-800 text-white shadow-soft' 
                            : 'text-slate-700 hover:bg-slate-100/60'
                        }`}
                      >
                        <item.icon className="w-4.5 h-4.5 flex-shrink-0" />
                        <span className="font-medium text-sm">{item.label}</span>
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
                <div className="flex-1 p-8 overflow-auto">
                  <DemoContent viewTitle="Tasks" count={12} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Demo content placeholder
function DemoContent({ viewTitle = "Today", count }: { viewTitle?: string; count?: number }) {
  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-baseline gap-3">
          <h2 className="text-3xl font-serif font-semibold text-slate-800">{viewTitle}</h2>
          {count && (
            <span className="text-lg text-slate-500 font-medium">({count})</span>
          )}
        </div>
        <p className="text-sm text-slate-600 mt-1">Friday, December 5, 2025</p>
      </div>
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/50 shadow-subtle h-[300px]">
        <div className="text-center text-slate-400 pt-20">
          <Calendar className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-sm">Your timeline content would appear here</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 border border-slate-200/50 shadow-subtle h-32"></div>
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 border border-slate-200/50 shadow-subtle h-32"></div>
      </div>
    </div>
  );
}
