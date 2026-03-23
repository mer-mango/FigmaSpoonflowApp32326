# Cleanup Plan: Remove Client-Facing Ops
**Date:** January 5, 2026  
**Goal:** Remove journey engine, payment tracking, form sending features

---

## Phase 1: Contact Profile Modal Cleanup

### ✅ Tabs to KEEP:
- **Information** - Contact details, relationship dropdown
- **Interactions** - Meeting dossiers, logged interactions  
- **Tasks** - Action items for this contact
- **Nurture** - Nurture cadence and next call scheduling

### ❌ Tabs to REMOVE:
1. **Forms** tab (line 570-580, 1635-1645)
   - Shows forms sent to client
   - Tracks form completion status
   - **File to remove:** `/components/muted_ContactFormsTab.tsx`

2. **Engagement** tab (line 583-594, 1056-1633)
   - Journey timeline visualization
   - Journey station tracking
   - Whose move indicators
   - **Remove:** All journey engine logic in this tab

3. **Payments** tab (line 596-607, 1647-1700+)
   - Payment history
   - Invoice tracking
   - Payment status
   - **Remove:** Entire payments tab section

### Code Changes for ContactProfileModal.tsx:

**Line 93 - Update activeTab type:**
```typescript
// BEFORE:
const [activeTab, setActiveTab] = useState<"info" | "activity" | "action-items" | "nurture" | "forms" | "engagement" | "payments">("info");

// AFTER:
const [activeTab, setActiveTab] = useState<"info" | "activity" | "action-items" | "nurture">("info");
```

**Lines 570-607 - Remove tab buttons:**
```typescript
// DELETE these three tab buttons:
// - Forms button (lines 569-581)
// - Engagement button (lines 582-594)  
// - Payments button (lines 595-607)
```

**Lines 1056-1633 - Remove Engagement tab content:**
```typescript
// DELETE entire {activeTab === "engagement" && (...)} block
```

**Lines 1635-1645 - Remove Forms tab content:**
```typescript
// DELETE entire {activeTab === "forms" && (...)} block
```

**Lines 1647+ - Remove Payments tab content:**
```typescript
// DELETE entire {activeTab === "payments" && (...)} block
```

---

## Phase 2: Delete Client-Facing Files

### Files to DELETE:
```
/pages/ClientFlowPage.tsx
/services/flowInstanceService.ts
/components/forms/FlowWizard.tsx
/components/forms/FlowInstanceGenerator.tsx
/components/muted_PaymentsPage.tsx
/components/muted_ContactFormsTab.tsx
/components/muted_ClientHubPage.tsx (if client-facing)
```

**Check before deleting:**
- Does ClientHubPage have any internal tools you want? (Check content first)

---

## Phase 3: Remove Journey Engine Logic

### Files with Journey References:
1. `/utils/journey_engine.ts` - Core journey logic ❌ DELETE
2. `/utils/journey_config.ts` - Journey type definitions ❌ DELETE  
3. `/components/ContactProfileModal.tsx` - Remove journey imports (line 17-18)

**ContactProfileModal.tsx imports to remove:**
```typescript
// DELETE these imports (lines 17-18):
import { deriveJourneyState, whoseMoveToDisplay, type ContactJourneyData } from "../utils/journey_engine";
import { JourneyType, JOURNEYS } from "../utils/journey_config";
```

### Contact Data Structure Cleanup

**In App.tsx or wherever Contact interface is defined:**

Remove these fields from Contact interface:
```typescript
// REMOVE:
journeyType?: JourneyType;
currentStation?: string;
journeyData?: ContactJourneyData;
whoseMove?: 'my_move' | 'their_move' | 'waiting';
```

**KEEP this field:**
```typescript
// KEEP (this is your simple dropdown):
relationship: 'Network' | 'Partner' | 'Prospect' | 'Client' | 'Other';
```

---

## Phase 4: Remove Payment Tracking

### Notification Settings
**File:** `/components/muted_NotificationSettings.tsx`

**Remove these notification types (lines 63, 141, 649-652):**
```typescript
// DELETE:
journeyPaymentReceived: NotificationDeliveryMethods;

// And the UI for it:
<NotificationItem
  label="Payment Received"
  description="Alert when a payment is received for a client journey"
  delivery={prefs.journeyPaymentReceived}
  onUpdate={(d) => updatePref('journeyPaymentReceived', d)}
/>
```

### BusinessFileItem Cleanup
**File:** `/App.tsx` (around lines 75-97)

**Remove these fields:**
```typescript
// DELETE payment fields (lines 75-91):
invoiceNumber?: string;
currency?: string;
lineItems?: Array<{
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}>;
subtotal?: number;
taxRate?: number;
taxAmount?: number;
total?: number;
paymentStatus?: 'unpaid' | 'paid' | 'partial' | 'cancelled';
paymentLinkUrl?: string;
paidAt?: string | null;
paymentMethod?: 'card' | 'bank_transfer' | 'other' | null;

// DELETE signing fields (lines 92-97):
signingProvider?: 'docusign' | 'hellosign' | 'dropbox_sign' | 'other';
signingStatus?: 'not_sent' | 'sent' | 'viewed' | 'signed' | 'void';
signingUrl?: string | null;
signedFileUrl?: string | null;
externalSigningId?: string | null;
```

---

## Phase 5: Remove Client Flow Routing

**File:** `/App.tsx`

**Line 42 - Remove import:**
```typescript
// DELETE:
import { ClientFlowPage } from './pages/ClientFlowPage';
```

**Lines 656, 660 - Remove flowInstanceId logic:**
```typescript
// DELETE:
const flowInstanceId = urlParams.get('flowInstance');
console.log('🔍 flowInstanceId:', flowInstanceId);
```

**Lines 668-682 - Remove flow routing:**
```typescript
// DELETE entire block:
// Handle flow instance view (client-facing flow page)
if (flowInstanceId) {
  console.log('🌊 Flow instance detected! Instance ID:', flowInstanceId);
  console.log('🌊 Rendering ClientFlowPage...');
  return <ClientFlowPage instanceId={flowInstanceId} />;
}

// Handle /flow/:instanceId route (fallback for path-based URLs)
const pathMatch = window.location.pathname.match(/^\/flow\/(.+)$/);
if (pathMatch) {
  const instanceId = pathMatch[1];
  console.log('🌊 Flow route matched! Instance ID:', instanceId);
  console.log('📍 Current pathname:', window.location.pathname);
  return <ClientFlowPage instanceId={instanceId} />;
}
```

**Lines 741-743 - Check invoice demo:**
```typescript
// KEEP if you want invoice templates, otherwise DELETE:
if (showInvoicePDF) {
  return <InvoicePDFDemo />;
}
```

---

## Phase 6: Clean Up Navigation

**Check for nav items to remove:**
- "Payments" page link
- "Client Hub" page link (if client-facing)
- Any "Journey" related nav items

**Keep these nav items:**
- Forms (internal builder)
- Documents (internal templates)
- Contacts
- Today
- Content
- Calendar

---

## Phase 7: Integration Settings Cleanup

**File:** `/components/muted_IntegrationsSettings.tsx`

**Keep:**
- Google Calendar integration ✅
- Gmail integration ✅ (for content inbox)
- LinkedIn integration ✅

**Remove/Hide:**
- Fathom integration (not built - just placeholder)
- Any payment gateway integrations
- E-signature integrations (DocuSign, etc.)

---

## Summary Checklist

- [ ] Remove 3 tabs from ContactProfileModal (Forms, Engagement, Payments)
- [ ] Delete ContactFormsTab component
- [ ] Delete journey engine files (journey_engine.ts, journey_config.ts)
- [ ] Delete ClientFlowPage and related files
- [ ] Delete PaymentsPage
- [ ] Remove payment fields from BusinessFileItem
- [ ] Remove journey fields from Contact interface
- [ ] Remove payment notifications
- [ ] Remove client flow routing from App.tsx
- [ ] Clean up navigation (remove Payments/ClientHub links)
- [ ] Hide/remove Fathom integration placeholder
- [ ] Update NotificationContext to remove payment notification helpers

---

## What Stays

### ✅ Features You Keep:
1. **Contacts with simple relationship dropdown** (Network, Partner, Prospect, Client, Other)
2. **Content management** (Ideas inbox, content creation, Jamie assistant)
3. **Today page** (Time blocking, task management)
4. **Calendar** (Google Calendar sync, meeting tracking)
5. **Interactions tracking** (Meeting dossiers, notes, post-meeting wizard)
6. **Tasks** (To-do management, contact-linked tasks)
7. **Nurture tracking** (Next call scheduling, cadence tracking)
8. **Form builder** (Design forms/templates internally)
9. **Document templates** (Proposals, SOWs, contracts - for internal use)
10. **Invoice PDF renderer** (Create invoice templates)
11. **Email template editor** (Draft emails manually)
12. **Settings** (Profile, services, integrations, notifications)

### ❌ Features You Remove:
1. Journey engine (stations, automation, tracking)
2. Client flow system (unique URLs, form submissions)
3. Payment tracking/processing
4. E-signature tracking
5. Form sending wizard
6. Client-facing pages
7. Payment notifications
8. Journey notifications

---

**Ready to execute?** Let me know and I'll start with Phase 1 (Contact Profile Modal cleanup).
