# Scope Clarification: Forms & Payments
**Date:** January 5, 2026  
**Decision:** Remove client-facing ops; keep internal builder tools

---

## ✅ What You're KEEPING (Internal Tools)

### Form/Template Creation Tools
- **FormEditorPage** (`/components/FormEditorPage.tsx`) - Visual form builder
- **FormsApp** (`/components/forms/FormsApp.tsx`) - Main forms management interface
- **Template System** - Create reusable document templates
- **PDF Preview** - See how documents will look
- **Email Template Editor** - Design email templates (for manual sending elsewhere)

**Use Case:** Design forms, contracts, proposals internally. Then manually send/manage them outside this app.

---

## ❌ What You Can REMOVE (Client-Facing Ops)

### 1. Client Flow System
**Files to Remove/Ignore:**
- `/pages/ClientFlowPage.tsx` - Client-facing flow viewer
- `/services/flowInstanceService.ts` - Flow instance management
- `/components/forms/FlowWizard.tsx` - Wizard for sending flows to clients
- `/components/forms/FlowInstanceGenerator.tsx` - Generates unique client URLs

**What It Does:** Creates unique URLs like `?flowInstance=abc123` that clients use to fill out forms online. Tracks completion, sends reminders, etc.

**App.tsx Routes to Remove (lines 668-682):**
```typescript
// Handle flow instance view (client-facing flow page)
if (flowInstanceId) {
  return <ClientFlowPage instanceId={flowInstanceId} />;
}

// Handle /flow/:instanceId route
const pathMatch = window.location.pathname.match(/^\/flow\/(.+)$/);
if (pathMatch) {
  return <ClientFlowPage instanceId={instanceId} />;
}
```

---

### 2. Payment Processing
**Files to Remove/Ignore:**
- `/components/muted_PaymentsPage.tsx` - Payments dashboard
- `/components/forms/pdf-renderers/InvoicePDFDemo.tsx` - Invoice generation (if not needed)
- Payment-related notification settings

**Data Fields to Remove from `BusinessFileItem` (App.tsx lines 75-91):**
```typescript
// Remove these fields:
invoiceNumber?: string;
currency?: string;
lineItems?: Array<{...}>;
subtotal?: number;
taxRate?: number;
taxAmount?: number;
total?: number;
paymentStatus?: 'unpaid' | 'paid' | 'partial' | 'cancelled';
paymentLinkUrl?: string;
paidAt?: string | null;
paymentMethod?: 'card' | 'bank_transfer' | 'other' | null;
```

**Notification Types to Remove (from NotificationSettings):**
```typescript
// Remove:
journeyPaymentReceived: NotificationDeliveryMethods;
```

---

### 3. Form Submission Tracking
**What to Remove:**
- Form submission status tracking
- Client form completion notifications
- "Action Required" notifications for form follow-ups
- Automatic task creation from form submissions

**Note:** You can keep the form *builder*, just remove the submission tracking/ops layer.

---

### 4. Electronic Signatures
**Fields to Remove from `BusinessFileItem` (App.tsx lines 92-97):**
```typescript
// Remove these fields:
signingProvider?: 'docusign' | 'hellosign' | 'dropbox_sign' | 'other';
signingStatus?: 'not_sent' | 'sent' | 'viewed' | 'signed' | 'void';
signingUrl?: string | null;
signedFileUrl?: string | null;
externalSigningId?: string | null;
```

**What It Does:** Integrates with DocuSign/HelloSign to send documents for signature and track status. You'll do this manually outside the app instead.

---

### 5. Client Journey "Ops" Stations
**Journey Engine Stations to Simplify:**
Remove or ignore these station types:
- `payment-pending` - Waiting for payment
- `form-pending` - Waiting for form completion
- `signing-pending` - Waiting for signature
- `onboarding-in-progress` - Client filling out onboarding forms

**Keep these (internal tracking):**
- `discovery` - You're in discovery
- `proposal-sent` - You sent proposal (manually)
- `active-project` - Working together
- `completed` - Project done

---

## 🔧 Simplified Data Structure

### BusinessFileItem (After Cleanup)
```typescript
export interface BusinessFileItem {
  id: string;
  title: string;
  fileType: 'Proposal' | 'Contract' | 'SOW' | 'Case Study' | 'Report';
  templateFamily: 'Sales' | 'Project Management' | 'Marketing';
  templateSubtype: string;
  status: 'draft' | 'in_review' | 'approved' | 'final';
  tags: string[];
  contact_ids?: string[];
  dueDate?: string;
  lastUpdated: string;
  createdOn: string;
  wordCount: number;
  content: string;
  outline?: string;
  notes?: string;
  folderId: string;
  pinned: boolean;
  primaryContactId?: string;
  
  // Removed: All payment fields, signing fields, invoice fields
}
```

---

## 🎯 Recommended Actions

### Immediate Cleanup:
1. **Delete these files:**
   ```
   /pages/ClientFlowPage.tsx
   /services/flowInstanceService.ts
   /components/forms/FlowWizard.tsx
   /components/forms/FlowInstanceGenerator.tsx
   /components/muted_PaymentsPage.tsx
   ```

2. **Remove from App.tsx:**
   - Lines 668-682: Client flow routing
   - Import for ClientFlowPage (line 42)
   - Import for InvoicePDFDemo (line 44) - unless you want invoice templates
   - Demo route for invoice PDF (lines 741-743)

3. **Simplify BusinessFileItem interface:**
   - Remove payment fields (lines 75-91)
   - Remove signing fields (lines 92-97)

4. **Clean up Navigation:**
   - Remove "Payments" page if it exists in nav
   - Keep "Forms" page (for builder access)

### What to Keep Using:
- ✅ Form builder for designing templates
- ✅ PDF preview to see documents
- ✅ Email template editor (design emails, send manually)
- ✅ Service definitions (for SOW generation)
- ✅ Business files storage (for your internal docs)

### Your Workflow Going Forward:
1. **Design forms/contracts** in the app's form builder
2. **Preview PDFs** to see how they look
3. **Export or copy content** to use elsewhere
4. **Send to clients manually** (via your external system)
5. **Track high-level status** in contact records ("Proposal sent", "Contract signed")
6. **Don't track granular ops** (no payment status, form completion tracking, etc.)

---

## 🤔 Questions to Clarify

1. **Invoice templates:** Do you want to keep the invoice PDF renderer for creating invoice templates? Or remove entirely?
   **✅ ANSWER: KEEP**

2. **Journey notifications:** Should we remove ALL form/payment related notifications, or keep simple ones like "Proposal sent" (manual log)?
   **✅ ANSWER: Remove journey automation. Just use simple relationship dropdown (Network, Partner, Prospect, Client, Other) that already exists in contact profile.**

3. **Contact journey stations:** Keep simplified journey tracking (Discovery → Proposal → Client) without the ops stations (Payment Pending, Form Pending)?
   **✅ ANSWER: No journey tracking at all. Just the relationship dropdown in the contact header.**

4. **Email templates:** Keep the email template editor since you might use it to draft emails manually?
   **✅ ANSWER: KEEP**

---

## ✅ CONFIRMED SCOPE

### Keep These Tools:
- ✅ Form builder/editor (FormEditorPage)
- ✅ Template designer  
- ✅ PDF preview
- ✅ **Invoice PDF renderer** (for creating invoice templates)
- ✅ **Email template editor** (draft emails manually)
- ✅ Service definitions (for SOW generation)
- ✅ **Relationship dropdown** in contact profile (Network/Partner/Prospect/Client/Other)

### Remove These Features:
- ❌ ClientFlowPage (client-facing form viewer)
- ❌ FlowInstanceService (unique URLs for clients)
- ❌ Payment tracking dashboard (PaymentsPage)
- ❌ Form submission tracking
- ❌ E-signature integrations
- ❌ **Journey Engine** (stations, automation, journey tracking UI)
- ❌ **Client Hub Page** (if it's client-facing ops)
- ❌ Journey-related notifications (form completed, payment received, etc.)
- ❌ "Payments" tab in contact profile
- ❌ "Forms" tab in contact profile (if it tracks sent forms)