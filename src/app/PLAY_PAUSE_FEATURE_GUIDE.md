# Play/Pause Feature Implementation Guide

## Overview
Adding play/pause functionality to timeline blocks with visual feedback, progress tracking, and optional to-do playlist/focus timer display.

## Visual Design When Block is "Playing"

### 1. Shaded Background
When a block is in "play" mode, shade the entire block card with its respective color at low opacity:

```tsx
// Get the hex color for the block
const getBlockHexColor = (item: TimelineItem) => {
  if (item.type === 'meeting' && item.subtype === 'medical') return '#c6686d';
  if (item.type === 'meeting' && item.subtype === 'virtual-medical') return '#e09470';
  if (item.type === 'meeting') return '#6b7b98';
  if (item.locked) return '#6b2358';
  return '#a89bb4'; // routine default
};

// In the block's style attribute:
style={{
  backgroundColor: playingBlockId === item.id 
    ? `${getBlockHexColor(item)}15` // 15 = ~8% opacity in hex
    : undefined
}}
```

### 2. Keep Play Button Visible (as Pause Button)
When playing:
- Show **Pause button** (not hidden)
- Keep it visible alongside progress bar
- Position in top-right area of the block

### 3. Show Progress Bar
Display a progress bar showing:
- Time remaining (e.g., "42m left")
- Visual progress bar fill

```tsx
{playingBlockId === item.id && (
  <div className="mt-3 space-y-2">
    <div className="flex items-center justify-between text-sm">
      <span className="font-medium" style={{ color: getBlockHexColor(item) }}>
        {timerMinutesRemaining}m left
      </span>
      <button
        onClick={() => setPlayingBlockId(null)}
        className="p-2 rounded-lg hover:bg-black/5"
      >
        <Pause className="w-4 h-4" style={{ color: getBlockHexColor(item) }} />
      </button>
    </div>
    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
      <div 
        className="h-full rounded-full transition-all"
        style={{ 
          width: `${(1 - timerMinutesRemaining / item.duration) * 100}%`,
          backgroundColor: getBlockHexColor(item)
        }}
      />
    </div>
  </div>
)}
```

## What Triggers Display

### To-Do Playlist
**Appears when:** 
- Clicking Play on a block that has a `playlistId` property
- Shows all incomplete items in that playlist

```tsx
{playingBlockId && (
  <FloatingFocusWidget
    currentActivity={{
      title: playingBlock.name,
      duration: playingBlock.duration,
      type: playingBlock.type,
    }}
    onComplete={() => {
      toggleComplete(playingBlockId);
      setPlayingBlockId(null);
    }}
    onStatusChange={(status) => {
      console.log('Status changed:', status);
    }}
  />
)}
```

### Focus Timer
**Appears when:**
- Clicking Play on **any block** (routine, meeting prep, task time, etc.)
- Runs countdown from block's duration
- Shows notifications at 5 min warning and completion

## Implementation Steps

### Step 1: Add State
```tsx
const [playingBlockId, setPlayingBlockId] = useState<string | null>(null);
const [timerMinutesRemaining, setTimerMinutesRemaining] = useState<number>(0);
```

### Step 2: Add Play/Pause Handlers
```tsx
const handlePlayBlock = (blockId: string) => {
  const block = items.find(i => i.id === blockId);
  if (block) {
    setPlayingBlockId(blockId);
    setTimerMinutesRemaining(block.duration);
  }
};

const handlePauseBlock = () => {
  setPlayingBlockId(null);
};
```

### Step 3: Add Timer Countdown (Optional)
```tsx
useEffect(() => {
  if (!playingBlockId) return;
  
  const interval = setInterval(() => {
    setTimerMinutesRemaining(prev => {
      if (prev <= 0) {
        setPlayingBlockId(null);
        return 0;
      }
      return prev - 1;
    });
  }, 60000); // Every minute
  
  return () => clearInterval(interval);
}, [playingBlockId]);
```

### Step 4: Add Play/Pause Button to Each Block
```tsx
{!isCompleted && !isBuffer && (
  <div className="flex items-center gap-2">
    {playingBlockId === item.id ? (
      <button
        onClick={() => handlePauseBlock()}
        className="p-2 rounded-lg hover:bg-black/5"
      >
        <Pause className="w-4 h-4" />
      </button>
    ) : (
      <button
        onClick={() => handlePlayBlock(item.id)}
        className="p-2 rounded-lg hover:bg-black/5 opacity-0 group-hover:opacity-100"
      >
        <Play className="w-4 h-4" />
      </button>
    )}
  </div>
)}
```

## User Answers

### Question 1: "What will generate the to-do playlist appearing?"
**Answer:** The to-do playlist (FloatingFocusWidget) appears when:
1. You click **Play** on a block that has tasks/content/nurtures associated with it (has a `playlistId`)
2. The widget shows the playlist items for that specific block
3. It stays visible until you click Pause or Complete

### Question 2: "Same goes for focus timer?"
**Answer:** The focus timer is part of the same FloatingFocusWidget:
1. Appears when you click **Play** on ANY block (even blocks without playlists)
2. Shows countdown timer for the block's duration
3. Provides 5-minute warning and completion notifications
4. Has "Done Early" button if you finish before time's up

### Key Difference:
- **With playlist:** Widget shows timer + to-do items
- **Without playlist:** Widget shows timer only (for meetings, routines, etc.)

## Visual Summary

```
┌─────────────────────────────────────────┐
│  [PLAYING BLOCK - SHADED BACKGROUND]    │
│  ┌───┐  3:00 PM  Task Time  (60min)     │
│  │ ⌚ │                                   │
│  └───┘  Progress:  [████████░░] 42m left│
│         [Pause Button Always Visible]    │
└─────────────────────────────────────────┘

┌──────────── Floating Widget ────────────┐
│  🎯 Task Time                            │
│  Progress: 42:00                         │
│  [⏸ Pause]  [🔄 Reset]                  │
│                                          │
│  To-Do Items:                            │
│  □ Review Q4 report                      │
│  □ Update project timeline               │
│  □ Email stakeholders                    │
│                                          │
│  [✓ Done Early]  [🔕 Mute]              │
└──────────────────────────────────────────┘
```

## Next Steps

Would you like me to:
1. **Implement the full feature** with all visual changes?
2. **Just add play/pause buttons** without the widget first?
3. **Focus on a specific part** (shading, progress bar, or widget)?

Let me know your preference!
