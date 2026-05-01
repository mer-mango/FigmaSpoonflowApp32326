# Timeline Component Designs

This folder contains 3 new timeline design options for the Today Page.

## Files

### `TimelineDesign_Option1.tsx` - Time-Focused
- Emphasizes duration, countdown timers, and time tracking
- Visual duration bars (height scales with time)
- Time range displays: "7:00 AM–7:45 AM (45 min)"
- Active block countdown with progress bar
- Future time indicators
- Status circles for completion

### `TimelineDesign_Option2.tsx` - Content-Focused  
- Emphasizes context, details, and meeting information
- Expandable cards on active/playing state
- Attendee avatars and pills
- Two-tier text hierarchy
- Varied card sizes based on state
- Action buttons on active cards

### `TimelineDesign_Option3.tsx` - Hybrid
- Best of both time-tracking and content richness
- Smart density (compact → expanded)
- Progress bars + countdown timers
- Collapsible details
- Inline quick actions
- Flexible detail levels

## Props Interface

All designs use the same props interface:

```typescript
interface TimelineDesignProps {
  timeBlocks: TimelineBlock[];
  playingBlockId: string | null;
  completedBlocks: Set<string>;
  currentTime: Date;
  playlists?: any;
  onPlayBlock: (id: string) => void;
  onPauseBlock: () => void;
  onCompleteBlock: (id: string) => void;
  onDragStart: (id: string) => void;
  onDragOver: (id: string) => void;
  onDrop: (id: string) => void;
  onTimeClick: (id: string) => void;
  onDurationClick: (id: string) => void;
  onTitleClick: (id: string) => void;
  selectedPlaylist?: string | null;
  onPlaylistClick?: (playlistId: string) => void;
}
```

## Usage

```tsx
import { TimelineDesign_Option1 } from './timeline/TimelineDesign_Option1';

<TimelineDesign_Option1
  timeBlocks={timeBlocks}
  playingBlockId={playingBlockId}
  completedBlocks={completedBlocks}
  currentTime={currentTime}
  playlists={playlists}
  onPlayBlock={handlePlayBlock}
  onPauseBlock={handlePauseBlock}
  onCompleteBlock={handleCompleteBlock}
  onDragStart={handleDragStart}
  onDragOver={handleDragOver}
  onDrop={handleDrop}
  onTimeClick={handleTimeClick}
  onDurationClick={handleDurationClick}
  onTitleClick={handleTitleClick}
  selectedPlaylist={selectedPlaylist}
  onPlaylistClick={handlePlaylistClick}
/>
```

## Test/Preview

View all designs in action:
```
?page=timeline-designs
```

## Original Design

The original horizontal block design is preserved in:
`/components/TodayPageFilledExample_Muted.tsx`
