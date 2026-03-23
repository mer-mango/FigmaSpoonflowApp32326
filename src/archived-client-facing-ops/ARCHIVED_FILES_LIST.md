# Archived Files - Quick Reference

## Files Successfully Archived ✅

1. **ClientFlowPage.tsx** - Client-facing form fill-out page
   - Original location: `/pages/ClientFlowPage.tsx`
   - Purpose: Public page where clients complete forms via unique URL
   
2. **flowInstanceService.ts** - Flow instance tracking service
   - Original location: `/services/flowInstanceService.ts`
   - Purpose: Creates unique URLs, tracks form submissions, manages flow state

3. **muted_PaymentsPage.tsx** - Payment tracking dashboard
   - Original location: `/components/muted_PaymentsPage.tsx`
   - Purpose: Display invoices, track payments, revenue stats

4. **muted_ContactFormsTab.tsx** - Forms tab in contact profile
   - Original location: `/components/muted_ContactFormsTab.tsx`
   - Purpose: Show sent forms, track completion, activity timeline

## Files Still Referenced (Need Manual Cleanup)

These files are archived but may still be imported/referenced in active code:

### In App.tsx:
- Line 42: `import { ClientFlowPage } from './pages/ClientFlowPage';`
- Lines 668-682: Flow routing logic

### In ContactProfileModal.tsx:
- Line 20: `import { ContactFormsTab } from "./muted_ContactFormsTab";`
- Line 93: activeTab type includes "forms", "engagement", "payments"
- Lines 570-607: Tab buttons for Forms, Engagement, Payments
- Lines 1056-1633: Engagement tab content
- Lines 1635-1645: Forms tab content  
- Lines 1647+: Payments tab content

### In components/forms/FlowWizard.tsx:
- Line 3: `import { FlowInstanceService } from '../../services/flowInstanceService';`
- Lines 517+: Uses FlowInstanceService.createInstance()

## Journey Engine Files (Still Need to Archive)

These contain journey automation logic and should be added to archive:

- `/utils/journey_engine.ts` - Core journey state derivation
- `/utils/journey_config.ts` - Journey type definitions
- `/utils/journey_engine.test.ts` - Test suite

## Client Hub Page (May Need to Archive)

- `/components/muted_ClientHubPage.tsx` - Check if this is client-facing ops or something else

## Cleanup Actions Needed

### 1. Remove imports from App.tsx
```typescript
// DELETE:
import { ClientFlowPage } from './pages/ClientFlowPage';

// DELETE flow routing (lines 668-682)
```

### 2. Update ContactProfileModal.tsx
- Remove imports for ContactFormsTab, journey engine
- Update activeTab type to only include: "info" | "activity" | "action-items" | "nurture"
- Remove 3 tab buttons (Forms, Engagement, Payments)
- Remove 3 tab content blocks

### 3. Clean up journey references
- Remove journey fields from Contact interface
- Remove payment fields from BusinessFileItem interface
- Update NotificationSettings to remove payment notifications

### 4. Update FlowWizard.tsx (if keeping form builder)
- Either remove FlowWizard entirely OR
- Update to not use FlowInstanceService (forms builder only, no client sending)

---

**Next Steps:** See `/CLEANUP_PLAN_CLIENT_OPS.md` for full removal plan
