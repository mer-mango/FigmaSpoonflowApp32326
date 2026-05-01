# Notification System - Comprehensive Trigger Reference

This document outlines all notification triggers implemented in your app. These are now configurable in **Settings → Notifications**.

---

## 🎯 **TASKS**

### Task Due Soon
- **When**: X hours before a task's due date
- **Configurable**: 1, 2, 4, 24, or 48 hours before
- **Default**: 24 hours
- **Example**: "Your task 'Prepare Q4 report' is due tomorrow"

### Task Overdue
- **When**: When a task passes its due date without completion
- **Trigger**: Daily check at 9:00 AM for overdue tasks
- **Example**: "You have 3 overdue tasks"

### Task Assigned
- **When**: A task is assigned to you (future: team collaboration)
- **Example**: "Sarah assigned 'Review proposal' to you"

### Task Completed
- **When**: You mark a task as done
- **Purpose**: Celebration/confirmation
- **Example**: "Great job! You completed 'Client call'"

### Task Comment Added
- **When**: Someone comments on your task (future: collaboration)
- **Example**: "New comment on 'Design review' from Alex"

---

## 📝 **CONTENT**

### Content Scheduled Soon
- **When**: X hours before scheduled publish time
- **Configurable**: 1, 2, 4, or 24 hours before
- **Default**: 2 hours
- **Example**: "Your LinkedIn post 'Why Patient Insight Matters' publishes in 2 hours"

### Content Ready to Schedule
- **When**: Content status changes to "Ready to Schedule"
- **Purpose**: Prompt you to schedule it
- **Example**: "Your article 'Digital Health Frameworks' is ready to schedule"

### Content Published
- **When**: Content is successfully published
- **Purpose**: Confirmation
- **Example**: "Your Substack post has been published"

### Content Reminder
- **When**: Custom reminder date you set on content
- **Example**: "Reminder: Finish draft for 'Patient Experience Story'"

### Content Deadline Approaching
- **When**: Content has a deadline approaching (3 days, 1 day, same day)
- **Example**: "Deadline tomorrow for 'Q4 Newsletter'"

---

## 📅 **CALENDAR & MEETINGS**

### Meeting Starts Soon
- **When**: X minutes before meeting start time
- **Configurable**: 5, 10, 15, or 30 minutes before
- **Default**: 15 minutes
- **Example**: "Your meeting with Dr. Sarah Chen starts in 15 minutes"

### Meeting Canceled
- **When**: A calendar event is canceled
- **Example**: "Your 2:00 PM meeting has been canceled"

### Meeting Rescheduled
- **When**: Meeting time/date changes
- **Example**: "Your meeting with John has been moved to Thursday at 3 PM"

### New Meeting Added
- **When**: New event appears on your calendar (Google Calendar sync)
- **Example**: "New meeting added: Team Standup on Monday 9 AM"

### Meeting Dossier Ready
- **When**: Jamie finishes preparing your pre-meeting research
- **Trigger**: 1 hour before meeting (or when dossier generation completes)
- **Example**: "Meeting dossier ready for Sarah Chen - Review now"

### Post-Meeting Tasks Created
- **When**: You complete the post-meeting wizard and tasks are created
- **Example**: "3 follow-up tasks created from your meeting with Acme Corp"

---

## 👥 **CONTACTS & NURTURES**

### Nurture Email Due
- **When**: X days before a nurture email is due
- **Configurable**: On due date, 1, 2, or 3 days before
- **Default**: 1 day before
- **Example**: "Time to nurture Dr. Emily Roberts - due tomorrow"

### Nurture Response Received
- **When**: A contact responds to your nurture email (future: email integration)
- **Example**: "Dr. Sarah Chen replied to your nurture email"

### Contact Birthday Upcoming
- **When**: X days before a contact's birthday
- **Configurable**: 1, 3, 7, or 14 days before
- **Default**: 7 days
- **Example**: "Sarah Chen's birthday is in one week"

### New Contact Added
- **When**: You add a new contact to your CRM
- **Purpose**: Confirmation
- **Example**: "New contact added: John Smith from Acme Healthcare"

### Contact Needs Follow-Up
- **When**: X days since last interaction (configurable threshold)
- **Trigger**: Weekly check on Mondays
- **Example**: "You haven't contacted Dr. Martinez in 60 days"

---

## 📄 **DOCUMENTS**

### Document Shared
- **When**: Someone shares a document with you (future: collaboration)
- **Example**: "Alex shared 'Q4 Strategy Doc' with you"

### Document Comment Added
- **When**: Someone comments on a document you created/shared
- **Example**: "New comment on 'Research Notes' from Sarah"

### Document Updated
- **When**: A shared document is edited by someone else
- **Example**: "Sarah updated 'Meeting Notes - Dec 12'"

---

## ✨ **JAMIE AI**

### Jamie Suggestion Available
- **When**: Jamie has a recommendation or insight
- **Examples**:
  - "Jamie suggests scheduling time for deep work this afternoon"
  - "Jamie noticed you're free Thursday - consider nurturing Dr. Chen"

### Daily Briefing
- **When**: Set time each day (e.g., 8:00 AM)
- **Configurable**: Any time
- **Default**: 8:00 AM
- **Content**: Summary of day, upcoming meetings, task priorities
- **Example**: "Good morning! You have 3 meetings today and 5 priority tasks"

### Weekly Review
- **When**: Set day each week (Monday, Friday, or Sunday)
- **Configurable**: Which day
- **Default**: Monday
- **Content**: Week summary, accomplishments, insights
- **Example**: "You completed 23 tasks this week and published 2 articles!"

### Task Recommendation
- **When**: Jamie identifies a recommended task based on patterns
- **Example**: "Jamie suggests: Follow up with Sarah about Q4 planning"

### Content Idea
- **When**: Jamie generates a content idea based on your interactions
- **Example**: "Content idea: Write about your recent patient feedback insights"

---

## 🎯 **GOALS** (Future Feature)

### Milestone Reached
- **When**: You complete a goal milestone
- **Example**: "Congratulations! You reached 50% of your Q4 writing goal"

### Goal Deadline Approaching
- **When**: Goal deadline is approaching (7 days, 3 days, 1 day)
- **Example**: "Your Q4 goal deadline is in 3 days"

### Goal Progress Update
- **When**: Weekly (set day)
- **Content**: Progress report on active goals
- **Example**: "Goal update: You're at 75% of your networking goal"

---

## 🔔 **SYSTEM & DIGESTS**

### System Updates
- **When**: Important app updates or new features
- **Example**: "New feature: Voice-to-text now available in Content Wizard"

### Weekly Digest
- **When**: Set day each week
- **Configurable**: Monday, Friday, or Sunday
- **Default**: Monday
- **Content**: Full week summary across all modules
- **Example**: "Your week: 18 tasks done, 3 posts published, 8 contacts nurtured"

### Monthly Report
- **When**: First day of each month
- **Content**: Full month analytics and insights
- **Example**: "December Report: Your most productive month yet!"

---

## ⚙️ **DELIVERY METHODS**

### In-App Notifications
- **Location**: Bell icon in left nav panel with badge counter
- **Behavior**: Slide-out panel from right side
- **Persistent**: Until dismissed or marked as read

### Email Notifications
- **When**: Based on preferences + quiet hours
- **Digest option**: Bundle similar notifications
- **Example**: "Daily Digest: 5 tasks due, 2 meetings tomorrow"

### Push Notifications
- **When**: Browser supports it
- **Behavior**: OS-level notifications
- **Requires**: User permission

---

## 🌙 **QUIET HOURS**

### Configuration
- **Default**: 10:00 PM - 8:00 AM
- **Behavior**: 
  - Non-urgent notifications held until quiet hours end
  - Urgent notifications (meeting in 5 min) still deliver
  - Batched and sent when quiet hours end

---

## 📊 **NOTIFICATION PRIORITY LEVELS**

### Critical (Always Deliver)
- Meeting starts in < 5 minutes
- Calendar event canceled
- System security alerts

### High Priority
- Task overdue
- Meeting starts soon
- Nurture email overdue
- Jamie suggestions

### Medium Priority
- Task due soon
- Content scheduled soon
- New contact added
- Document updates

### Low Priority
- Weekly/monthly digests
- Goal progress updates
- System feature announcements

---

## 🎨 **NOTIFICATION UI ELEMENTS**

### Badge Counter
- **Location**: Bell icon in left nav
- **Shows**: Unread notification count
- **Max display**: "9+" for 10+ notifications
- **Color**: Red (#ef4444)

### Notification Panel
- **Trigger**: Click bell icon
- **Size**: 480px wide, full height
- **Position**: Slides in from right
- **Sections**: All / Unread tabs
- **Actions**: Mark as read, Delete, Clear all

### Notification Item
- **Components**:
  - Type icon with color-coded background
  - Title and message
  - Timestamp ("5m ago", "2h ago", "3d ago")
  - Action buttons (on hover)
  - Unread indicator (blue dot)

---

## 🔧 **IMPLEMENTATION NOTES**

### Storage
- Notifications stored in localStorage: `app_notifications`
- Preferences stored in: `notification_preferences`
- Max stored: 100 notifications (auto-cleanup oldest)

### Triggers
- Time-based: Checked every 5 minutes
- Event-based: Immediate on user action
- Batch processing: Daily digest at configured time

### Categories (for filtering)
- Tasks
- Content
- Calendar/Meetings
- Contacts/Nurtures
- Documents
- Jamie AI
- System

---

## 📝 **NEXT STEPS TO IMPLEMENT**

1. **Wire up notification creation** when events occur throughout the app
2. **Implement time-based checks** (useEffect intervals for due dates, etc.)
3. **Persist notification preferences** to localStorage
4. **Add notification creation helpers** (e.g., `createTaskDueNotification(task)`)
5. **Implement Google Calendar webhook** for meeting notifications
6. **Add email notification service** (future)
7. **Implement push notification permissions** (future)
