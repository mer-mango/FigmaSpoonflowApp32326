/**
 * SpoonFlow Standard Color Palette
 * 
 * These colors are locked and should be used consistently across the app
 * for their respective categories.
 */

export const STANDARD_COLORS = {
  // Page/Category Colors
  today: {
    bg: 'bg-slate-600',
    text: 'text-slate-600',
    hex: '#64748b',
  },
  calendar: {
    bg: 'bg-[#6b7b98]',
    text: 'text-[#6b7b98]',
    hex: '#6b7b98',
    label: 'Dusty blue / Slate blue',
  },
  tasks: {
    bg: 'bg-[#8d7f9a]',
    text: 'text-[#8d7f9a]',
    hex: '#8d7f9a',
    label: 'Dusty berry / Soft plum',
  },
  content: {
    bg: 'bg-[#d4a99f]',
    text: 'text-[#d4a99f]',
    hex: '#d4a99f',
    label: 'Soft salmon / Peachy',
  },
  contacts: {
    bg: 'bg-[#8ba5a8]',
    text: 'text-[#8ba5a8]',
    hex: '#8ba5a8',
    label: 'Muted cyan / Teal',
  },
  nurtures: {
    bg: 'bg-[#8fa890]',
    text: 'text-[#8fa890]',
    hex: '#8fa890',
    label: 'Sage / Seafoam green',
  },
  goals: {
    bg: 'bg-[#b08b9b]',
    text: 'text-[#b08b9b]',
    hex: '#b08b9b',
    label: 'Dusty rose / Mauve',
  },
  
  // Special Colors
  jamie: {
    bg: 'bg-[#5e2350]',
    text: 'text-[#5e2350]',
    hex: '#5e2350',
    label: 'AI features only - Dusky plum',
  },
} as const;

/**
 * Usage examples:
 * 
 * For Tailwind classes:
 * - className={STANDARD_COLORS.tasks.bg}
 * - className={STANDARD_COLORS.nurtures.text}
 * 
 * For inline styles or direct hex values:
 * - style={{ backgroundColor: STANDARD_COLORS.content.hex }}
 */