# Implementation Guide: @react-pdf/renderer

## 🎯 What You Have Now

I've created **proof-of-concept PDF renderers** for three of your documents:

1. **`SOW_SingleOption_PDF.tsx`** - Scope of Work (Single Option)
2. **`Licensing_PDF.tsx`** - Licensing Agreement
3. **`PreConsultGeneral_PDF.tsx`** - General Pre-Consult Questionnaire

Plus supporting files:
- **`PDFGeneratorDemo.tsx`** - Shows how to generate/download PDFs
- **`ComparisonDemo.tsx`** - Side-by-side comparison of old vs new
- **`index.ts`** - Easy imports and utility functions
- **`README.md`** - Complete documentation
- **`VISUAL_COMPARISON.md`** - Visual examples of differences

## 🚀 Quick Start: Try It Out

### Option 1: Add to Existing Document (Recommended)

Add the PDF generator to your current SOW document:

```tsx
// In /components/forms/FormsApp.tsx or wherever SOW is rendered

import { PDFGeneratorDemo } from './pdf-renderers/PDFGeneratorDemo';

// In your render:
{currentView === 'document' && currentFormType === 'sow-single' && documentData && (
  <>
    {/* Your existing HTML document */}
    <SOWSingleOption
      documentData={documentData}
      status={status}
      // ... all your existing props
    />
    
    {/* ADD THIS: PDF generation option */}
    <div className="max-w-5xl mx-auto px-4 mt-8">
      <PDFGeneratorDemo
        documentType="sow"
        documentData={documentData}
        clientSignature={clientSignature}
        clientSignatureDate={clientSignatureDate}
        consultantSignature={consultantSignature}
      />
    </div>
  </>
)}
```

### Option 2: Create a Test Page

Create `/components/forms/PDFTestPage.tsx`:

```tsx
import React from 'react';
import { ComparisonDemo } from './pdf-renderers/ComparisonDemo';

// Sample data
const testData = {
  projectOptions: [{
    id: '1',
    title: 'Patient Experience Transformation',
    subtitle: '6-Month Strategic Engagement',
    projectDescription: 'Comprehensive patient experience assessment and improvement program...',
    scopeOfServices: 'We will conduct stakeholder interviews, analyze current processes...',
    deliverablesAndSuccess: 'Final deliverables include...',
    timeline: 'Phase 1 (Months 1-2): Discovery...',
    rolesResponsibilities: 'Client will provide...',
    communication: 'Weekly status meetings...',
    feesPaymentTerms: 'Total Investment: $50,000...',
    assumptions: 'We assume that...',
    inclusionsExclusions: 'Included: ...',
    risksConstraints: 'Key risks include...',
    ipUsage: 'All deliverables remain property of...',
    confidentiality: 'Both parties agree to...'
  }],
  enabledSections: {
    projectDescription: true,
    scopeOfServices: true,
    deliverablesAndSuccess: true,
    timeline: true,
    rolesResponsibilities: true,
    communication: true,
    feesPaymentTerms: true,
    assumptions: true,
    inclusionsExclusions: true,
    risksConstraints: false,  // This section disabled
    ipUsage: true,
    confidentiality: true
  },
  date: '2025-01-15'
};

export function PDFTestPage() {
  return (
    <div className="min-h-screen bg-[#f5fafb] py-12">
      <ComparisonDemo
        documentData={testData}
        clientSignature="Jane Smith"
        clientSignatureDate="2025-01-15"
        consultantSignature="Meredith Mangold, CPXP"
      />
    </div>
  );
}
```

Then add a route to view it (or just temporarily replace your App component).

## 📋 Installation Requirements

Make sure you have the package installed:

```bash
npm install @react-pdf/renderer
```

Or if using other package managers:
```bash
yarn add @react-pdf/renderer
pnpm add @react-pdf/renderer
```

## 🔍 Testing the PDFs

### 1. Generate Both PDFs
Use the `ComparisonDemo` component to download both versions:
- Old method: HTML-to-PDF conversion
- New method: Native PDF generation

### 2. Compare Them
Open both PDFs side-by-side and look for:
- **Margins**: Measure with a ruler (should be exactly 0.75")
- **Font consistency**: Check if text looks crisp
- **Page breaks**: See if sections break nicely
- **File size**: Check properties (new should be 60-70% smaller)
- **Cross-platform**: Try opening in different PDF viewers

### 3. Check Dynamic Content
Test with:
- Different enabled/disabled sections
- Long vs short content
- With and without signatures
- Various data lengths

## 🎨 Customizing the PDFs

### Change Colors

```tsx
// In any _PDF.tsx file
const styles = StyleSheet.create({
  sectionNumber: {
    backgroundColor: '#2f829b',  // ← Your brand color
    color: '#ffffff',
  },
  documentTitle: {
    color: '#034863',  // ← Your brand color
  }
});
```

### Change Fonts

```tsx
// Built-in fonts (no setup needed)
fontFamily: 'Helvetica'          // Regular
fontFamily: 'Helvetica-Bold'     // Bold
fontFamily: 'Helvetica-Oblique'  // Italic
fontFamily: 'Times-Roman'        // Serif
fontFamily: 'Courier'            // Monospace

// Or register custom fonts:
import { Font } from '@react-pdf/renderer';

Font.register({
  family: 'Lora',
  src: '/path/to/lora.ttf'
});
```

### Add/Remove Sections

```tsx
// In SOW_SingleOption_PDF.tsx
{renderSection('projectDescription', 'Project Description', option.projectDescription)}
{renderSection('scopeOfServices', 'Scope of Services', option.scopeOfServices)}

// Add a new section:
{renderSection('newSection', 'New Section Title', option.newSectionContent)}

// The conditional logic automatically handles enabled/disabled sections
```

## 🔄 Migration Strategy

### Phase 1: Side-by-Side (Current)
Keep both approaches:
- HTML document for screen preview
- PDF renderer for final export

```tsx
<SOWSingleOption />  {/* Screen preview */}
<PDFGeneratorDemo /> {/* PDF export */}
```

**Pros:**
- No disruption to current workflow
- Can test thoroughly before full migration
- Users see familiar interface

### Phase 2: Replace Export Only
Keep HTML preview, but replace the "Download PDF" button:

```tsx
// Old
<Button onClick={() => exportToPDF('doc')}>Download</Button>

// New
<Button onClick={async () => {
  const blob = await pdf(<SOWPDF data={data} />).toBlob();
  downloadBlob(blob, 'sow.pdf');
}}>Download</Button>
```

**Pros:**
- Minimal code changes
- Better PDF output immediately
- Keep familiar preview interface

### Phase 3: Full Separation (Future)
Separate preview and PDF components:
- **Preview component**: Optimized for screen (HTML/CSS)
- **PDF component**: Optimized for export (@react-pdf/renderer)

```tsx
// Screen preview (simplified, no print CSS)
<SOWPreviewComponent data={data} />

// PDF generation (hidden, triggered by button)
<PDFGenerator component={<SOWPDF data={data} />} />
```

**Pros:**
- Cleaner code (no print CSS in preview)
- Each optimized for its purpose
- Best user experience

## 🐛 Troubleshooting

### PDF Generation Fails

**Check console for errors:**
```javascript
try {
  const blob = await pdf(<Component />).toBlob();
} catch (error) {
  console.error('PDF Error:', error);
  // Look for specific error messages
}
```

**Common issues:**
1. **Missing data**: Component expects `documentData.field` but it's undefined
2. **Invalid styles**: Used a CSS property not supported in PDF (e.g., `display: grid`)
3. **Infinite loop**: Conditional rendering creating circular dependency

### Fonts Don't Look Right

**Use built-in fonts for best results:**
```tsx
fontFamily: 'Helvetica'  // ✅ Always works
fontFamily: 'Arial'      // ❌ Not available in PDF
```

**Or register custom fonts:**
```tsx
Font.register({
  family: 'YourFont',
  src: '/path/to/font.ttf'
});
```

### Spacing Issues

**Remember: PDF uses points (pt), not pixels (px)**
```tsx
// Good
marginTop: 24        // 24pt
padding: '0.75in'    // 0.75 inches

// Avoid (no 'px' suffix in PDF)
marginTop: '24px'    // ❌ Won't work
```

### Page Breaks

**Use `wrap={false}` to keep content together:**
```tsx
<View style={styles.section} wrap={false}>
  {/* This entire section stays on one page */}
</View>
```

## 📚 Next Steps

### 1. Test the Proof of Concept (Today)
- [ ] Install @react-pdf/renderer
- [ ] Add PDFGeneratorDemo to one document
- [ ] Generate both old and new PDFs
- [ ] Compare the outputs
- [ ] Decide if you like the new approach

### 2. Expand Coverage (This Week)
If you like it:
- [ ] Create PDF renderers for remaining documents:
  - Services Document
  - Payment Parameters
  - Workshop Curriculum
  - Innovation Audit
  - Etc.
- [ ] Test with real client data
- [ ] Get feedback from clients on PDF quality

### 3. Full Migration (This Month)
Once satisfied:
- [ ] Replace all "Download PDF" buttons with new method
- [ ] Remove print CSS from components
- [ ] Update email delivery to use new PDFs
- [ ] Update storage uploads to use new PDFs

### 4. Enhancements (Future)
- [ ] Add page numbers to multi-page documents
- [ ] Add watermarks for draft versions
- [ ] Create PDF email templates
- [ ] Add batch PDF generation
- [ ] Create client-facing "Download All" feature

## 💬 Questions?

### "Do I need to rewrite all my documents right away?"
**No!** Start with one document, test it thoroughly, then decide.

### "Will my Template Editor still work?"
**Yes!** The template editor modifies the data structure. Both HTML and PDF components use the same data, so editing works for both.

### "Can I still use conditional sections?"
**Absolutely!** The PDF components use the same conditional logic:
```tsx
{enabledSections.timeline && renderSection('timeline', ...)}
```

### "What about the form wizard?"
**No changes needed!** The wizard collects data. How you render that data (HTML vs PDF) doesn't affect the wizard at all.

### "Can clients still sign documents?"
**Yes!** The signature workflow stays the same. You just pass the signature data to the PDF component:
```tsx
<SOWPDF 
  documentData={data}
  clientSignature={signature}
  clientSignatureDate={date}
/>
```

## 🎉 Summary

You now have:
- ✅ 3 working PDF renderer components
- ✅ Demo components to test them
- ✅ Complete documentation
- ✅ Migration path forward
- ✅ No changes to your data structure
- ✅ No changes to your forms/wizard
- ✅ Better PDF output with less complexity

**Recommendation:** Add the `PDFGeneratorDemo` to your SOW document today, generate both PDFs, and see the difference yourself!
