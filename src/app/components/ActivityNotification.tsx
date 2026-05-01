import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { brandColors } from '../lib/colors';

interface ActivityNotificationProps {
  title: string;
  startTime: string;
  duration: number;
  onDismiss: () => void;
}

export function ActivityNotification({ title, startTime, duration, onDismiss }: ActivityNotificationProps) {
  // Auto-play a gentle notification sound
  useEffect(() => {
    // Create a gentle two-tone chime using Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // First tone (higher, softer)
      const oscillator1 = audioContext.createOscillator();
      const gainNode1 = audioContext.createGain();
      
      oscillator1.type = 'sine';
      oscillator1.frequency.setValueAtTime(800, audioContext.currentTime); // Higher frequency
      gainNode1.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode1.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + 0.05); // Gentle fade in
      gainNode1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5); // Gentle fade out
      
      oscillator1.connect(gainNode1);
      gainNode1.connect(audioContext.destination);
      oscillator1.start(audioContext.currentTime);
      oscillator1.stop(audioContext.currentTime + 0.5);
      
      // Second tone (lower, even softer) - plays slightly after
      const oscillator2 = audioContext.createOscillator();
      const gainNode2 = audioContext.createGain();
      
      oscillator2.type = 'sine';
      oscillator2.frequency.setValueAtTime(600, audioContext.currentTime + 0.1); // Lower frequency, delayed
      gainNode2.gain.setValueAtTime(0, audioContext.currentTime + 0.1);
      gainNode2.gain.linearRampToValueAtTime(0.12, audioContext.currentTime + 0.15); // Even gentler
      gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.7);
      
      oscillator2.connect(gainNode2);
      gainNode2.connect(audioContext.destination);
      oscillator2.start(audioContext.currentTime + 0.1);
      oscillator2.stop(audioContext.currentTime + 0.7);
    } catch (error) {
      // Silently fail if Web Audio API is not supported
      console.log('Could not play notification sound:', error);
    }
  }, []);

  return (
    <div className="fixed top-20 right-6 z-[9999] animate-slide-in">
      <div 
        className="bg-white rounded-2xl shadow-2xl border-2 min-w-[320px] max-w-md overflow-hidden"
        style={{ borderColor: brandColors.primary }}
      >
        {/* Header Bar */}
        <div 
          className="px-4 py-2 flex items-center justify-between"
          style={{ backgroundColor: brandColors.primary }}
        >
          <span className="text-white font-bold text-sm">Activity Starting</span>
          <button
            onClick={onDismiss}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="text-center space-y-2">
            <p className="text-lg font-bold text-gray-900">{startTime} {title}</p>
            <p className="text-sm text-gray-600">({duration}m)</p>
            <p 
              className="text-2xl font-bold mt-3"
              style={{ color: brandColors.primary }}
            >
              starting now
            </p>
          </div>
        </div>

        {/* Dismiss Button */}
        <div className="px-4 pb-4">
          <button
            onClick={onDismiss}
            className="w-full py-2 rounded-lg font-medium text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: brandColors.primary }}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}