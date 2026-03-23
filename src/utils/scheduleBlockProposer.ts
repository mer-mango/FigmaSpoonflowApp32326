import { TimeBlock, CalendarChange } from '../components/JamieCalendarChangeDialog';

interface Meeting {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  date: string;
}

interface ScheduleConstraints {
  workDayStart: string; // HH:MM format, e.g., "09:00"
  workDayEnd: string;   // HH:MM format, e.g., "17:00"
  bufferDuration: number; // minutes, default 15
  minFocusBlockDuration: number; // minutes, default 60
  preferredFocusBlockTimes?: string[]; // Array of preferred start times for focus blocks
}

const DEFAULT_CONSTRAINTS: ScheduleConstraints = {
  workDayStart: '09:00',
  workDayEnd: '17:00',
  bufferDuration: 15,
  minFocusBlockDuration: 60,
  preferredFocusBlockTimes: ['09:00', '10:00', '14:00']
};

/**
 * Convert HH:MM time string to minutes since midnight
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Convert minutes since midnight to HH:MM time string
 */
function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Sort meetings by start time
 */
function sortMeetingsByTime(meetings: Meeting[]): Meeting[] {
  return [...meetings].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
}

/**
 * Find gaps between meetings where focus blocks or buffers can fit
 */
interface TimeGap {
  startTime: string;
  endTime: string;
  durationMinutes: number;
}

function findTimeGaps(meetings: Meeting[], constraints: ScheduleConstraints): TimeGap[] {
  const sortedMeetings = sortMeetingsByTime(meetings);
  const gaps: TimeGap[] = [];
  
  const workDayStartMinutes = timeToMinutes(constraints.workDayStart);
  const workDayEndMinutes = timeToMinutes(constraints.workDayEnd);
  
  // Gap before first meeting
  if (sortedMeetings.length === 0) {
    gaps.push({
      startTime: constraints.workDayStart,
      endTime: constraints.workDayEnd,
      durationMinutes: workDayEndMinutes - workDayStartMinutes
    });
  } else {
    const firstMeetingStart = timeToMinutes(sortedMeetings[0].startTime);
    if (firstMeetingStart > workDayStartMinutes) {
      gaps.push({
        startTime: constraints.workDayStart,
        endTime: sortedMeetings[0].startTime,
        durationMinutes: firstMeetingStart - workDayStartMinutes
      });
    }
    
    // Gaps between meetings
    for (let i = 0; i < sortedMeetings.length - 1; i++) {
      const currentMeetingEnd = timeToMinutes(sortedMeetings[i].endTime);
      const nextMeetingStart = timeToMinutes(sortedMeetings[i + 1].startTime);
      
      if (nextMeetingStart > currentMeetingEnd) {
        gaps.push({
          startTime: sortedMeetings[i].endTime,
          endTime: sortedMeetings[i + 1].startTime,
          durationMinutes: nextMeetingStart - currentMeetingEnd
        });
      }
    }
    
    // Gap after last meeting
    const lastMeetingEnd = timeToMinutes(sortedMeetings[sortedMeetings.length - 1].endTime);
    if (lastMeetingEnd < workDayEndMinutes) {
      gaps.push({
        startTime: sortedMeetings[sortedMeetings.length - 1].endTime,
        endTime: constraints.workDayEnd,
        durationMinutes: workDayEndMinutes - lastMeetingEnd
      });
    }
  }
  
  return gaps;
}

/**
 * Generate proposed schedule blocks based on meetings and constraints
 */
export function proposeScheduleBlocks(
  meetings: Meeting[],
  constraints: Partial<ScheduleConstraints> = {}
): TimeBlock[] {
  const finalConstraints = { ...DEFAULT_CONSTRAINTS, ...constraints };
  const blocks: TimeBlock[] = [];
  
  // Sort meetings by time
  const sortedMeetings = sortMeetingsByTime(meetings);
  
  // Add meeting blocks
  sortedMeetings.forEach(meeting => {
    blocks.push({
      id: `meeting-${meeting.id}`,
      type: 'meeting',
      title: meeting.title,
      startTime: meeting.startTime,
      endTime: meeting.endTime,
      color: '#2f829b',
      meetingId: meeting.id
    });
  });
  
  // Add buffers before each meeting (except if it's at the start of the day)
  sortedMeetings.forEach(meeting => {
    const meetingStartMinutes = timeToMinutes(meeting.startTime);
    const bufferStartMinutes = meetingStartMinutes - finalConstraints.bufferDuration;
    const workDayStartMinutes = timeToMinutes(finalConstraints.workDayStart);
    
    // Only add buffer if there's enough time before the meeting
    if (bufferStartMinutes >= workDayStartMinutes) {
      // Check if there's a previous meeting that would conflict
      const hasConflict = sortedMeetings.some(m => {
        const mEndMinutes = timeToMinutes(m.endTime);
        return mEndMinutes > bufferStartMinutes && m.id !== meeting.id;
      });
      
      if (!hasConflict) {
        blocks.push({
          id: `buffer-before-${meeting.id}`,
          type: 'buffer',
          title: `Buffer: ${meeting.title}`,
          startTime: minutesToTime(bufferStartMinutes),
          endTime: meeting.startTime,
          color: '#a8988f'
        });
      }
    }
  });
  
  // Find gaps for focus blocks
  const gaps = findTimeGaps(sortedMeetings, finalConstraints);
  
  gaps.forEach((gap, index) => {
    // After accounting for buffers, see if there's room for a focus block
    const gapStartMinutes = timeToMinutes(gap.startTime);
    const gapEndMinutes = timeToMinutes(gap.endTime);
    
    // Check if any buffers occupy this gap
    const buffersInGap = blocks.filter(
      b => b.type === 'buffer' && 
      timeToMinutes(b.startTime) < gapEndMinutes && 
      timeToMinutes(b.endTime) > gapStartMinutes
    );
    
    // Calculate available time after buffers
    let availableStart = gapStartMinutes;
    let availableEnd = gapEndMinutes;
    
    buffersInGap.forEach(buffer => {
      const bufferEnd = timeToMinutes(buffer.endTime);
      if (bufferEnd > availableStart) {
        availableStart = bufferEnd;
      }
    });
    
    const availableDuration = availableEnd - availableStart;
    
    // If there's enough time for a focus block, add it
    if (availableDuration >= finalConstraints.minFocusBlockDuration) {
      blocks.push({
        id: `focus-${index}`,
        type: 'focus',
        title: 'Focus Time',
        startTime: minutesToTime(availableStart),
        endTime: minutesToTime(availableEnd),
        color: '#938aa9'
      });
    }
  });
  
  // Sort all blocks by start time
  return blocks.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
}

/**
 * Detect changes between old and new meetings
 */
export function detectCalendarChanges(
  oldMeetings: Meeting[],
  newMeetings: Meeting[],
  date: string
): CalendarChange[] {
  const changes: CalendarChange[] = [];
  
  // Detect new and modified meetings
  newMeetings.forEach(newMeeting => {
    const oldMeeting = oldMeetings.find(m => m.id === newMeeting.id);
    
    if (!oldMeeting) {
      // New meeting
      changes.push({
        id: `change-new-${newMeeting.id}`,
        type: 'new',
        meeting: {
          id: newMeeting.id,
          title: newMeeting.title,
          startTime: newMeeting.startTime,
          endTime: newMeeting.endTime,
          date: date
        }
      });
    } else if (
      oldMeeting.startTime !== newMeeting.startTime ||
      oldMeeting.endTime !== newMeeting.endTime
    ) {
      // Modified meeting time
      changes.push({
        id: `change-modified-${newMeeting.id}`,
        type: 'modified',
        meeting: {
          id: newMeeting.id,
          title: newMeeting.title,
          startTime: newMeeting.startTime,
          endTime: newMeeting.endTime,
          date: date
        },
        previousTime: {
          startTime: oldMeeting.startTime,
          endTime: oldMeeting.endTime
        }
      });
    }
  });
  
  // Detect cancelled meetings
  oldMeetings.forEach(oldMeeting => {
    const stillExists = newMeetings.find(m => m.id === oldMeeting.id);
    
    if (!stillExists) {
      changes.push({
        id: `change-cancelled-${oldMeeting.id}`,
        type: 'cancelled',
        meeting: {
          id: oldMeeting.id,
          title: oldMeeting.title,
          startTime: oldMeeting.startTime,
          endTime: oldMeeting.endTime,
          date: date
        }
      });
    }
  });
  
  return changes;
}

/**
 * Generate a human-readable reason for the proposed changes
 */
export function generateChangeReason(changes: CalendarChange[]): string {
  if (changes.length === 0) {
    return "I've optimized your schedule to include focus time and transition buffers.";
  }
  
  const newCount = changes.filter(c => c.type === 'new').length;
  const modifiedCount = changes.filter(c => c.type === 'modified').length;
  const cancelledCount = changes.filter(c => c.type === 'cancelled').length;
  
  const reasons: string[] = [];
  
  if (newCount > 0) {
    reasons.push(`${newCount} new meeting${newCount > 1 ? 's were' : ' was'} added`);
  }
  
  if (modifiedCount > 0) {
    reasons.push(`${modifiedCount} meeting${modifiedCount > 1 ? 's changed time' : ' changed time'}`);
  }
  
  if (cancelledCount > 0) {
    reasons.push(`${cancelledCount} meeting${cancelledCount > 1 ? 's were' : ' was'} cancelled`);
  }
  
  const reasonText = reasons.join(', ');
  
  return `I noticed ${reasonText}. I've adjusted your schedule to add transition buffers before meetings and maximize your focus time in the gaps. This keeps your day flowing smoothly while protecting time for deep work.`;
}
