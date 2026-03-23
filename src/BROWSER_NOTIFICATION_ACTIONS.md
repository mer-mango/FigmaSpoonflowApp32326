# Browser Notification Actions - How They Work

## 🎯 **What You Get**

When timeline blocks start, are ending soon, or finish, you'll get **interactive browser notifications** with action buttons.

---

## 📱 **Notification Types & Actions**

### **1. Block Starting (🎯)**
**When:** Block begins (when you click Play)  
**What You See:**
```
🎯 Starting Now
Client Check-ins (45 min)
```
**Actions:** Click to focus app window

---

### **2. 5 Minutes Left (⏰)**
**When:** 5 minutes remaining in current block  
**What You See:**
```
⏰ 5 Minutes Left
Wrapping up: Client Check-ins
```
**Actions (Desktop Only with Service Worker):**
- ✓ **I'm Done** - Complete the block now
- ⏰ **+5 min** - Extend by 5 minutes
- ⏰ **+10 min** - Extend by 10 minutes  
- ⏰ **+15 min** - Extend by 15 minutes

**Fallback (All Browsers):**  
Click notification → App focuses → Dropdown opens with same options

---

### **3. Time's Up (✅)**
**When:** Timer reaches 0:00  
**What You See:**
```
✅ Time's Up
Client Check-ins complete! Up next: Lunch Break
```
**Actions (Desktop Only with Service Worker):**
- ✓ **I'm Done** - Mark complete & show Jamie dialog
- ⏰ **+5 min** - Need more time, extend by 5 minutes
- ⏰ **+10 min** - Need more time, extend by 10 minutes
- ⏰ **+15 min** - Need more time, extend by 15 minutes

**Fallback (All Browsers):**  
Click notification → App focuses → Opens FloatingFocusWidget dropdown → Shows Jamie schedule adjustment dialog

---

## 🧠 **Jamie Schedule Adjustment**

When you finish a block (or click "I'm Done"), Jamie asks how to handle the extra time:

```
┌─────────────────────────────────────────┐
│  ✨ Nice work!                          │
│  You finished early                      │
│                                          │
│  You completed "Client Check-ins" with   │
│  12 minutes to spare.                    │
│  Your next block is "Lunch Break".       │
│                                          │
│  How would you like me to adjust your    │
│  schedule?                               │
│                                          │
│  ⏰ Move up my next block                │
│     Start "Lunch Break" now and finish   │
│     earlier                              │
│                                          │
│  ☕ Give me a break                      │
│     Enjoy 12 minutes of free time until  │
│     your next scheduled block            │
│                                          │
│  💡 I'll remember your preference for    │
│     next time                            │
└─────────────────────────────────────────┘
```

---

## 🔧 **Technical Details**

### **Browser Support**

| Browser | In-App Toast | Desktop Notification | Action Buttons |
|---------|-------------|---------------------|----------------|
| Chrome | ✅ | ✅ | ✅ (with service worker) |
| Firefox | ✅ | ✅ | ⚠️ Limited support |
| Safari | ✅ | ✅ | ❌ No support |
| Edge | ✅ | ✅ | ✅ (with service worker) |

**Fallback Behavior:**  
If action buttons aren't supported, clicking the notification:
1. Focuses the app window
2. Opens the FloatingFocusWidget dropdown
3. Shows all the same options (Complete, Snooze 5/10/15 min)

### **How It Works**

**notification onClick handler:**
```typescript
// When user clicks browser notification
desktopNotification.onclick = () => {
  window.focus(); // Bring app to front
  
  // For block notifications, trigger special handling
  if (notification.type === 'block_ended' || 'block_ending_soon') {
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('timeline-notification-action', {
      detail: { action: 'showOptions', notificationType: notification.type }
    }));
  }
  
  // Navigate to Today page
  window.location.href = notification.deepLink;
  
  desktopNotification.close();
};
```

**FloatingFocusWidget listener:**
```typescript
// Listen for notification clicks
useEffect(() => {
  const handleNotificationAction = (event: CustomEvent) => {
    const { action, notificationType } = event.detail;
    
    if (action === 'showOptions') {
      // Show dropdown with Complete/Snooze options
      setShowDropdown(true);
      
      // If timer ended, also show Jamie dialog
      if (notificationType === 'block_ended' && timeRemaining > 0) {
        setTimeSavedMinutes(Math.floor(timeRemaining / 60));
        setShowJamieDialog(true);
      }
    }
  };

  window.addEventListener('timeline-notification-action', handleNotificationAction);
}, [timeRemaining]);
```

---

## ⚙️ **User Preferences**

All notification behavior respects your settings in **Settings → Notifications**:

- ✅ **Desktop Notifications** - Enable/disable browser notifications
- 🔕 **Quiet Hours** - Suppress notifications during specified times
- 🔇 **Muted Until** - Temporary notification pause
- ⚡ **Urgent Only** - Only show high-priority notifications
- 🔊 **Sound** - Enable notification sounds

**Timeline Notifications Default Settings:**
- Priority: **Normal** (not urgent)
- Persistent: **Yes** (requires clicking to dismiss)
- Sound: **Enabled** (if global sound is on)
- Bell List: **No** (doesn't clutter notification center)

---

## 💡 **Why This Design?**

### **Browser Notifications are CRITICAL for focus work**

**Problem:** When you're in deep work in another app (Notion, Figma, Google Docs), you won't see in-app notifications.

**Solution:** Browser notifications interrupt you across all apps/windows:
- ✅ Shows even when SpoonFlow tab isn't focused
- ✅ Shows even when in another application entirely
- ✅ Persists until you take action (requireInteraction: true)
- ✅ Action buttons let you respond WITHOUT switching windows

### **Action Buttons Save Time**

Instead of:
1. See notification
2. Click to open app
3. Find the timer widget
4. Click dropdown
5. Click snooze option

You can:
1. See notification
2. Click "+10 min" button
3. Done!

### **Jamie Context Helps Decision-Making**

When timer ends, Jamie immediately asks:
- **"Move up next block"** - Finish your day earlier
- **"Give me a break"** - Use the buffer time to recharge

This forces intentionality about time management vs. just auto-advancing to the next thing.

---

## 🧪 **Testing the Flow**

1. **Create a short timeline block (5 minutes)**
2. **Click Play** → See "🎯 Starting Now" notification
3. **Wait 4 minutes** → No notification yet (5-min warning at 5:00 remaining)
4. **Wait 1 more minute** → See "⏰ 5 Minutes Left" notification
5. **Click notification** → App focuses, dropdown opens
6. **Wait for timer to reach 0:00** → See "✅ Time's Up" notification
7. **Click notification** → Jamie dialog opens asking how to adjust schedule
8. **Choose "Move up next block"** or "Give me a break"

---

**Last Updated:** January 24, 2026  
**Version:** E6A - Timeline Notifications with Action Buttons
