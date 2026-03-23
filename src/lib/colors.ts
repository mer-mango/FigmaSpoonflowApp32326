/**
 * Color System for Base44
 * 
 * Brand Colors: Used for app structure, navigation, Jamie AI
 * Muted Rainbow: Used for color coding meetings, tasks, content, etc.
 */

// ===== BRAND COLORS =====
export const brandColors = {
  primary: "#2f829b",      // Teal - Primary brand color
  primaryDark: "#034863",  // Dark blue - Navigation, headers
  ai: "#6b2358",           // Purple - AI/Jamie features
};

// ===== MUTED RAINBOW PALETTE =====
// Based on the provided Procreate palette

// Tasks, Goals, Content
export const activityColors = {
  tasks: "#7fa383",        // Muted sage green
  goals: "#d4919e",        // Muted rose pink
  content: "#e6a96f",      // Muted orange/tan
};

// Meeting Sub-calendars
export const calendarColors = {
  ehs: "#5b8ea3",          // Muted blue (EHS Meetings)
  medical: "#c6686d",      // Muted red (Medical appointments)
  virtual: "#e09470",      // Muted orange (Virtual appointments)
  cbc: "#a4606e",          // Light burgundy (CBC)
  commonGrounds: "#b08a65", // Brown (Common Grounds)
  life: "#a89bb4",         // Light purple (Life calendar)
  personal: "#a89bb4",     // Light purple (meredith.mangold@gmail.com)
};

// Full muted rainbow palette for future use
export const mutedRainbow = {
  // Row 1: Burgundy to pinks
  burgundy: "#8b2f4a",
  darkRose: "#c6686d",
  rose: "#d4919e",
  lightRose: "#e3a7a7",
  blush: "#f4c4c4",
  palePink: "#f4d4d4",
  
  // Row 2: Peaches to browns
  peach: "#e09470",
  lightPeach: "#ead0b8",
  tan: "#b08a65",
  bronze: "#c09968",
  sand: "#e6a96f",
  cream: "#f4e4b8",
  
  // Row 3: Greens and teals
  olive: "#c2b582",
  forestGreen: "#5a6d5f",
  sage: "#7fa383",
  lightSage: "#a8b89f",
  darkTeal: "#1f4747",
  teal: "#2f6d6d",
  
  // Row 4: Blues to grays
  oceanBlue: "#5b8ea3",
  dustyBlue: "#7ea5b4",
  skyBlue: "#a4c4d4",
  paleBlue: "#b8d4e4",
  lightBlue: "#d4e4ec",
  lightGray: "#e4e4e4",
  
  // Row 5: Purples and mauve
  offWhite: "#f4ebe4",
  lavender: "#a89bb4",
  mauve: "#c4a8b8",
  dustyRose: "#a4606e",
  berry: "#c47484",
  pink: "#e49bb4",
};

// ===== HELPER FUNCTIONS =====

/**
 * Get color for a specific calendar/meeting type
 */
export function getCalendarColor(calendarId: string): string {
  const calendarMap: Record<string, string> = {
    'ehs': calendarColors.ehs,
    'medical': calendarColors.medical,
    'virtual': calendarColors.virtual,
    'cbc': calendarColors.cbc,
    'commongrounds': calendarColors.commonGrounds,
    'life': calendarColors.life,
    'personal': calendarColors.personal,
  };
  
  return calendarMap[calendarId.toLowerCase()] || calendarColors.ehs;
}

/**
 * Get color for activity type (task, goal, content)
 */
export function getActivityColor(type: 'task' | 'goal' | 'content'): string {
  const activityMap = {
    'task': activityColors.tasks,
    'goal': activityColors.goals,
    'content': activityColors.content,
  };
  
  return activityMap[type];
}

/**
 * Get lighter version of a color for backgrounds
 */
export function getLightBackground(color: string): string {
  return `${color}15`; // 15 = ~8% opacity in hex
}

/**
 * Get medium version of a color for hover states
 */
export function getMediumBackground(color: string): string {
  return `${color}30`; // 30 = ~18% opacity in hex
}
