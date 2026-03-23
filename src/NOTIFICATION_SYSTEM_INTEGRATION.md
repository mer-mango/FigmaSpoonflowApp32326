# Section 10: Notifications System - Integration Guide

## ✅ Completed Components

### 1. Core Notification System (`/utils/notificationHelpers.ts`)
- Notification types: status_change, action_required, form_completed, payment_received
- Priority levels: urgent, normal, low
- localStorage persistence
- Desktop notification support
- Sound notifications
- Notification preferences management

### 2. Notification Bell UI (`/components/muted_NotificationBell.tsx`)
- Beautiful dropdown panel with unread badge
- Red pulsing badge for urgent notifications
- Sort by unread first, then timestamp
- Mark as read, mark all as read, delete
- Deep links to contact engagement tabs
- Priority-based color coding

### 3. Notification Context (`/contexts/NotificationContext.tsx`)
- React Context for app-wide notification state
- Helper functions to create notifications
- Preference management
- Toast integration (Sonner)
- Desktop notification integration

### 4. Settings Integration (`/components/muted_NotificationSettings.tsx`)
- Added "Client Journeys & Status Changes" section with:
  - Journey Status Changed
  - My Move Alert (always alert when it's my move)
  - Form Completed
  - Payment Received
  - Station Advanced
  - Stuck Too Long (with configurable days)

## 🚧 Integration Steps

### Step 1: Wrap App with NotificationProvider

In your `App.tsx`, wrap the entire app with the NotificationProvider:

```tsx
import { NotificationProvider } from './contexts/NotificationContext';
import { Toaster } from 'sonner@2.0.3';

function App() {
  return (
    <NotificationProvider>
      <Toaster position="top-right" richColors />
      {/* Rest of your app */}
    </NotificationProvider>
  );
}
```

### Step 2: Use Notification Bell in Layout

The SharedLayout already has a notification button. Update it to use the notification context:

```tsx
import { useNotifications } from '../contexts/NotificationContext';
import { MutedNotificationBell } from './muted_NotificationBell';

// Inside your layout component:
const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotifications();
const [showNotificationPanel, setShowNotificationPanel] = useState(false);

// Update the bell button to toggle panel
<button onClick={() => setShowNotificationPanel(!showNotificationPanel)}>
  <Bell />
  {unreadCount > 0 && <span>{unreadCount}</span>}
</button>

// Render notification panel
{showNotificationPanel && (
  <MutedNotificationBell
    notifications={notifications}
    onMarkAsRead={markAsRead}
    onMarkAllAsRead={markAllAsRead}
    onDelete={removeNotification}
    onNotificationClick={(notification) => {
      // Navigate to deep link
      navigate(notification.deepLink);
      markAsRead(notification.id);
      setShowNotificationPanel(false);
    }}
  />
)}
```

### Step 3: Trigger Notifications on Status Changes

In your contact management code, whenever a status changes:

```tsx
import { useNotifications } from '../contexts/NotificationContext';

const { notifyStatusChange, notifyFormCompleted, notifyPaymentReceived } = useNotifications();

// When a contact status changes:
const handleStatusChange = (contact, oldStatus, newStatus, whoseMove) => {
  // Update contact in database
  updateContact(contact.id, { status: newStatus });
  
  // Trigger notification
  notifyStatusChange(
    contact.id,
    contact.name,
    oldStatus,
    newStatus,
    whoseMove
  );
};

// When a form is completed:
notifyFormCompleted(
  contact.id,
  contact.name,
  'Onboarding Form',
  'Prospect - Form Completed - My Move'
);

// When a payment is received:
notifyPaymentReceived(
  contact.id,
  contact.name,
  5000,
  'USD',
  'Client - Payment Received - My Move'
);
```

### Step 4: Today Page Integration

Update the Journey card on the Today page to show "Action Required" count from notifications:

```tsx
import { useNotifications } from '../contexts/NotificationContext';

const { notifications } = useNotifications();

// Filter for "My Move" notifications
const myMoveCount = notifications.filter(
  n => !n.read && n.whoseMove === 'my_move'
).length;

// Show in Journey card
<div className="text-red-600">
  {myMoveCount} require your action
</div>
```

### Step 5: Client Hub Integration

In the Client Hub's Action Required Inbox, filter and display notifications:

```tsx
import { useNotifications } from '../contexts/NotificationContext';

const { notifications, markAsRead } = useNotifications();

// Filter for unread "My Move" notifications
const actionRequiredNotifications = notifications.filter(
  n => !n.read && n.whoseMove === 'my_move'
);

// Display in Action Required Inbox
{actionRequiredNotifications.map(notification => (
  <div key={notification.id} onClick={() => {
    markAsRead(notification.id);
    navigate(notification.deepLink);
  }}>
    <h4>{notification.contactName}</h4>
    <p>{notification.message}</p>
    <span>{notification.fullStatus}</span>
  </div>
))}
```

### Step 6: Settings Integration

Update the Settings page to use the notification preferences:

```tsx
import { useNotifications } from '../contexts/NotificationContext';
import { MutedNotificationSettings } from './muted_NotificationSettings';

const { preferences, updatePreferences } = useNotifications();

// In your Settings page where notifications section is:
{activeSection === 'notifications' && (
  <MutedNotificationSettings
    preferences={preferences}
    onSave={updatePreferences}
  />
)}
```

## 📧 Email Notifications (Backend - TODO)

To add email notifications, create a Supabase Edge Function:

```typescript
// /supabase/functions/server/index.tsx

app.post('/make-server-a89809a8/send-notification-email', async (c) => {
  const { contactName, message, fullStatus, deepLink, recipientEmail } = await c.req.json();
  
  // Use an email service (e.g., SendGrid, Resend, etc.)
  // Send email with notification details
  
  return c.json({ success: true });
});
```

Then call this from the NotificationContext when emailNotifications is enabled.

## 🎯 Features Checklist

✅ Status change triggers notification
✅ Notification includes: full status, whose move, deep link
✅ Desktop notifications respect settings
✅ "Action Required" feels urgent (red, pulsing badge, sound)
✅ Toast notifications (in-app)
✅ Notification bell in nav with unread count
✅ Notification preferences in Settings
✅ Client Journey specific settings

🚧 TODO:
- Email notification backend
- Integration with Today page Journey card
- Integration with Client Hub Action Required Inbox

## 🎨 Design Notes

- **Urgent notifications** (My Move): Red badges, pulsing animation, longer toast duration, requireInteraction for desktop
- **Normal notifications** (Their Move): Amber badges, standard toast, auto-close desktop
- **Low priority** (Waiting): Gray badges, brief toast

## 🔧 Customization

You can customize notification behavior in `/utils/notificationHelpers.ts`:
- Sound pitch and duration
- Desktop notification auto-close timing
- Toast duration
- Badge colors and animations
