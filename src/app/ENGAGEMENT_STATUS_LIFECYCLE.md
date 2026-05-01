# Engagement Status Lifecycle

## Status Format

All engagement statuses follow a **three-part structure** that makes it immediately clear:
1. **Who they are** (Prospect vs Client)
2. **What action was taken** (Sent SOW, Forms Completed, etc.)
3. **Whose move it is** (Awaiting Response, Action Required, Scheduled, etc.)

### Format: `[Prospect/Client] - [Action] - [Whose Move]`

---

## Status Color Coding (Ball in Court System)

Visual indicators show at a glance who needs to act next:

- 🔵 **Blue** = **Awaiting Response/Payment/Signature** ← Ball in their court (you can breathe)
- 🟢 **Green** = **Action Required** ← Ball in your court (needs your attention)
- 🟠 **Orange** = **Delivering/Scheduled** ← Active work happening
- ⚪ **Gray** = **Complete/Archived** ← Engagement closed

---

## Complete Journey Map

### PROSPECT PHASE (Before payment/commitment)

#### Universal Start (Everyone Goes Through This)

**1. Prospect - Sent Discovery - Awaiting Response** 🔵
- **What happened:** You sent the Discovery/Intake Flow
- **Whose move:** Prospect needs to complete forms
- **What's next:** Wait for them to submit, then review responses
- **Trigger:** Admin sends Discovery/Intake Flow via engagement system

**2. Prospect - Forms Completed - Action Required** 🟢
- **What happened:** Prospect completed Discovery/Intake forms
- **Whose move:** YOU need to review and decide next steps
- **What's next:** Review intake, schedule consultation if good fit
- **Trigger:** Prospect submits all required discovery forms

**3. Prospect - Sent Consultation Link - Awaiting Booking** 🔵
- **What happened:** You sent free consultation calendar link
- **Whose move:** Prospect needs to book a time
- **What's next:** Wait for booking confirmation
- **Trigger:** Admin sends consultation booking link

**4. Prospect - Consultation Booked - Scheduled** 🟠
- **What happened:** Prospect booked their free consultation
- **Whose move:** Both (meeting is scheduled, prep happening)
- **What's next:** Conduct consultation, determine if Audit or Workshop
- **Trigger:** Prospect books consultation in your calendar

---

#### Path Diverges After Consultation

Based on consultation outcome, prospect follows one of two paths:

##### PATH A: PX Audit Client

**5A. Prospect - Sent SOW - Awaiting Signature** 🔵
- **What happened:** You sent PX Audit Scope of Work
- **Whose move:** Prospect needs to review and sign
- **What's next:** Wait for signature, then send invoice
- **Trigger:** Admin sends Audit SOW for signature

**6A. Prospect - SOW Reviewed - Action Required** 🟢
- **What happened:** Prospect reviewed SOW (may have questions/changes)
- **Whose move:** YOU need to address questions or finalize
- **What's next:** Answer questions, revise if needed, get signature
- **Trigger:** Prospect views SOW or submits questions

##### PATH B: Workshop Client

**5B. Prospect - Sent SOW - Awaiting Signature** 🔵
- **What happened:** You sent Workshop Scope of Work
- **Whose move:** Prospect needs to review and sign
- **What's next:** Wait for signature, then send invoice
- **Trigger:** Admin sends Workshop SOW for signature

**6B. Prospect - SOW Reviewed - Action Required** 🟢
- **What happened:** Prospect reviewed SOW (may have questions/changes)
- **Whose move:** YOU need to address questions or finalize
- **What's next:** Answer questions, revise if needed, get signature
- **Trigger:** Prospect views SOW or submits questions

---

### CLIENT PHASE (After SOW signature - they're now a Client)

#### Payment & Setup

**7. Client - SOW Signed - Action Required** 🟢
- **What happened:** Client signed the SOW
- **Whose move:** YOU need to generate and send invoice
- **What's next:** Create invoice, send payment link
- **Trigger:** Client signs SOW

**8. Client - Sent Invoice - Awaiting Payment** 🔵
- **What happened:** You sent invoice with Stripe payment link
- **Whose move:** Client needs to submit payment
- **What's next:** Wait for payment confirmation
- **Trigger:** Admin sends invoice via engagement system

---

#### Delivery Phase

**9A. Client - Payment Received - Delivering Audit** 🟠
- **What happened:** Client paid, audit work is in progress
- **Whose move:** YOU are actively working
- **What's next:** Complete audit, prepare deliverables
- **Trigger:** Stripe payment confirmation received
- **Duration:** Typically 2-3 weeks

**9B. Client - Payment Received - Delivering Workshop** 🟠
- **What happened:** Client paid, workshop prep & delivery happening
- **Whose move:** YOU are actively working
- **What's next:** Conduct workshop, prepare follow-up materials
- **Trigger:** Stripe payment confirmation received
- **Duration:** Typically 1-2 weeks prep + workshop day

---

#### Feedback & Completion

**10A. Client - Audit Delivered - Awaiting Feedback** 🔵
- **What happened:** You delivered final audit report
- **Whose move:** Client needs to review and provide feedback
- **What's next:** Wait for feedback, address any questions
- **Trigger:** Admin marks audit as delivered in system

**10B. Client - Workshop Delivered - Awaiting Feedback** 🔵
- **What happened:** Workshop completed, materials sent
- **Whose move:** Client needs to review and provide feedback
- **What's next:** Wait for feedback, address any questions
- **Trigger:** Admin marks workshop as delivered in system

**11. Client - Feedback Received - Action Required** 🟢
- **What happened:** Client provided feedback or questions
- **Whose move:** YOU need to respond and finalize
- **What's next:** Address feedback, make final revisions if needed
- **Trigger:** Client submits feedback or questions

**12. Client - Engagement Complete - Archived** ⚪
- **What happened:** Engagement fully delivered and closed
- **Whose move:** No one (engagement archived)
- **What's next:** Historical record, track for future opportunities
- **Trigger:** Admin manually marks engagement as complete

---

## Status Transitions (State Machine)

### Valid Transitions

```
Prospect - Sent Discovery - Awaiting Response
  ↓
Prospect - Forms Completed - Action Required
  ↓
Prospect - Sent Consultation Link - Awaiting Booking
  ↓
Prospect - Consultation Booked - Scheduled
  ↓
  ├─→ [AUDIT PATH]
  │   Prospect - Sent SOW - Awaiting Signature (Audit)
  │     ↓
  │   Prospect - SOW Reviewed - Action Required
  │     ↓
  │   Client - SOW Signed - Action Required
  │     ↓
  │   Client - Sent Invoice - Awaiting Payment
  │     ↓
  │   Client - Payment Received - Delivering Audit
  │     ↓
  │   Client - Audit Delivered - Awaiting Feedback
  │     ↓
  │   [Optional] Client - Feedback Received - Action Required
  │     ↓
  │   Client - Engagement Complete - Archived
  │
  └─→ [WORKSHOP PATH]
      Prospect - Sent SOW - Awaiting Signature (Workshop)
        ↓
      Prospect - SOW Reviewed - Action Required
        ↓
      Client - SOW Signed - Action Required
        ↓
      Client - Sent Invoice - Awaiting Payment
        ↓
      Client - Payment Received - Delivering Workshop
        ↓
      Client - Workshop Delivered - Awaiting Feedback
        ↓
      [Optional] Client - Feedback Received - Action Required
        ↓
      Client - Engagement Complete - Archived
```

---

## Filterable Views

### "What Needs My Attention Right Now?"
Filter by:
- 🟢 All "Action Required" statuses (your court)
- Shows: Forms to review, questions to answer, invoices to generate, feedback to address

### "What Am I Waiting On?"
Filter by:
- 🔵 All "Awaiting Response/Payment/Signature" statuses (their court)
- Shows: Forms pending, SOWs awaiting signature, invoices awaiting payment, feedback pending

### "What Am I Actively Delivering?"
Filter by:
- 🟠 All "Delivering/Scheduled" statuses (active work)
- Shows: Audits in progress, workshops being prepped, consultations scheduled

### "What's Complete?"
Filter by:
- ⚪ "Complete - Archived" status
- Shows: Historical engagements for reference

---

## Energy Management Principles

### Design for Clarity, Control, and Trust

1. **Ball in Court = Energy Clarity**
   - Blue statuses = You can breathe (waiting on them)
   - Green statuses = Needs your attention (prioritize these)
   - Orange statuses = Active work happening (time block for delivery)

2. **Action-Based = Clear Next Steps**
   - Never wonder "what do I do next?"
   - Status tells you exactly what just happened and whose move it is

3. **Prospect vs Client = Relationship Clarity**
   - "Prospect" = Still qualifying, haven't committed
   - "Client" = Committed (signed SOW), now delivering value

---

## Implementation Notes

### Status Assignment Triggers

**Automated (System-Generated):**
- Payment confirmation → "Client - Payment Received - Delivering X"
- Form submission → "Prospect - Forms Completed - Action Required"
- SOW signature → "Client - SOW Signed - Action Required"

**Manual (Admin Updates):**
- Sending flows → "Prospect - Sent Discovery - Awaiting Response"
- Sending calendar → "Prospect - Sent Consultation Link - Awaiting Booking"
- Booking confirmed → "Prospect - Consultation Booked - Scheduled"
- Sending SOW → "Prospect - Sent SOW - Awaiting Signature"
- Sending invoice → "Client - Sent Invoice - Awaiting Payment"
- Marking delivered → "Client - [Audit/Workshop] Delivered - Awaiting Feedback"
- Closing engagement → "Client - Engagement Complete - Archived"

### Status Change Logging

Every status change creates an engagement log entry with:
- Timestamp
- Actor (Admin, Client, or System)
- Action (what changed)
- Related object (which form, invoice, etc.)
- Previous status → New status

---

## Migration Strategy

### Legacy Statuses (Backward Compatibility)

Old statuses still supported for gradual migration:
- `sent` → Maps to "Awaiting Response" concept
- `in-progress` → Maps to "Action Required" or "Delivering" depending on context
- `awaiting-client` → Maps to "Awaiting Response"
- `awaiting-review` → Maps to "Action Required"
- `paid` → Superseded by "Payment Received - Delivering X"
- `completed` → Maps to "Complete - Archived"
- `delivered` → Maps to "[Service] Delivered - Awaiting Feedback"

### Phased Rollout

**Phase 1:** ✅ New status types added to system (backward compatible)
**Phase 2:** ✅ Badge colors implemented by "whose court" logic
**Phase 3:** 🔄 Update Draft Engagement page to use new statuses
**Phase 4:** 🔄 Update mock data to demonstrate full lifecycle
**Phase 5:** 🔄 Remove legacy statuses from UI (keep in code for data migration)

---

Last Updated: December 16, 2024
Version: 1.0
