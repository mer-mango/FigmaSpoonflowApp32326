# Migration Checklist: @react-pdf/renderer Implementation

## 🎯 Goal
Implement @react-pdf/renderer for all 14 documents, then integrate with Flow Wizard system.

---

## Phase 1: Create PDF Renderers (Week 1)

### ✅ Already Complete
- [x] SOW Single Option PDF renderer
- [x] Licensing Agreement PDF renderer
- [x] Pre-Consult General PDF renderer
- [x] PDF Generation Service (centralized)
- [x] Flow Integration Example (documentation)

### 📝 To Create (13 documents remaining)

#### High Priority (Client-facing contracts)
- [ ] **Invoice PDF** (`Invoice_PDF.tsx`)
  - Line items
  - Subtotal/tax/total
  - Payment instructions
  - Your branding
  
- [ ] **SOW Multiple Options PDF** (`SOW_MultipleOptions_PDF.tsx`)
  - Multiple project options
  - Option selection
  - All sections like single option

- [ ] **Services Brochure PDF** (`ServicesBrochure_PDF.tsx`)
  - Service cards
  - Pricing
  - Testimonials
  - Best fit use cases

- [ ] **Payment Parameters PDF** (`PaymentParams_PDF.tsx`)
  - Payment structure
  - Terms
  - Stripe link integration

#### Medium Priority (Onboarding forms)
- [ ] **Workshop Curriculum PDF** (`WorkshopCurriculum_PDF.tsx`)
  - Agenda
  - Learning objectives
  - Materials

- [ ] **Innovation Audit PDF** (`InnovationAudit_PDF.tsx`)
  - Audit scope
  - Assessment areas
  - Timeline

- [ ] **Pre-Consult Training PDF** (`PreConsultTraining_PDF.tsx`)
  - Training-specific questions
  - Learning objectives

- [ ] **Pre-Consult Audit PDF** (`PreConsultAudit_PDF.tsx`)
  - Audit-specific questions
  - Current state assessment

#### Lower Priority (Internal/feedback)
- [ ] **Feedback/Testimonial PDF** (`FeedbackTestimonial_PDF.tsx`)
  - Feedback questions
  - Testimonial collection

- [ ] **Scheduling PDF** (`Scheduling_PDF.tsx`)
  - Availability
  - Preferences
  - Meeting details

- [ ] **PX Audit Intake PDF** (`PXAuditIntake_PDF.tsx`)
  - Detailed audit questions
  - Organization assessment

---

## Phase 2: Update PDF Generation Service (Week 2)

### Tasks
- [ ] Add all new PDF components to `pdfGenerationService.ts`
- [ ] Test each document type:
  - [ ] Generate PDF successfully
  - [ ] Download works
  - [ ] Upload to storage works
  - [ ] Correct file size (50-200KB range)
  - [ ] Perfect 0.75" margins
  - [ ] All conditional sections work

- [ ] Create helper functions:
  - [ ] `getDocumentFileName(type, data)` - consistent naming
  - [ ] `validateDocumentData(type, data)` - data validation
  - [ ] `getStoragePath(flowId, docType)` - consistent paths

---

## Phase 3: Replace Download Buttons (Week 3)

### Current State
Documents have "Download PDF" buttons that use `exportToPDF()` (HTML-to-PDF).

### Migration Strategy

#### Option A: Replace Gradually (Recommended)
For each document:
1. Keep HTML version for screen preview
2. Replace download button with new PDF generator
3. Test thoroughly
4. Move to next document

```tsx
// OLD
<Button onClick={() => exportToPDF('Document-Name')}>
  Download PDF
</Button>

// NEW
<Button onClick={() => downloadPDF('document-type', documentData)}>
  Download PDF
</Button>
```

#### Option B: Feature Flag (Safest)
Add a toggle to switch between old and new:
```tsx
const useNewPDF = true; // Can toggle during testing

{useNewPDF ? (
  <Button onClick={() => downloadPDF('sow-single', data)}>
    Download PDF (New)
  </Button>
) : (
  <Button onClick={() => exportToPDF('Scope-of-Work')}>
    Download PDF (Old)
  </Button>
)}
```

### Documents to Update
- [ ] SOW Single Option
- [ ] SOW Multiple Options
- [ ] Licensing Agreement
- [ ] Pre-Consult General
- [ ] Pre-Consult Training
- [ ] Pre-Consult Audit
- [ ] Invoice
- [ ] Services Brochure
- [ ] Payment Parameters
- [ ] Workshop Curriculum
- [ ] Innovation Audit
- [ ] PX Audit Intake
- [ ] Feedback/Testimonial
- [ ] Scheduling

---

## Phase 4: Flow Wizard Integration (Week 4)

### Current Flow System
```
Contact → Forms → Customize → Preview → URL → Email
```

### Integration Points

#### 1. Flow Completion Handler
When client submits flow, call PDF generation:

```tsx
// In your flow submission handler
const handleFlowSubmit = async (flowInstanceId, formData) => {
  try {
    // Generate and upload PDF
    const result = await handleSOWFlowCompletion(
      flowInstanceId,
      formData,
      supabase
    );
    
    if (result.success) {
      // Send email with PDF link
      await sendCompletionEmail(formData.clientEmail, result.pdfUrl);
      
      // Show success message
      toast.success('Flow completed! PDF generated and sent.');
    }
  } catch (error) {
    toast.error('Failed to generate PDF');
  }
};
```

#### 2. Storage Setup
- [ ] Verify Supabase Storage bucket exists (`make-a89809a8-documents`)
- [ ] Set up folder structure: `flows/{flowId}/{document-name}.pdf`
- [ ] Configure access policies (private bucket, signed URLs)

#### 3. Email Integration
- [ ] Update email templates to include PDF download links
- [ ] Test email delivery with PDF links
- [ ] Set signed URL expiration (default: 1 hour, consider 7 days for clients)

#### 4. Database Schema
- [ ] Add `pdf_url` column to `flow_instances` table
- [ ] Add `sow_pdf_url`, `invoice_pdf_url`, etc. for multi-doc flows
- [ ] Add `pdf_generated_at` timestamp

#### 5. Flow Types to Integrate
- [ ] **SOW Flow** - generates Scope of Work PDF
- [ ] **Pre-Consult Flow** - generates questionnaire PDF
- [ ] **Onboarding Flow** - generates multiple PDFs (SOW + Invoice + Licensing)
- [ ] **Workshop Flow** - generates curriculum PDF
- [ ] **Audit Flow** - generates audit intake PDF

---

## Phase 5: Testing & Validation (Ongoing)

### For Each Document Type

#### Visual Quality
- [ ] Margins are exactly 0.75"
- [ ] Typography is professional
- [ ] Brand colors correct (#2f829b, #034863, #6b2358)
- [ ] Logo renders correctly
- [ ] Page breaks are clean
- [ ] Signatures render properly

#### Functional Testing
- [ ] Generate with minimal data
- [ ] Generate with complete data
- [ ] Generate with all sections enabled
- [ ] Generate with some sections disabled
- [ ] Test with very long content (page breaks)
- [ ] Test with special characters
- [ ] Test with client signatures

#### Technical Testing
- [ ] File size is 50-200KB (not 300-500KB)
- [ ] Download works on Chrome, Firefox, Safari
- [ ] Upload to storage succeeds
- [ ] Signed URL generation works
- [ ] PDF opens in all PDF viewers (Adobe, Preview, Chrome, etc.)

#### Flow Integration Testing
- [ ] Client completes flow successfully
- [ ] PDF generates automatically
- [ ] PDF uploads to correct storage path
- [ ] Database record updates correctly
- [ ] Email sends with correct PDF link
- [ ] PDF link works when clicked
- [ ] Signed URL doesn't expire too quickly

---

## Phase 6: Cleanup (Final Week)

### Optional Cleanup Tasks
- [ ] Remove old `exportToPDF` utility (if no longer needed)
- [ ] Remove print CSS from global styles
- [ ] Remove `.no-print` classes from components
- [ ] Remove `PrintLogo` component (if using PDF headers instead)
- [ ] Update documentation
- [ ] Create runbook for team

---

## 🚀 Quick Win Strategy

If you want to see value immediately, prioritize these 3 documents first:

### Week 1 Quick Wins
1. **SOW Single Option** (already done ✅)
   - Replace download button
   - Test with real client data
   - If good, use for next client

2. **Invoice** (create this next)
   - Most important for payment collection
   - Replace download button
   - Test Stripe integration

3. **Pre-Consult General** (already done ✅)
   - Integrate with flow wizard
   - Test automated PDF generation
   - Verify email delivery

If these 3 work well, you'll have:
- ✅ Professional contracts (SOW)
- ✅ Payment automation (Invoice)
- ✅ Lead qualification (Pre-Consult)

Then continue with the rest at your own pace.

---

## 📊 Progress Tracking

### Overall Progress
- **PDF Renderers:** 3/14 complete (21%)
- **Service Integration:** 80% complete
- **Download Replacement:** 0/14 complete
- **Flow Integration:** 0% complete

### Next Steps
1. Create Invoice PDF renderer
2. Test thoroughly
3. Replace invoice download button
4. Create next high-priority PDF
5. Continue pattern

---

## 💡 Tips

### Don't Rush
- Take time to perfect each PDF renderer
- Test thoroughly before moving to next
- Keep HTML components (don't delete yet)

### Iterate
- Start with basic version
- Add polish incrementally
- Get feedback from real PDFs

### Document As You Go
- Note any edge cases
- Document data requirements
- Update type definitions

### Leverage AI
- I can help create each PDF renderer
- Just share the HTML component
- I'll convert to PDF format

---

## 🆘 When You Need Help

### I Can Help With:
- Creating new PDF renderers
- Debugging PDF layout issues
- Flow integration code
- Testing strategies
- Performance optimization

### Just Share:
- The HTML component for a document
- Sample data object
- Any specific requirements
- Screenshots of issues

---

## ✅ Success Criteria

You'll know the migration is complete when:
- [ ] All 14 documents have PDF renderers
- [ ] All download buttons use new method
- [ ] Flow wizard generates PDFs automatically
- [ ] PDFs are uploaded to storage
- [ ] Emails include PDF links
- [ ] File sizes are 60-70% smaller
- [ ] Margins are perfect on all PDFs
- [ ] No print CSS in codebase
- [ ] Team is trained on new system
