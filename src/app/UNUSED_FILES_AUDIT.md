# Unused Files Audit - Batch Analysis
**Generated:** January 5, 2026

This document identifies files that are NOT currently used in either:
1. **Content App** (ContentPage_SimpleTable.tsx entry point)
2. **Original App** (Full app accessible via ?view=original)

---

## BATCH 1: Root-Level Design Exploration Files (UNUSED)

### Today Page Design Variations (NOT USED)
These were design explorations that are not part of the production app:
- ❌ `/AlternativeToday.tsx`
- ❌ `/CalendarStyleToday.tsx`
- ❌ `/CardStackToday.tsx`
- ❌ `/ColorfulToday.tsx`
- ❌ `/CompactModernToday.tsx`
- ❌ `/DarkModeToday.tsx`
- ❌ `/MinimalistToday.tsx`
- ❌ `/NatureModernToday.tsx`
- ❌ `/OceanBreezeToday.tsx`
- ❌ `/OrangeGradientToday.tsx`
- ❌ `/PurpleGradientToday.tsx`
- ❌ `/RoseGradientToday.tsx`
- ❌ `/SoftModernToday.tsx`
- ❌ `/SplitScreenToday.tsx`
- ❌ `/TealGradientToday.tsx`
- ❌ `/TwilightToday.tsx`
- ❌ `/TodayDesignExplorer.tsx`
- ❌ `/TodayPageWithJamie.tsx`

### Content Page Design Variations (NOT USED)
These were design explorations for the content page:
- ❌ `/ContentApp.tsx` (early prototype)
- ❌ `/ContentDesignOptions.tsx`
- ❌ `/ContentPageOption3TwoColumn.tsx`
- ❌ `/ContentPageOption3_Correct.tsx`
- ❌ `/ContentPage_CleanDesign.tsx`
- ❌ `/ContentPage_CompactStats.tsx`
- ❌ `/ContentPage_InboxWithStats.tsx`
✅ **KEEP:** `/ContentPage_SimpleTable.tsx` (THIS IS THE PRODUCTION VERSION)

### Navigation Design Variations (NOT USED)
- ❌ `/NavOption1.tsx`
- ❌ `/NavOption2.tsx`
- ❌ `/NavOption2Colored.tsx`
- ❌ `/NavOption3.tsx`
- ❌ `/NavOption4.tsx`
- ❌ `/NavOptionsComparison.tsx`

### Settings Page Variations (NOT USED - except SettingsPage.tsx in /components)
- ❌ `/SettingsPage.tsx` (root level - old version)
- ❌ `/SettingsPageLinkedIn.tsx`
- ❌ `/SettingsPageNotifications.tsx`
✅ **KEEP:** `/components/SettingsPage.tsx` (used by ContentPage_SimpleTable)

### Modal/UI Previews (NOT USED)
- ❌ `/ModalPreview.tsx`
- ❌ `/ModalPreviewNav.tsx`
- ❌ `/DesignComparison.tsx`
- ❌ `/TimelineViewComparison.tsx`
- ❌ `/ExpandedView.tsx`

### Demo/Test Components (NOT USED - but imported by App.tsx for demos)
- ⚠️ `/HelpMeGetStartedDemo.tsx` - Imported by App.tsx (line 47) but only for demo purposes
- ⚠️ `/JourneyTimelineDemo.tsx` - Imported by App.tsx (line 67) but only for ?journeytest
- ⚠️ `/JourneyEngineDemo.tsx` - Imported by App.tsx (line 68) but only for ?journeytest
- ⚠️ `/JourneyEngineTestRunner.tsx` - Imported by App.tsx (line 69) but only for ?journeytest
- ⚠️ `/JourneyEngineConnectedDemo.tsx` - Imported by App.tsx (line 70) but only for ?journeytest
- ⚠️ `/PDFComparisonTest.tsx` - Imported by App.tsx (line 60) but only for demo
- ⚠️ `/FormApp.tsx` - Old form demo
- ⚠️ `/FoundationDemo.tsx` - Design foundation demo
- ⚠️ `/JamieOptions.tsx` - Jamie design exploration
- ⚠️ `/TaskComponentsDemo.tsx` - Task design exploration
- ⚠️ `/LinkedInOptionsMockup.tsx` - Imported by App.tsx (line 3) but not used in routing

**DECISION NEEDED:** Are these demos still valuable for testing, or can they be archived?

---

## BATCH 2: Component-Level Unused Files

### Contact Components (UNUSED)
- ❌ `/components/ContactProfile.tsx` (NOT imported anywhere)
- ❌ `/components/ContactProfileModalUpdated.tsx` (NOT imported anywhere)
✅ **KEEP:** `/components/ContactProfileModal.tsx` (used by ContactsPage)

### Content Page Variations (UNUSED)
- ❌ `/components/ContentPageRedesign.tsx` (imported by App.tsx but not used in routing)
- ❌ `/components/muted_ContentPage_AllViews.tsx` (imported by App.tsx line 10 but not used)
- ❌ `/components/muted_ContentPage.tsx` (imported as `ContentPage` but never rendered)
- ❌ `/components/muted_ContentPage_Gallery.tsx` (imported but not used)
- ❌ `/components/ContentPageDesignSelector.tsx` (imported but not used)
- ❌ `/components/muted_ContentGallery_DesignOptions.tsx` (imported but not used)
- ❌ `/components/muted_ContentGallery_Hybrid.tsx` (imported but not used)
- ❌ `/components/ContentPageOptions.tsx` (imported but not used)
- ❌ `/components/muted_ContentPage_DesignA.tsx`
- ❌ `/components/muted_ContentPage_DesignB.tsx`
- ❌ `/components/muted_ContentPage_DesignC.tsx`
- ❌ `/components/muted_ContentPage_NewViews.tsx`
- ❌ `/components/muted_ContentPage_Original_Backup.tsx`
- ❌ `/components/muted_ContentPage_Simple.tsx`

### Task Components (UNUSED)
- ❌ `/components/TaskDetailModalOption1.tsx`
- ❌ `/components/TaskDetailModalOption2.tsx`
- ❌ `/components/TaskDetailModalOption3.tsx`
- ❌ `/components/TaskModalComparison.tsx`
- ❌ `/components/TaskModalComparisonPage.tsx`
- ❌ `/components/TaskModalDesignOptions.tsx`
- ❌ `/components/TaskModalDesignOptions2.tsx`
- ❌ `/components/TaskCardDesignOptions.tsx`
- ❌ `/components/TaskCardDesignPreview.tsx`

### Today Page Component Variations (UNUSED)
- ❌ `/components/today/TimelineViewOption1.tsx`
- ❌ `/components/today/TimelineViewOption2.tsx`
- ❌ `/components/today/TimelineViewOption4.tsx`

### Other Unused Components
- ❌ `/components/ContactModalDesignExplorer.tsx`
- ❌ `/components/BackgroundColorComparison.tsx` (imported by App.tsx but conditionally rendered)
- ❌ `/components/BackgroundColorComparison_Refined.tsx` (imported by App.tsx but conditionally rendered)
- ❌ `/components/MeetingDossierComparison.tsx` (imported but unused)
- ❌ `/components/LayoutComparison.tsx`
- ❌ `/components/LayoutOption1.tsx`
- ❌ `/components/LayoutOption2.tsx`
- ❌ `/components/LayoutOption3.tsx`
- ❌ `/components/JamiePanelDesignOptions.tsx`
- ❌ `/components/ActivityTabDesigns.tsx`

---

## BATCH 3: Files Currently Used (DO NOT DELETE)

### Content App Entry Points
✅ `/App.tsx` - Main router
✅ `/ContentPage_SimpleTable.tsx` - Content app entry point
✅ `/ContentEditor.tsx` - Content editor
✅ `/ContentFilteredView.tsx` - Filtered views
✅ `/components/SettingsPage.tsx` - Settings

### Content Components (USED)
✅ `/components/content/EnhancedContentWizard.tsx`
✅ `/components/content/RepurposingModal.tsx`
✅ `/components/content/RemixTool.tsx`
✅ `/components/content/CTASuggester.tsx`
✅ `/components/content/AudienceHelper.tsx`
✅ `/components/content/BlueprintExplorer.tsx`
✅ `/components/content/ContentDetailModal.tsx`
✅ `/components/content/ContentGoalReminder.tsx`
✅ `/components/content/JamieIdeaCard.tsx`
✅ `/components/content/PostMeetingContentWizard.tsx`
✅ `/components/content/ResumeWritingDialog.tsx`

### Core Components Used by Content Editor
✅ `/components/muted_InlineBlueprintTemplate.tsx`
✅ `/components/muted_BrainDumpModal.tsx`

### Notification System
✅ `/contexts/NotificationContext.tsx`
✅ `/utils/notificationHelpers.ts`
✅ `/utils/notifications.ts`

### Original App Components (Used when ?view=original)
✅ `/pages/TodayPage.tsx`
✅ `/components/TodayPageFilledExample_Muted.tsx`
✅ `/components/TasksPage.tsx`
✅ `/components/ContactsPage.tsx`
✅ `/components/ContactProfileModal.tsx`
✅ `/components/CalendarPage.tsx`
✅ `/components/SharedLayout_Muted.tsx`
✅ `/components/MutedTaskModal.tsx`
✅ `/components/MutedContactModal.tsx`
✅ `/components/muted_NewContentModal.tsx`
✅ `/components/muted_VoiceInputModal.tsx`
✅ `/components/muted_JamieChatPanel.tsx`
✅ `/components/muted_TimerPiPView.tsx`
✅ `/components/AMWizard.tsx`
✅ `/components/PMWizard.tsx`
✅ `/components/muted_PostMeetingWizard.tsx`
✅ `/components/MeetingDossierDemo.tsx`
✅ `/components/PostMeetingNotesDemo.tsx`
✅ `/components/PostMeetingNotesFlow.tsx`
✅ `/components/muted_DocumentsPage_Combined.tsx`
✅ `/components/muted_SettingsPage.tsx`
✅ `/components/muted_NurturesView.tsx`
✅ `/components/muted_ClientHubPage.tsx`

### Navigation Components (USED)
✅ `/components/navigation/NavOptions.tsx`
✅ `/components/navigation/NavRefinedOptions.tsx`
✅ `/components/navigation/NavColoredVersion.tsx`

### Today Page Components (USED)
✅ `/components/today/JamieAdjustmentDialog.tsx`
✅ `/components/today/JamieTransitionDialog.tsx`
✅ `/components/today/JamieScheduleAdjustments.tsx`
✅ `/components/today/JamieCalendarChangeDialog.tsx`
✅ `/components/today/JamieReclaimedTimeDialog.tsx`
✅ `/components/today/NotificationPermissionPrompt.tsx`
✅ `/components/today/AMWizard.tsx`
✅ `/components/today/PMWizard.tsx`
✅ `/components/today/types.ts`
✅ `/components/today/TimelineCalendarView.tsx`
✅ `/components/today/MeetingPrepCard.tsx`
✅ `/components/today/PrepNotesEditor.tsx`

### Forms System (USED in original app)
✅ `/components/FormEditorPage.tsx`
✅ `/components/forms/FormsApp.tsx`
✅ `/components/forms/OriginalFormsApp.tsx`
✅ All `/components/forms/*` subdirectories (documents, editors, pdf-renderers, shared, ui, utils)

### Utilities (USED)
✅ `/utils/jamieAI.ts`
✅ `/utils/googleCalendarAutoSync.ts`
✅ `/utils/actionRequiredHelpers.ts`
✅ `/utils/exampleData.ts`
✅ `/utils/seedDemoData.ts`
✅ `/utils/jamieMemory.ts`
✅ `/utils/dateUtils.ts`

### Data & Contexts
✅ `/data/contacts.ts`
✅ `/data/blueprints.ts`
✅ `/contexts/InteractionsContext.tsx`

### Client Flow System
✅ `/pages/ClientFlowPage.tsx`

---

## BATCH 4: Documentation Files

### Keep (Reference Documentation)
✅ `/COMPREHENSIVE_APP_DOCUMENTATION.md` - NEW master doc
✅ `/README_START_HERE.md`
✅ `/CONTENT_SYSTEM_COMPLETE_GUIDE.md`
✅ `/CONTENT_APP_MANUAL.md`
✅ `/JAMIE_COMPLETE_SPECIFICATION.md`
✅ `/CANONICAL_NAMING_REFERENCE.md`
✅ `/CONTENT_BLUEPRINTS_REFERENCE.md`

### Archive or Delete (Old Implementation Notes)
- ⚠️ `/ACTIVITY_TAB_DESIGNS.md`
- ⚠️ `/AI_ASSISTANT_REMINDER.md`
- ⚠️ `/AI_LEARNING_APPROACHES.md`
- ⚠️ `/BACKEND_INTEGRATIONS_SETUP.md`
- ⚠️ `/BATCH_2_INTEGRATION_COMPLETE.md`
- ⚠️ `/BATCH_3_INTEGRATION_COMPLETE.md`
- ⚠️ `/BATCH_4_INTEGRATION_COMPLETE.md`
- ⚠️ `/BRAIN_DUMP_EDITOR_FEATURE.md`
- ⚠️ `/BUILDER_2_MASTER_HANDOFF_PACKAGE.md`
- ⚠️ `/BUILDER_2_STOP_AND_ASK_PROTOCOL.md`
- ⚠️ `/BUILDER_HANDOFF_SUMMARY.md`
- ⚠️ `/CLIENT_JOURNEY_STATUS_GUIDE.md`
- ⚠️ `/CONTENT_APP_CUSTOM_BUILD.md`
- ⚠️ `/CONTENT_APP_EXTRACTION_GUIDE.md`
- ⚠️ `/CONTENT_APP_SETUP.md`
- ⚠️ `/CONTENT_FILES_EXPLAINED.md`
- ⚠️ `/CONTENT_NOTIFICATIONS_COMPLETE.md`
- ⚠️ `/CONTENT_PAGE_FEATURES.md`
- ⚠️ `/CONTENT_PAGE_UPDATES.md`
- ⚠️ `/DEPENDENCY_AUDIT_CURRENT_APP.md`
- ⚠️ `/DICTATION_STANDARD.md`
- ⚠️ `/ENGAGEMENT_STATUS_LIFECYCLE.md`
- ⚠️ `/EXTRACTION_CHECKLIST.md`
- ⚠️ `/FIGMA_MAKE_PROMPTS.md`
- ⚠️ `/HANDOFF_COMPLETE_SUMMARY.md`
- ⚠️ `/INITIAL_INFO_FOR_BUILDER_2.md`
- ⚠️ `/INTEGRATION_COMPLETE.md`
- ⚠️ `/JAMIE_AI_ANALYSIS.md`
- ⚠️ `/JAMIE_ENHANCEMENTS_FLOW_DIAGRAM.md`
- ⚠️ `/JAMIE_ENHANCEMENTS_IMPLEMENTATION.md`
- ⚠️ `/JAMIE_ENHANCEMENTS_QUICK_START.md`
- ⚠️ `/JAMIE_INTEGRATION_ARCHITECTURE.md`
- ⚠️ `/JAMIE_MANUAL.md`
- ⚠️ `/JAMIE_PLAYLIST_LOGIC.md`
- ⚠️ `/LOGO_SETUP_GUIDE.md`
- ⚠️ `/MASTER_BUILDER_SPEC.md`
- ⚠️ `/MASTER_BUILDER_SPEC_PART2.md`
- ⚠️ `/MEETING_DOSSIER_LIFECYCLE_IMPLEMENTATION.md`
- ⚠️ `/NEWSLETTER_EXTRACTION_IMPLEMENTATION.md`
- ⚠️ `/NOTIFICATION_SYSTEM_INTEGRATION.md`
- ⚠️ `/NOTIFICATION_TRIGGERS_REFERENCE.md`
- ⚠️ `/PODCAST_BLUEPRINTS_AND_SEO.md`
- ⚠️ `/POST_MEETING_WIZARD_SPECS.md`
- ⚠️ `/PROSPECT_CONTINUITY_UPDATE_SUMMARY.md`
- ⚠️ `/SECTION_6_VERIFICATION.md`
- ⚠️ `/SECTION_7_COMPLETE.md`
- ⚠️ `/SECTION_7_FINAL_UPDATE.md`
- ⚠️ `/SECTION_7_INTERACTIONS_RESTORED.md`
- ⚠️ `/SECTION_7_PROSPECT_CLIENT_BADGES.md`
- ⚠️ `/SETTINGS_TAB_COMPLETE_DESIGN.md`
- ⚠️ `/SNIPPET_HOOK_STATUS_IMPLEMENTATION.md`
- ⚠️ `/STATUS_TRACKING_FEATURES.md`
- ⚠️ `/TASKS_PAGE_FIXES_TODO.md`
- ⚠️ `/TASK_ARCHITECTURE_CHANGES.md`
- ⚠️ `/TASK_TYPE_AUTO_GENERATION_TODO.md`
- ⚠️ `/TEMPLATE_BUILD_SUMMARY.md`
- ⚠️ `/THUMBS_FEEDBACK_SPEC.md`
- ⚠️ `/TODAY_PAGE_REDESIGN_SUMMARY.md`
- ⚠️ `/TOMORROW_ACTION_PLAN.md`
- ⚠️ `/VALIDATION_REPORT.md`

---

## Summary & Recommendations

### IMMEDIATE DELETE (Design Explorations - Not Used)
**Total: ~45 files**

1. All Today page design variations (16 files)
2. All Content page design variations (6 files)
3. All Navigation design variations (6 files)
4. Root-level Settings variations (3 files)
5. Modal/UI previews (5 files)
6. Content component variations in `/components/` (15 files)
7. Task component variations (9 files)
8. Contact profile unused variations (2 files)
9. Today timeline view options (3 files)
10. Layout/comparison components (7 files)

### CONSIDER ARCHIVING (Demo Files)
**Total: ~10 files**

These are imported by App.tsx but only for special demo modes:
- Demo components (HelpMeGetStartedDemo, Journey demos, PDF demos, etc.)
- Comparison/test components

**Recommendation:** Move to `/_demos/` folder if you want to keep them for future reference

### DOCUMENTATION CLEANUP
**Total: ~50 .md files**

Most of these are build notes/summaries that are now consolidated in `COMPREHENSIVE_APP_DOCUMENTATION.md`

**Recommendation:** 
- Keep: README_START_HERE.md, COMPREHENSIVE_APP_DOCUMENTATION.md, CANONICAL_NAMING_REFERENCE.md, CONTENT_BLUEPRINTS_REFERENCE.md
- Archive rest to `/_docs_archive/`

---

## Next Steps

Would you like me to:
1. **Delete BATCH 1** (design explorations) immediately?
2. **Move demos to /_demos/** folder?
3. **Archive old docs to /_docs_archive/** folder?
4. Create a script to do all of the above?
