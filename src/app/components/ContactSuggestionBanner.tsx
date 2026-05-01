import { useState, useEffect } from 'react';
import { X, Users, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { getTotalPendingCount, getActivePendingCount, loadQueueState } from '../utils/contactSuggestionQueue';

interface ContactSuggestionBannerProps {
  onViewSuggestions: () => void;
  onSnooze: (minutes: number) => void;
  onDismiss: () => void;
}

/**
 * Persistent banner that appears at top of app when there are pending contact suggestions
 * Won't disappear until user takes action
 */
export function ContactSuggestionBanner({ onViewSuggestions, onSnooze, onDismiss }: ContactSuggestionBannerProps) {
  const [totalCount, setTotalCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [snoozedCount, setSnoozedCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkPendingContacts = () => {
      const total = getTotalPendingCount();
      const active = getActivePendingCount();
      const snoozed = total - active;
      
      setTotalCount(total);
      setActiveCount(active);
      setSnoozedCount(snoozed);
      setIsVisible(total > 0);
    };

    // Initial check
    checkPendingContacts();

    // Poll for updates every 5 seconds
    const interval = setInterval(checkPendingContacts, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#2f829b] to-[#034863] text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-8 py-3 relative">
        <div className="flex items-center justify-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg flex-shrink-0">
            <Users className="w-5 h-5" />
          </div>
          
          <div className="flex flex-col">
            <div className="font-semibold text-sm text-center">
              {activeCount} {activeCount === 1 ? 'person' : 'people'} from your calendar {activeCount === 1 ? 'isn\'t' : 'aren\'t'} in SpoonFlow yet
            </div>
            <div className="text-xs text-white/80 text-center">
              Would you like to add {activeCount === 1 ? 'them' : 'them'} to your contacts?
              {snoozedCount > 0 && (
                <span className="ml-2 inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {snoozedCount} snoozed
                </span>
              )}
            </div>
          </div>

          <Button
            onClick={onViewSuggestions}
            className="bg-white text-[#2f829b] hover:bg-white/90 font-medium ml-3"
            size="sm"
          >
            Review Now
          </Button>
        </div>
        
        {/* Close button - absolutely positioned on the right */}
        <Button
          onClick={onDismiss}
          variant="ghost"
          size="sm"
          className="absolute right-8 top-1/2 -translate-y-1/2 text-white hover:bg-white/10"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}