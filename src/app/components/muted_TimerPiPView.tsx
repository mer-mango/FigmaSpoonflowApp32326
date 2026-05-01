import React, { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';

interface TimerPiPViewProps {
  blockTitle: string;
  endTime: Date;
}

export function TimerPiPView({ blockTitle, endTime }: TimerPiPViewProps) {
  const [timeRemaining, setTimeRemaining] = useState('');
  const [percentRemaining, setPercentRemaining] = useState(100);
  
  useEffect(() => {
    const totalDuration = 60 * 60000; // Assume 60 min max for percentage calculation
    
    const updateTimer = () => {
      const now = new Date();
      const diff = endTime.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeRemaining('0:00');
        setPercentRemaining(0);
        // Update document title
        document.title = '⏰ Time\'s Up!';
        
        // Flash the window to get attention
        if (document.hasFocus()) {
          // If already focused, just update title
        } else {
          // Browser will show notification-like behavior in taskbar/dock
        }
        return;
      }
      
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      const formattedTime = `${minutes}:${String(seconds).padStart(2, '0')}`;
      setTimeRemaining(formattedTime);
      
      // Calculate percentage
      const percent = Math.min(100, (diff / totalDuration) * 100);
      setPercentRemaining(percent);
      
      // Update document title to show countdown
      document.title = `⏱ ${formattedTime}`;
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    
    return () => {
      clearInterval(interval);
    };
  }, [endTime]);
  
  return (
    <div className="h-screen w-full bg-gradient-to-br from-white to-slate-50 flex flex-col items-center justify-center p-8">
      {/* Icon - smaller and more compact */}
      <div className="mb-3">
        <div className="w-12 h-12 rounded-full bg-[#5e2350]/10 flex items-center justify-center">
          <Timer className="w-6 h-6 text-[#5e2350]" />
        </div>
      </div>
      
      {/* Block Title - Larger and more prominent */}
      <p className="text-lg text-slate-700 mb-6 text-center font-semibold">{blockTitle}</p>
      
      {/* Countdown - Even larger */}
      <div className="text-7xl font-serif font-semibold text-[#5e2350] mb-8 tabular-nums">
        {timeRemaining}
      </div>
      
      {/* Progress Bar - Slightly larger */}
      <div className="w-full max-w-md h-4 bg-slate-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-[#5e2350] transition-all duration-1000 ease-linear rounded-full"
          style={{ width: `${percentRemaining}%` }}
        />
      </div>
      
      {/* Time's Up Message */}
      {percentRemaining === 0 && (
        <div className="mt-6 text-center">
          <p className="text-lg font-semibold text-[#5e2350] animate-pulse">
            Time's Up! ⏰
          </p>
          <p className="text-sm text-slate-600 mt-2">
            Check your main window for options
          </p>
        </div>
      )}
    </div>
  );
}