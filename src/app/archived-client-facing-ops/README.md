# Archived: Client-Facing Operations Features

**Archived on:** January 5, 2026  
**Reason:** Separating internal content management tools from client-facing operational features

---

## What's Archived Here

This folder contains all the **client-facing operational features** that were part of the original design but are no longer needed for the content management app. These features were designed for:

- Sending forms to clients via unique URLs
- Tracking form completion and client signatures  
- Managing payment workflows and invoicing
- Journey automation with "ops" stations (Payment Pending, Form Pending, etc.)

---

## Archived Files

### 1. **Client Flow System** (Form sending to clients)
- `ClientFlowPage.tsx` - Client-facing page where clients fill out forms via unique URL
- `flowInstanceService.ts` - Service that creates unique URLs and tracks form submissions
- `FlowWizard.tsx` - Wizard for assembling and sending form flows to clients

### 2. **Form Submission Tracking**
- `muted_ContactFormsTab.tsx` - Tab in contact profile that shows sent forms and their status
- Shows: sent flows, completion status, activity timeline, resend links

### 3. **Payment Tracking**
- `muted_PaymentsPage.tsx` - Dashboard for tracking invoices and payments
- Would integrate with Stripe for payment links
- Revenue tracking, outstanding balances

### 4. **Journey Engine** (Ops automation)
- `journey_engine.ts` - Core logic for journey state derivation
- `journey_config.ts` - Journey definitions with ops stations
- `journey_engine.test.ts` - Test suite for journey logic

### 5. **Related Components**
- `muted_ClientHubPage.tsx` - Client-facing hub page (if used for ops)
- Journey timeline components (if they show ops stations)

---

## What's KEPT in Main App

Even though these client ops features are archived, you still have these **internal tools**:

✅ **Form Builder** - Design forms/templates for internal use  
✅ **Template Designer** - Create proposals, SOWs, contracts  
✅ **PDF Preview & Export** - Generate PDFs from templates  
✅ **Invoice Template Renderer** - Create invoice templates  
✅ **Email Template Editor** - Draft emails manually  
✅ **Service Definitions** - For SOW generation  
✅ **Document Library** - Store and manage your templates

**The difference:** These are internal design tools for YOUR use, not for sending to clients with tracking.

---

## Contact Profile Simplification

The Contact Profile Modal was simplified by removing these tabs:
- ❌ **Forms tab** (tracked sent forms)
- ❌ **Engagement tab** (journey timeline)  
- ❌ **Payments tab** (payment tracking)

**What remains:**
- ✅ **Information** - Contact details, simple relationship dropdown
- ✅ **Interactions** - Meeting dossiers, logged interactions
- ✅ **Tasks** - Action items for this contact
- ✅ **Nurture** - Nurture cadence and next call scheduling

The **relationship dropdown** (Network, Partner, Prospect, Client, Other) is all you need instead of complex journey tracking.

---

## Why These Were Archived

**Original vision:** Full client relationship management with:
- Automated form sending via email
- E-signature integrations (DocuSign, HelloSign)
- Payment processing with Stripe
- Journey automation based on client actions
- "Whose move" tracking (admin vs. client)

**Current focus:** Content management app with:
- Content Ideas Inbox (Gmail newsletter extraction)
- AI-powered content creation (Jamie assistant)
- Editorial workflow (Idea → Drafting → Review → Scheduled → Published)
- Publishing to LinkedIn and Substack
- Internal productivity tools (time blocking, task management)

**Decision:** The client ops features are sophisticated but not needed for content creation. You'll handle forms/payments/client tracking separately outside this app.

---

## If You Want to Restore These Features

All the code is intact here. To restore:

1. Move files back to their original locations
2. Re-add imports in `App.tsx`:
   - `ClientFlowPage` 
   - Journey engine utilities
3. Restore tabs in `ContactProfileModal.tsx`
4. Add back journey fields to Contact interface
5. Restore payment fields to BusinessFileItem interface
6. Re-enable flow routing logic in App.tsx

Refer to `/CLEANUP_PLAN_CLIENT_OPS.md` for the full removal plan (reverse it to restore).

---

## Architecture Notes

### Flow Instance Service
- Stores flow instances in localStorage
- Generates unique URLs like `?flowInstance=flow-instance-abc123`
- Tracks actions: created, sent, opened, started, completed
- Updates form status: pending → in_progress → completed

### Journey Engine
- Derives current station from status events (timestamps)
- Calculates "whose move" (admin vs. client)
- Phase progression: Discovery → Active Work → Delivery → Complete
- Station rules defined in journey_config.ts

### Client Flow Page
- Public-facing form renderer
- Progress stepper for multi-form flows
- Auto-saves form data to localStorage
- Sends completion notifications

---

**Questions?** See `/CLEANUP_PLAN_CLIENT_OPS.md` for full context or `/SCOPE_CLARIFICATION_FORMS.md` for the original decision-making process.
