/**
 * Week View
 * Displays calendar in weekly format
 */

import React from 'react';
import type { CalendarEvent } from '../types/calendar';

interface WeekViewProps {
  events: CalendarEvent[];
  currentDate: Date;
  onEventClick?: (event: CalendarEvent) => void;
}

export function WeekView({ events, currentDate, onEventClick }: WeekViewProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Week view coming soon...</p>
    </div>
  );
}
