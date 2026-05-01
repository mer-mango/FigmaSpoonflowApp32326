# SpoonFlow App Cleanup Audit

## ✅ ACTIVE & ESSENTIAL FILES

### Core App Files
- `/App.tsx` - Main application entry point
- `/styles/globals.css` - Global styling

### Active Components (Currently Used in App.tsx)
- `/components/SubwayTimeline.tsx` - Today page timeline
- `/components/TasksPage.tsx` - Tasks page
- `/components/ContactsPage.tsx` - Contacts page
- `/components/CalendarPage.tsx` - Calendar page
- `/components/muted_CalendarPage.tsx` - Alternative calendar view
- `/components/SharedLayout_Muted.tsx` - Layout wrapper
- `/components/PageHeader_Muted.tsx` - Page header component
- `/components/muted_TaskModal.tsx` - Task editing modal
- `/components/ContactProfileModal.tsx` - Contact profile modal
- `/components/muted_StartMyTaskModal.tsx` - Start task modal
- `/components/muted_VoiceInputModal.tsx` - Voice input modal
- `/components/muted_JamieChatPanel.tsx` - Jamie AI chat panel
- `/components/muted_TimerPiPView.tsx` - Picture-in-picture timer
- `/components/muted_ContentPage_Integrated.tsx` - Content management page
- `/components/muted_PostMeetingWizard.tsx` - Post-meeting wizard
- `/components/CalendarDossierSync.tsx` - Calendar/dossier sync
- `/components/NotificationSchedulerBridge.tsx` - Notification scheduling bridge
- `/components/muted_DocumentsPage_Combined.tsx` - Documents page
- `/components/muted_SettingsPage.tsx` - Settings page
- `/components/muted_NurturesView.tsx` - Nurture items view
- `/components/FathomDiagnostic.tsx` - Fathom integration diagnostics
- `/components/ContactSuggestionBanner.tsx` - Contact suggestion banner
- `/components/ContactSuggestionModal.tsx` - Contact suggestion modal
- `/components/ContactQueueProgressDialog.tsx` - Contact queue progress
- `/components/FathomSyncPrompt.tsx` - Fathom sync prompt
- `/components/MeetingSelector.tsx` - Meeting selector

### Active Navigation Components
- `/components/navigation/NavOptions.tsx`
- `/components/navigation/NavRefinedOptions.tsx`
- `/components/navigation/NavColoredVersion.tsx`

### Active Today Page Components
- `/components/today/AMWizard.tsx` - AM planning wizard
- `/components/today/PMWizard.tsx` - PM wind-down wizard
- `/components/today/TodosReview.tsx` - To-do review component
- `/components/today/DraggableTaskItem.tsx` - Draggable task items
- `/components/today/DraggableNurtureItem.tsx` - Draggable nurture items
- `/components/today/types.ts` - Type definitions

### Active Content Components
- `/components/content/ContentPlanningWizard.tsx` - Content planning wizard
- `/components/content/JamiePanel.tsx` - Content Jamie panel
- `/components/content/blueprintStarters.ts` - Blueprint starters

### Active Tasks Components
- `/components/tasks/TaskCard.tsx` - Task card
- `/components/tasks/ContactBadge.tsx` - Contact badge
- `/components/tasks/StatusDropdown.tsx` - Status dropdown
- `/components/tasks/DueDatePicker.tsx` - Due date picker
- `/components/tasks/FlagToggle.tsx` - Flag toggle
- `/components/tasks/JamieButton.tsx` - Jamie button

### Active Forms/Documents System
- `/components/forms/FormsApp.tsx` - Forms application
- `/components/forms/OriginalFormsApp.tsx` - Original forms app
- `/components/FormEditorPage.tsx` - Form editor
- Various form editors and PDF renderers in `/components/forms/`

### Active Shared/UI Components
- `/components/ContactMentionInput.tsx` - @mention input
- `/components/shared/MentionTextarea.tsx` - Mention textarea
- `/components/ui/` - All shadcn UI components

### Active Contexts
- `/contexts/InteractionsContext.tsx` - Meeting dossiers/interactions
- `/contexts/NotificationContext.tsx` - Notifications

### Active Hooks
- `/hooks/useGoogleCalendarMeetings.ts` - Google Calendar integration
- `/hooks/useDictation.ts` - Voice dictation

### Active Utils
- `/utils/jamieAI.ts` - Jamie AI logic
- `/utils/jamieMemory.ts` - Jamie memory system
- `/utils/dateUtils.ts` - Date utilities
- `/utils/googleCalendarAutoSync.ts` - Google Calendar sync
- `/utils/actionRequiredHelpers.ts` - Action required calculations
- `/utils/contactDataExtraction.ts` - Contact data extraction
- `/utils/contactCalendarSync.ts` - Contact calendar sync
- `/utils/dateIndex.ts` - Date indexing
- `/utils/scheduleBlockProposer.ts` - Schedule block proposals
- `/utils/taskTypes.ts` - Task type definitions
- `/utils/playlistAdapter.ts` - Playlist adapter (used by wizards)
- `/utils/supabase/info.tsx` - Supabase configuration

### Active OAuth Components
- `/components/GmailOAuthLauncher.tsx`
- `/components/GmailOAuthCallback.tsx`
- `/components/CalendarOAuthLauncher.tsx`
- `/components/CalendarOAuthCallback.tsx`
- `/components/LinkedInOAuthLauncher.tsx`
- `/components/LinkedInOAuthCallback.tsx`

### Active Data Files
- `/data/contacts.ts` - Example contacts
- `/data/blueprints.ts` - Content blueprints

### Active Types
- `/types/task.ts`
- `/types/content.ts`
- `/types/interactions.ts`
- `/types/notification.ts`
- `/types/blueprints.ts`

### Active Server Files
- `/supabase/functions/server/index.tsx` - Main server
- `/supabase/functions/server/kv_store.tsx` - KV store utilities
- `/supabase/functions/server/fathomClient.ts` - Fathom client
- `/supabase/functions/server/rss_feeds.tsx` - RSS feed handling

---

## ⚠️ UNUSED/OLD FILES TO REMOVE

### Root-Level Demo/Test Files (NOT USED)
❌ `/ContentEditor.tsx` - Old content editor
❌ `/ContentFilteredView.tsx` - Duplicate of component version
❌ `/ContentPage_SimpleTable.tsx` - OLD - replaced by integrated version
❌ `/HelpMeGetStartedDemo.tsx` - Demo file
❌ `/LinkedInOptionsMockup.tsx` - Mockup/demo
❌ `/PDFComparisonTest.tsx` - Test file

### Unused Component Files
❌ `/components/ActivityCard.tsx` - Old activity card
❌ `/components/ActivityTabDesigns.tsx` - Old design mockup
❌ `/components/BackendStatus.tsx` - Debugging component
❌ `/components/CleanSidebar.tsx` - Old sidebar
❌ `/components/CompactWidgets.tsx` - Old widgets
❌ `/components/ContactProfilePiP.tsx` - Unused PiP variant
❌ `/components/ContactsTableView.tsx` - Unused table view
❌ `/components/ContentFilteredView.tsx` - Unused filtered view
❌ `/components/DashboardStats.tsx` - Old dashboard stats
❌ `/components/DataBackupSection.tsx` - Unused backup section
❌ `/components/DaySummaryBar.tsx` - Old summary bar
❌ `/components/DeferDateMenu.tsx` - Unused defer menu
❌ `/components/DocumentsPage.tsx` - Replaced by muted version
❌ `/components/DroppableTimeline.tsx` - Old timeline implementation
❌ `/components/EventDetailModal.tsx` - Unused event modal
❌ `/components/FullSchedule.tsx` - Old schedule view
❌ `/components/GlobalJamiePanel.tsx` - Replaced by chat panel
❌ `/components/GoalModal.tsx` - Goals feature removed
❌ `/components/GoalsPage.tsx` - Goals feature removed
❌ `/components/JamieCalendarChangeDialog.tsx` - Duplicate (exists in today/)
❌ `/components/JamieDropdown.tsx` - Old dropdown
❌ `/components/JamieIntegratedPanel.tsx` - Old panel
❌ `/components/JamiePlannerLayout.tsx` - Old planner layout
❌ `/components/JamiePlannerSidebar.tsx` - Old planner sidebar
❌ `/components/JamiePostMeetingNotification.tsx` - Old notification
❌ `/components/JamiesKnowledgeSettings.tsx` - Old settings
❌ `/components/KanbanView.tsx` - Unused kanban view
❌ `/components/MeetingDossierDemo.tsx` - Demo file
❌ `/components/MeetingPrepPage.tsx` - Old meeting prep page
❌ `/components/MeetingPrepPiPDemo.tsx` - Demo file
❌ `/components/MeetingPrepPreview.tsx` - Unused preview
❌ `/components/MiniTaskCard.tsx` - Unused mini card
❌ `/components/NotificationTestPanel.tsx` - Test panel
❌ `/components/OriginalFormsDashboard.tsx` - Old forms dashboard
❌ `/components/PlaylistDemo.tsx` - Demo file (playlists removed)
❌ `/components/PostMeetingNotesDemo.tsx` - Demo file
❌ `/components/PostMeetingNotesFlow.tsx` - Old flow
❌ `/components/QuickAddDropdown.tsx` - Old quick add
❌ `/components/QuickAddMenu.tsx` - Old quick add
❌ `/components/QuickAddModal.tsx` - Old quick add
❌ `/components/RedesignedDashboard.tsx` - Old redesign
❌ `/components/ResizableLayout.tsx` - Unused layout
❌ `/components/RoutinePriorityCanvases.tsx` - Routines removed
❌ `/components/RoutinesSettings.tsx` - Routines removed
❌ `/components/RssFeedSettings.tsx` - Unused RSS settings
❌ `/components/ScheduleSettings.tsx` - Old schedule settings
❌ `/components/SchedulingAssistant.tsx` - Old scheduling assistant
❌ `/components/SettingsPage.tsx` - Replaced by muted version
❌ `/components/Sidebar.tsx` - Old sidebar
❌ `/components/SpoonIcon.tsx` - Unused icon
❌ `/components/StatWidget.tsx` - Old stat widget
❌ `/components/TableView.tsx` - Generic table view
❌ `/components/TaskCreateModal.tsx` - Old task modal
❌ `/components/TaskStatusDropdown.tsx` - Duplicate of tasks/
❌ `/components/TaskTypeView.tsx` - Old task type view
❌ `/components/TasksPageMultiView.tsx` - Old multi-view
❌ `/components/TimeBlockCard.tsx` - Old time block card
❌ `/components/TimeEstimateEditor.tsx` - Unused editor
❌ `/components/TimeValidationModal.tsx` - Unused modal
❌ `/components/TimeframeSelector.tsx` - Unused selector
❌ `/components/TodayDashboard.tsx` - Old dashboard
❌ `/components/TodayDashboardExpandedView.tsx` - Old dashboard
❌ `/components/TodayPageFilledExample_Muted.tsx` - Example/demo
❌ `/components/TodoCard_Muted.tsx` - Unused card
❌ `/components/TopNavBar.tsx` - Old nav bar
❌ `/components/UnifiedTimeline.tsx` - Old timeline
❌ `/components/VoiceQuickAdd.tsx` - Old voice add
❌ `/components/WeeklyContentDigestModal.tsx` - Unused digest

### Unused Content Components
❌ `/components/content/AudienceHelper.tsx` - Unused helper
❌ `/components/content/BrainDumpModal.tsx` - Duplicate (muted version used)
❌ `/components/content/CTASuggester.tsx` - Unused suggester
❌ `/components/content/ContentDetailModal.tsx` - Unused modal
❌ `/components/content/ContentGoalReminder.tsx` - Goals removed
❌ `/components/content/FirstDraftPopup.tsx` - Unused popup
❌ `/components/content/HelpMeGetStartedModal.tsx` - Duplicate/unused
❌ `/components/content/JamieIdeaCard.tsx` - Unused card
❌ `/components/content/PlatformPlaybook.tsx` - Unused playbook
❌ `/components/content/PublishedContentViewer.tsx` - Unused viewer
❌ `/components/content/RemixTool.tsx` - Unused tool
❌ `/components/content/RepurposingModal.tsx` - Unused modal
❌ `/components/content/ResumeWritingDialog.tsx` - Unused dialog

### Unused Muted Content Components
❌ `/components/muted/content/ContentKanbanView.tsx` - Unused kanban
❌ `/components/muted/content/QuickPreviewModal.tsx` - Unused preview

### Unused Today Components
❌ `/components/today/AddBlockModal.tsx` - Not used (manual timeline now)
❌ `/components/today/CalendarSyncSettings.tsx` - Not used
❌ `/components/today/DashboardOverview.tsx` - Not used
❌ `/components/today/EnergySelector.tsx` - Not used (routine removal)
❌ `/components/today/FloatingMeetingCard.tsx` - Not used
❌ `/components/today/JamieCalendarChangeDialog.tsx` - Duplicate
❌ `/components/today/MITStep.tsx` - Not used
❌ `/components/today/MeetingCardPiP.tsx` - Not used
❌ `/components/today/MeetingPrepCard.tsx` - Not used
❌ `/components/today/NotificationPermissionPrompt.tsx` - Not used
❌ `/components/today/PlaylistReview.tsx` - Playlists removed
❌ `/components/today/PrepNotesEditor.tsx` - Not used
❌ `/components/today/RichTextEditor.tsx` - Not used
❌ `/components/today/RoutineSelector.tsx` - Routines removed
❌ `/components/today/RoutineTimeline.tsx` - Routines removed
❌ `/components/today/TimelineCalendarGridView.tsx` - Not used
❌ `/components/today/TimelineCalendarView.tsx` - Not used
❌ `/components/today/TimelineChronologicalView.tsx` - Not used

### Unused Timeline Components
❌ `/components/timeline/TimelineDesign_Custom.tsx` - Old design
❌ `/components/timeline/TimelineDesign_Option1.tsx` - Old design
❌ `/components/timeline/TimelineDesign_Option2.tsx` - Old design
❌ `/components/timeline/TimelineDesign_Option3.tsx` - Old design

### Unused Tasks Components
❌ `/components/tasks/ArchiveButton.tsx` - Not used
❌ `/components/tasks/DropdownPortal.tsx` - Not used
❌ `/components/tasks/SelectionCheckbox.tsx` - Not used
❌ `/components/tasks/TaskCardDateTop.tsx` - Old variant
❌ `/components/tasks/TaskCheckbox.tsx` - Duplicate functionality
❌ `/components/tasks/TaskTypeBadge.tsx` - Not used
❌ `/components/tasks/TimePicker.tsx` - Not used

### Unused Utils
❌ `/utils/availabilityHelper.ts` - Old availability logic
❌ `/utils/calendarInteractionSync.ts` - Old sync logic
❌ `/utils/contactFormMapper.ts` - Old mapper
❌ `/utils/contactSuggestionQueue.ts` - Handled by component
❌ `/utils/contentActions.ts` - Old content actions
❌ `/utils/draftsManager.ts` - Old drafts manager
❌ `/utils/exampleData.ts` - Example data
❌ `/utils/googleCalendarTimeBlockSync.ts` - Old time block sync
❌ `/utils/indexedDbStorage.ts` - Old storage method
❌ `/utils/jamiePlaylistGenerator.ts` - Playlists removed
❌ `/utils/jamieTaskIntelligence.ts` - Old task intelligence
❌ `/utils/jamieTimeEstimates.ts` - Old time estimates
❌ `/utils/meetingStyles.tsx` - Old meeting styles
❌ `/utils/notificationDelivery.ts` - Old notification delivery
❌ `/utils/notificationHelpers.ts` - Old notification helpers
❌ `/utils/notificationPolicy.ts` - Old notification policy
❌ `/utils/notificationScheduler.ts` - Replaced by bridge
❌ `/utils/notifications.ts` - Old notifications
❌ `/utils/outreachHelpers.ts` - Old outreach helpers
❌ `/utils/persistentStorage.ts` - Old storage
❌ `/utils/quietHours.ts` - Old quiet hours logic
❌ `/utils/routinesStorage.ts` - Routines removed
❌ `/utils/schedulerHelpers.ts` - Old scheduler helpers
❌ `/utils/schedulingHelpers.ts` - Old scheduling helpers
❌ `/utils/seedCompleteMeetingDemo.ts` - Demo seeder
❌ `/utils/seedDemoData.ts` - Demo seeder
❌ `/utils/seedFreshMeetingDemo.ts` - Demo seeder
❌ `/utils/serviceFormLinker.ts` - Old form linker
❌ `/utils/taskService.ts` - Old task service

### Unused Hooks
❌ `/hooks/useAutoWizard.ts` - Old auto wizard
❌ `/hooks/useMeetingTracker.tsx` - Old meeting tracker
❌ `/hooks/useTasks.ts` - Old tasks hook

### Unused Pages
❌ `/pages/ClientFlowPage.tsx` - Archived client flows

### Archived Directories (KEEP - already archived)
✅ `/archived-client-facing-ops/` - Keep as archive
✅ `/_archive_original_app/` - Keep as archive

### Unused Muted Components (Specific ones not in active list)
❌ `/components/muted_ActionRequiredInbox.tsx` - Old inbox
❌ `/components/muted_AssembleFlowPage.tsx` - Old flow page
❌ `/components/muted_BlockEndModal.tsx` - Old modal
❌ `/components/muted_BrainDumpModal.tsx` - Old brain dump
❌ `/components/muted_BrandSettingsModal.tsx` - Old brand settings
❌ `/components/muted_BusinessFiles_Editor.tsx` - Old business files
❌ `/components/muted_BusinessFiles_Page.tsx` - Old business files
❌ `/components/muted_BusinessFiles_Page_Enhanced.tsx` - Old business files
❌ `/components/muted_ClientDocumentsPage.tsx` - Old client docs
❌ `/components/muted_ContactEngagementsTab.tsx` - Old engagements
❌ `/components/muted_ContactFormsTab.tsx` - Old forms tab
❌ `/components/muted_ContentAnalytics.tsx` - Old analytics
❌ `/components/muted_CountdownTimer.tsx` - Old timer
❌ `/components/muted_DocumentEditorModal.tsx` - Old editor
❌ `/components/muted_DraftEngagementPage.tsx` - Old draft engagement
❌ `/components/muted_DraftingFocusMode.tsx` - Old drafting mode
❌ `/components/muted_EmailLogWizard.tsx` - Old email wizard
❌ `/components/muted_EngagementLogEntry.tsx` - Old engagement log
❌ `/components/muted_EngagementLogPage.tsx` - Old engagement page
❌ `/components/muted_FormattingToolbar.tsx` - Old toolbar
❌ `/components/muted_FormsLibraryPage.tsx` - Old forms library
❌ `/components/muted_GeneratePaymentLinkButton.tsx` - Old payment link
❌ `/components/muted_GetMeStartedModal.tsx` - Old get started
❌ `/components/muted_HelpMeGetStartedModal.tsx` - Old help modal
❌ `/components/muted_ImageLibrary.tsx` - Old image library
❌ `/components/muted_InlineBlueprintTemplate.tsx` - Old blueprint
❌ `/components/muted_IntegrationsSettings.tsx` - Old integrations (replaced)
❌ `/components/muted_JamieImageAccessibilityModal.tsx` - Old accessibility
❌ `/components/muted_MeetingDossier.tsx` - Old meeting dossier
❌ `/components/muted_NotificationBell.tsx` - Old notification bell
❌ `/components/muted_NotificationPanel.tsx` - Old notification panel
❌ `/components/muted_NotificationSettings.tsx` - Old notification settings
❌ `/components/muted_NurtureCard.tsx` - Old nurture card
❌ `/components/muted_NurtureEmailModal.tsx` - Old nurture email
❌ `/components/muted_NurtureLogWizard.tsx` - Old nurture wizard
❌ `/components/muted_NurturesTableView.tsx` - Old nurtures table
❌ `/components/muted_OnboardingFlowBuilder.tsx` - Old onboarding builder
❌ `/components/muted_OnboardingTemplatesManager.tsx` - Old onboarding templates
❌ `/components/muted_PDFDocumentEditor.tsx` - Old PDF editor
❌ `/components/muted_PDFTemplateBuilder.tsx` - Old PDF template
❌ `/components/muted_PMWindDownWizard.tsx` - Old PM wizard
❌ `/components/muted_PaymentsPage.tsx` - Old payments page
❌ `/components/muted_PostMeetingNotesWizard.tsx` - Old post-meeting notes
❌ `/components/muted_PreviewEngagementFlow.tsx` - Old preview
❌ `/components/muted_SendEngagementFlow.tsx` - Old send flow
❌ `/components/muted_SendOnboardingPacketModal.tsx` - Old onboarding packet
❌ `/components/muted_TemplateBuilder.tsx` - Old template builder
❌ `/components/muted_WeekView.tsx` - Old week view

### Unused Client/Flow Components
❌ `/components/muted_ClientHubPage.tsx` - File reference (not active)
❌ `/services/flowInstanceService.ts` - Old flow service

### Temp/Update Files
❌ `/tmp/tomorrow_section_replacement.txt` - Temp file
❌ `/update_amwizard.txt` - Temp file
❌ `/temp-logo-holder.txt` - Temp file

---

## 📚 DOCUMENTATION FILES TO KEEP (Reference/Knowledge)

All `.md` files in root should be kept as they document features, decisions, and provide context for future development. These are helpful for AI assistants like Jamie.

**Key Documentation:**
- `/README_START_HERE.md` - Main README
- `/COMPREHENSIVE_APP_DOCUMENTATION.md` - Full app documentation
- `/JAMIE_MANUAL.md` - Jamie AI manual
- `/CONTENT_SYSTEM_COMPLETE_GUIDE.md` - Content system guide
- Various feature-specific `.md` files

---

## 📊 SUMMARY

### Total Files to Remove: ~200+ files
### Categories:
- **Old/Demo Components**: ~80 files
- **Unused Utils**: ~25 files
- **Unused Hooks**: 3 files
- **Old Timeline Designs**: 4 files
- **Unused Today Components**: ~15 files
- **Unused Content Components**: ~10 files
- **Unused Muted Components**: ~50 files
- **Unused Form Components**: Varies (need detailed forms audit)
- **Temp Files**: 3 files

### Recommendation:
**Phase 1:** Remove obvious demo/test files and duplicates (low risk)
**Phase 2:** Remove unused muted_ components (medium risk)
**Phase 3:** Remove old utility files (test first)
**Phase 4:** Final audit of forms system

---

## 🔍 NOTES FOR JAMIE

1. **Playlists System Removed** - Any files with "playlist" in the name or logic are likely obsolete
2. **Routines System Removed** - Any files with "routine" logic are obsolete
3. **Goals Feature Removed** - Goal-related files are obsolete
4. **Old Timeline Designs** - Only SubwayTimeline is active
5. **Muted vs Non-Muted** - The "muted_" prefix generally indicates the active version we're using

**Before deleting**, verify the file isn't imported anywhere with a search:
```
import.*from.*filename
```
