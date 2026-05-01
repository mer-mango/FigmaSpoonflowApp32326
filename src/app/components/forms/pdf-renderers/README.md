# PDF Renderer Components (@react-pdf/renderer)

This directory contains **native PDF generation components** using `@react-pdf/renderer`.

## 🎯 What This Is

Instead of converting HTML to PDF (with all its spacing/margin issues), these components **generate real PDFs programmatically** using React-like syntax.

## 📁 Files in This Directory

- **`SOW_SingleOption_PDF.tsx`** - Native PDF renderer for Scope of Work (single option)
- **`Licensing_PDF.tsx`** - Native PDF renderer for Licensing Agreement
- **`PreConsultGeneral_PDF.tsx`** - Native PDF renderer for Pre-Consult Questionnaire
- **`PDFGeneratorDemo.tsx`** - Demo component showing how to use these renderers
- **`README.md`** - This file

## 🚀 How to Use

### Basic Example

```tsx
import { pdf } from '@react-pdf/renderer';
import { SOWSingleOptionPDF } from './pdf-renderers/SOW_SingleOption_PDF';

// Your existing data object (unchanged!)
const documentData = {
  projectOptions: [{
    title: "Patient Experience Transformation",
    subtitle: "6-Month Engagement",
    projectDescription: "...",
    // ... all your other fields
  }],
  enabledSections: {
    projectDescription: true,
    scopeOfServices: true,
    // ... etc
  }
};

// Generate PDF blob
const blob = await pdf(
  <SOWSingleOptionPDF 
    documentData={documentData}
    clientSignature="John Doe"
    clientSignatureDate="2025-01-15"
  />
).toBlob();

// Download it
const url = URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = url;
link.download = 'Scope-of-Work.pdf';
link.click();
URL.revokeObjectURL(url);
```

### Upload to Supabase Storage

```tsx
// Generate PDF
const blob = await pdf(<SOWSingleOptionPDF documentData={data} />).toBlob();
const arrayBuffer = await blob.arrayBuffer();

// Upload to storage
const { data, error } = await supabase.storage
  .from('make-a89809a8-documents')
  .upload(`pdfs/sow-${clientId}.pdf`, arrayBuffer, {
    contentType: 'application/pdf'
  });

// Get signed URL to send to client
const { data: { signedUrl } } = await supabase.storage
  .from('make-a89809a8-documents')
  .createSignedUrl(`pdfs/sow-${clientId}.pdf`, 3600);
```

## ✅ Key Benefits

### 1. **No More Print CSS Issues**
- Perfect margins (0.75") every time
- No weird spacing problems
- No page break issues
- Professional typography

### 2. **Same Data, Better Output**
```tsx
// Your data stays EXACTLY the same
const data = {
  projectOptions: [...],
  enabledSections: {...}
};

// Just use different renderer
<SOWSingleOptionPDF documentData={data} />  // ← Native PDF
```

### 3. **Dynamic Content Works Perfectly**
```tsx
// Conditional rendering works as expected
{renderSection('projectDescription', 'Project Description', option.projectDescription)}
{renderSection('scopeOfServices', 'Scope of Services', option.scopeOfServices)}

// Sections automatically numbered based on which are enabled
```

### 4. **Easy to Send to Clients**
```tsx
// Download
const blob = await pdf(<Component />).toBlob();

// Upload to storage
await uploadToSupabase(blob);

// Attach to email
await sendEmailWithAttachment(blob);

// All work seamlessly
```

## 🎨 Styling

Styles are defined using `StyleSheet.create()` which is similar to CSS but limited to PDF-compatible properties:

```tsx
const styles = StyleSheet.create({
  page: {
    padding: '0.75in',  // ← Perfect margins
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  
  documentTitle: {
    fontSize: 36,
    color: '#034863',
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
  },
  
  // ... etc
});
```

### Available Fonts (Built-in)
- `Helvetica` (regular, bold, oblique, bold-oblique)
- `Times-Roman` (regular, bold, italic, bold-italic)
- `Courier` (regular, bold, oblique, bold-oblique)

You can also register custom fonts if needed.

## 📊 Comparison: Current vs. @react-pdf/renderer

| Feature | Current (HTML→PDF) | @react-pdf/renderer |
|---------|-------------------|---------------------|
| **Margins** | Inconsistent, CSS hacks | Perfect 0.75" every time |
| **Spacing** | Print CSS issues | Native PDF spacing |
| **Fonts** | Web fonts may fail | Built-in PDF fonts |
| **File Size** | Larger | Optimized |
| **Page Breaks** | Unpredictable | Controlled with `wrap` prop |
| **Dynamic Content** | Works (HTML) | Works (React-like) |
| **Data Structure** | Same | **Same** ✅ |
| **Conditional Rendering** | Works | Works |
| **Professional Output** | Good | **Excellent** ✅ |

## 🔧 Migration Path

You don't have to migrate all at once. Here's a gradual approach:

### Phase 1: Proof of Concept (✅ Done)
- Created PDF renderers for 3 documents
- Tested generation and download
- Verified data compatibility

### Phase 2: Add PDF Option (Recommended Next Step)
Keep your current HTML documents for preview, add PDF generation option:

```tsx
// In your document component
<div>
  {/* Existing HTML preview - users see this on screen */}
  <SOWSingleOption documentData={data} {...props} />
  
  {/* Add PDF download button */}
  <PDFGeneratorDemo 
    documentType="sow"
    documentData={data}
    clientSignature={signature}
  />
</div>
```

### Phase 3: Full Migration (Optional)
Replace HTML documents entirely with:
- React preview component (for screen)
- PDF renderer component (for export)

## 📝 Common Patterns

### Dynamic Sections
```tsx
// Helper function to render only enabled sections
const renderSection = (
  sectionKey: keyof SectionToggles,
  title: string,
  content: string
) => {
  if (!enabledSections[sectionKey] || !content) return null;

  return (
    <View style={styles.section} wrap={false}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionNumber}>{getSectionNumber(sectionKey)}</Text>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionContent}>
        {renderTextWithSubheaders(content)}
      </View>
    </View>
  );
};
```

### Prevent Page Breaks
```tsx
// Use wrap={false} to keep content together
<View style={styles.section} wrap={false}>
  {/* This entire section stays on one page */}
</View>
```

### Conditional Content
```tsx
{/* Only render if data exists */}
{clientSignature && (
  <View style={styles.signatureSection}>
    <Text>{clientSignature}</Text>
  </View>
)}

{/* Map over arrays */}
{usageRights.map((right, index) => (
  <View key={right.id}>
    <Text>{right.text}</Text>
  </View>
))}
```

## 🐛 Debugging Tips

1. **Check Console**: PDF generation errors appear in browser console
2. **Test with Simple Data First**: Start with minimal data, add complexity
3. **Verify Data Structure**: Use `console.log(documentData)` before generating
4. **Preview in Browser**: The PDF component won't render in browser, but errors will show

## 🔗 Resources

- [@react-pdf/renderer Documentation](https://react-pdf.org/)
- [Styling Guide](https://react-pdf.org/styling)
- [Advanced Examples](https://react-pdf.org/advanced)

## ❓ FAQ

**Q: Do I need to change my data structure?**  
A: No! Your data stays exactly the same. Only the rendering method changes.

**Q: Can I still edit templates in the Template Editor?**  
A: Yes! The template editor modifies the data structure, which both HTML and PDF renderers use.

**Q: What about conditional sections?**  
A: They work perfectly. See the `renderSection()` helper function in the PDF components.

**Q: How do I add more documents?**  
A: Create a new PDF component following the same pattern as the existing ones.

**Q: Can I customize fonts/colors?**  
A: Yes! Edit the `styles` object in each PDF component. You can also register custom fonts.

**Q: How big are the generated PDFs?**  
A: Typically 50-200KB depending on content. Much smaller than HTML-to-PDF conversions.
