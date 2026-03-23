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
  Clock,
  BarChart3,
  Bell,
  Search,
  Plus,
  ChevronRight,
  ChevronLeft,
  Zap,
  Folder,
  Star,
  Archive,
  Sprout,
  Pin,
  User
} from 'lucide-react';

interface NavOption {
  id: string;
  name: string;
  description: string;
}

const navOptions: NavOption[] = [
  { id: '1', name: 'Minimal Icon Bar', description: 'Slim vertical icon strip with tooltips' },
  { id: '2', name: 'Expanded Sidebar', description: 'Full labels with icons and sections' },
  { id: '3', name: 'Collapsible Drawer', description: 'Hover/click to expand, collapses to icons' },
  { id: '4', name: 'Floating Pill Nav', description: 'Detached rounded panel with glow' },
  { id: '5', name: 'Wide Dashboard Panel', description: 'Rich sidebar with stats and quick actions' },
];

const navItems = [
  { icon: Home, label: 'Today', badge: null, isActive: true },
  { icon: Calendar, label: 'Calendar', badge: 3, isActive: false },
  { icon: CheckSquare, label: 'Tasks', badge: 12, isActive: false },
  { icon: Pin, label: 'Content', badge: 5, isActive: false },
  { icon: Users, label: 'Contacts', badge: null, isActive: false },
  { icon: Sprout, label: 'Nurtures', badge: 8, isActive: false },
  { icon: Target, label: 'Goals', badge: null, isActive: false },
  { icon: Inbox, label: 'Inbox', badge: 24, isActive: false },
];

const bottomItems = [
  { icon: Sparkles, label: 'Jamie AI', isJamie: true },
  { icon: Settings, label: 'Settings', isJamie: false },
];

export function NavOptions() {
  const [selectedOption, setSelectedOption] = useState('1');
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="min-h-screen bg-[#e5e7f0] p-8">
      <div className="max-w-[1800px] mx-auto">
        {/* Option Selector */}
        <div className="mb-6">
          <h1 className="text-3xl font-serif font-semibold text-slate-800 mb-4">Navigation Design Options</h1>
          <div className="flex gap-3 flex-wrap">
            {navOptions.map((option) => (
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
            {navOptions.find(o => o.id === selectedOption)?.description}
          </p>
        </div>

        {/* Preview */}
        <div className="bg-white/40 rounded-3xl p-1 border border-slate-200/50">
          <div className="bg-[#e5e7f0] rounded-[22px] h-[800px] flex overflow-hidden">
            
            {/* Option 1: Minimal Icon Bar */}
            {selectedOption === '1' && (
              <>
                <div className="w-20 bg-white/90 backdrop-blur-xl border-r border-slate-200/50 flex flex-col py-6">
                  {/* Logo */}
                  <div className="flex justify-center mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  {/* Main Nav */}
                  <div className="flex-1 flex flex-col items-center gap-2">
                    {navItems.map((item, idx) => (
                      <div key={idx} className="relative group">
                        <button className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all relative ${
                          item.isActive 
                            ? 'bg-slate-800 text-white shadow-soft' 
                            : 'text-slate-600 hover:bg-slate-100/60'
                        }`}>
                          <item.icon className="w-5 h-5" />
                          {item.badge && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#c6686d] text-white text-xs font-semibold rounded-full flex items-center justify-center">
                              {item.badge}
                            </div>
                          )}
                        </button>
                        {/* Tooltip */}
                        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-800 text-white text-sm rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-10">
                          {item.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bottom Nav */}
                  <div className="flex flex-col items-center gap-2 mt-4 pt-4 border-t border-slate-200/50">
                    {bottomItems.map((item, idx) => (
                      <div key={idx} className="relative group">
                        <button className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                          item.isJamie 
                            ? 'bg-[#6b2358] text-white hover:bg-[#6b2358]/90 shadow-soft' 
                            : 'text-slate-600 hover:bg-slate-100/60'
                        }`}>
                          <item.icon className="w-5 h-5" />
                        </button>
                        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-800 text-white text-sm rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-10">
                          {item.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex-1 p-8 overflow-auto">
                  <DemoContent />
                </div>
              </>
            )}

            {/* Option 2: Expanded Sidebar */}
            {selectedOption === '2' && (
              <>
                <div className="w-64 bg-white/90 backdrop-blur-xl border-r border-slate-200/50 flex flex-col py-6 px-4">
                  {/* Logo & Search */}
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-serif font-semibold text-slate-800 text-lg">MyApp</span>
                    </div>
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text" 
                        placeholder="Search..." 
                        className="w-full pl-10 pr-4 py-2 bg-slate-100/60 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300/50"
                      />
                    </div>
                  </div>

                  {/* Main Nav */}
                  <div className="flex-1 space-y-1">
                    <div className="text-xs font-semibold text-slate-400 px-3 mb-2">MAIN</div>
                    {navItems.slice(0, 4).map((item, idx) => (
                      <button key={idx} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                        item.isActive 
                          ? 'bg-slate-800 text-white shadow-soft' 
                          : 'text-slate-700 hover:bg-slate-100/60'
                      }`}>
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium text-sm flex-1 text-left">{item.label}</span>
                        {item.badge && (
                          <div className="px-2 py-0.5 bg-[#c6686d]/20 text-[#c6686d] text-xs font-semibold rounded-full">
                            {item.badge}
                          </div>
                        )}
                      </button>
                    ))}

                    <div className="text-xs font-semibold text-slate-400 px-3 mb-2 mt-6">WORKSPACE</div>
                    {navItems.slice(4).map((item, idx) => (
                      <button key={idx} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                        item.isActive 
                          ? 'bg-slate-800 text-white shadow-soft' 
                          : 'text-slate-700 hover:bg-slate-100/60'
                      }`}>
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium text-sm flex-1 text-left">{item.label}</span>
                        {item.badge && (
                          <div className="px-2 py-0.5 bg-[#c6686d]/20 text-[#c6686d] text-xs font-semibold rounded-full">
                            {item.badge}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Bottom Nav */}
                  <div className="space-y-1 pt-4 border-t border-slate-200/50">
                    {bottomItems.map((item, idx) => (
                      <button key={idx} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                        item.isJamie 
                          ? 'bg-[#6b2358] text-white hover:bg-[#6b2358]/90 shadow-soft' 
                          : 'text-slate-700 hover:bg-slate-100/60'
                      }`}>
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium text-sm">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex-1 p-8 overflow-auto">
                  <DemoContent />
                </div>
              </>
            )}

            {/* Option 3: Collapsible Drawer */}
            {selectedOption === '3' && (
              <>
                <div 
                  className={`bg-white/90 backdrop-blur-xl border-r border-slate-200/50 flex flex-col py-6 transition-all duration-300 ${
                    isExpanded ? 'w-64 px-4' : 'w-20'
                  }`}
                  onMouseEnter={() => setIsExpanded(true)}
                  onMouseLeave={() => setIsExpanded(false)}
                >
                  {/* Logo */}
                  <div className={`mb-6 ${isExpanded ? 'px-0' : 'flex justify-center'}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center flex-shrink-0">
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                      {isExpanded && (
                        <span className="font-serif font-semibold text-slate-800 text-lg animate-in fade-in duration-200">
                          MyApp
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Main Nav */}
                  <div className="flex-1 space-y-1">
                    {navItems.map((item, idx) => (
                      <button key={idx} className={`w-full flex items-center gap-3 rounded-xl transition-all ${
                        isExpanded ? 'px-3 py-2.5' : 'px-0 py-2.5 justify-center'
                      } ${
                        item.isActive 
                          ? 'bg-slate-800 text-white shadow-soft' 
                          : 'text-slate-700 hover:bg-slate-100/60'
                      }`}>
                        <div className="relative">
                          <item.icon className="w-5 h-5" />
                          {item.badge && !isExpanded && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#c6686d] text-white text-xs font-semibold rounded-full flex items-center justify-center">
                              {item.badge > 9 ? '9+' : item.badge}
                            </div>
                          )}
                        </div>
                        {isExpanded && (
                          <>
                            <span className="font-medium text-sm flex-1 text-left animate-in fade-in duration-200">
                              {item.label}
                            </span>
                            {item.badge && (
                              <div className="px-2 py-0.5 bg-[#c6686d]/20 text-[#c6686d] text-xs font-semibold rounded-full animate-in fade-in duration-200">
                                {item.badge}
                              </div>
                            )}
                          </>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Bottom Nav */}
                  <div className="space-y-1 pt-4 border-t border-slate-200/50">
                    {bottomItems.map((item, idx) => (
                      <button key={idx} className={`w-full flex items-center gap-3 rounded-xl transition-all ${
                        isExpanded ? 'px-3 py-2.5' : 'px-0 py-2.5 justify-center'
                      } ${
                        item.isJamie 
                          ? 'bg-[#6b2358] text-white hover:bg-[#6b2358]/90 shadow-soft' 
                          : 'text-slate-700 hover:bg-slate-100/60'
                      }`}>
                        <item.icon className="w-5 h-5" />
                        {isExpanded && (
                          <span className="font-medium text-sm animate-in fade-in duration-200">
                            {item.label}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Collapse Toggle */}
                  <button 
                    className="mt-4 w-full flex items-center justify-center py-2 text-slate-400 hover:text-slate-600 transition-colors"
                    onClick={() => setIsExpanded(!isExpanded)}
                  >
                    {isExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex-1 p-8 overflow-auto">
                  <DemoContent />
                </div>
              </>
            )}

            {/* Option 4: Floating Pill Nav */}
            {selectedOption === '4' && (
              <>
                <div className="w-24 flex flex-col items-center py-8 gap-4">
                  {/* Logo */}
                  <div className="w-14 h-14 rounded-[20px] bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-soft mb-4">
                    <Zap className="w-7 h-7 text-white" />
                  </div>

                  {/* Floating Nav Pills */}
                  <div className="bg-white/90 backdrop-blur-xl rounded-[28px] p-3 border border-slate-200/50 shadow-soft space-y-2">
                    {navItems.slice(0, 4).map((item, idx) => (
                      <div key={idx} className="relative group">
                        <button className={`w-14 h-14 rounded-[20px] flex items-center justify-center transition-all relative ${
                          item.isActive 
                            ? 'bg-slate-800 text-white shadow-soft scale-105' 
                            : 'text-slate-600 hover:bg-slate-100/60 hover:scale-105'
                        }`}>
                          <item.icon className="w-5 h-5" />
                          {item.badge && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#c6686d] text-white text-xs font-semibold rounded-full flex items-center justify-center shadow-sm">
                              {item.badge}
                            </div>
                          )}
                        </button>
                        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-slate-800 text-white text-sm rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-10 shadow-soft">
                          {item.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white/90 backdrop-blur-xl rounded-[28px] p-3 border border-slate-200/50 shadow-soft space-y-2">
                    {navItems.slice(4).map((item, idx) => (
                      <div key={idx} className="relative group">
                        <button className={`w-14 h-14 rounded-[20px] flex items-center justify-center transition-all relative ${
                          item.isActive 
                            ? 'bg-slate-800 text-white shadow-soft scale-105' 
                            : 'text-slate-600 hover:bg-slate-100/60 hover:scale-105'
                        }`}>
                          <item.icon className="w-5 h-5" />
                          {item.badge && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#c6686d] text-white text-xs font-semibold rounded-full flex items-center justify-center shadow-sm">
                              {item.badge}
                            </div>
                          )}
                        </button>
                        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-slate-800 text-white text-sm rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-10 shadow-soft">
                          {item.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Jamie AI - Special */}
                  <div className="mt-auto bg-gradient-to-br from-[#6b2358] to-[#8b3978] rounded-[28px] p-3 shadow-soft">
                    <button className="w-14 h-14 rounded-[20px] bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-all">
                      <Sparkles className="w-6 h-6 text-white" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 p-8 overflow-auto">
                  <DemoContent />
                </div>
              </>
            )}

            {/* Option 5: Wide Dashboard Panel */}
            {selectedOption === '5' && (
              <>
                <div className="w-80 bg-white/90 backdrop-blur-xl border-r border-slate-200/50 flex flex-col py-6 px-5">
                  {/* Logo & Profile */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                          <Zap className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-serif font-semibold text-slate-800 text-lg">MyApp</span>
                      </div>
                      <button className="w-10 h-10 rounded-xl bg-slate-100/60 hover:bg-slate-200/60 flex items-center justify-center transition-all">
                        <Bell className="w-4 h-4 text-slate-600" />
                      </button>
                    </div>
                    
                    {/* User Profile Card */}
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100/40 rounded-2xl p-4 border border-slate-200/30">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6b7b98] to-[#7d8fb0] flex items-center justify-center text-white font-semibold">
                          JD
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-slate-800">Jane Doe</div>
                          <div className="text-xs text-slate-500">jane@example.com</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1 bg-white/60 rounded-xl p-2 text-center">
                          <div className="text-lg font-semibold text-slate-800">12</div>
                          <div className="text-xs text-slate-500">Tasks</div>
                        </div>
                        <div className="flex-1 bg-white/60 rounded-xl p-2 text-center">
                          <div className="text-lg font-semibold text-slate-800">3</div>
                          <div className="text-xs text-slate-500">Meetings</div>
                        </div>
                        <div className="flex-1 bg-white/60 rounded-xl p-2 text-center">
                          <div className="text-lg font-semibold text-slate-800">4</div>
                          <div className="text-xs text-slate-500">Goals</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="mb-6">
                    <div className="text-xs font-semibold text-slate-400 mb-3">QUICK ACTIONS</div>
                    <div className="grid grid-cols-2 gap-2">
                      <button className="flex items-center gap-2 px-3 py-2.5 bg-slate-100/60 hover:bg-slate-200/60 rounded-xl text-sm font-medium text-slate-700 transition-all">
                        <Plus className="w-4 h-4" />
                        <span>Task</span>
                      </button>
                      <button className="flex items-center gap-2 px-3 py-2.5 bg-slate-100/60 hover:bg-slate-200/60 rounded-xl text-sm font-medium text-slate-700 transition-all">
                        <Calendar className="w-4 h-4" />
                        <span>Event</span>
                      </button>
                    </div>
                  </div>

                  {/* Main Nav */}
                  <div className="flex-1 space-y-1 overflow-auto">
                    <div className="text-xs font-semibold text-slate-400 mb-2">NAVIGATION</div>
                    {navItems.map((item, idx) => (
                      <button key={idx} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                        item.isActive 
                          ? 'bg-slate-800 text-white shadow-soft' 
                          : 'text-slate-700 hover:bg-slate-100/60'
                      }`}>
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium text-sm flex-1 text-left">{item.label}</span>
                        {item.badge && (
                          <div className="px-2 py-1 bg-[#c6686d]/20 text-[#c6686d] text-xs font-semibold rounded-lg min-w-[24px] text-center">
                            {item.badge}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Jamie AI Card */}
                  <div className="mt-4 pt-4 border-t border-slate-200/50">
                    <button className="w-full bg-gradient-to-br from-[#6b2358] to-[#8b3978] rounded-2xl p-4 text-white hover:shadow-soft transition-all">
                      <div className="flex items-center gap-3 mb-2">
                        <Sparkles className="w-5 h-5" />
                        <span className="font-semibold">Jamie AI Assistant</span>
                      </div>
                      <div className="text-xs text-white/80">Ask me anything about your schedule</div>
                    </button>
                  </div>

                  {/* Settings */}
                  <button className="mt-2 w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100/60 transition-all">
                    <Settings className="w-5 h-5" />
                    <span className="font-medium text-sm">Settings</span>
                  </button>
                </div>
                <div className="flex-1 p-8 overflow-auto">
                  <DemoContent />
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
function DemoContent() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-3xl font-serif font-semibold text-slate-800 mb-2">Today</h2>
        <p className="text-sm text-slate-600">Friday, December 5, 2025</p>
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
