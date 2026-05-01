/**
 * PDF Export Utility
 * Handles printing documents as PDF with proper styling
 */

export const exportToPDF = (documentTitle: string = 'document') => {
  // Add print-specific styles temporarily
  const printStyles = document.createElement('style');
  printStyles.id = 'pdf-export-styles';
  printStyles.textContent = `
    @media print {
      /* CRITICAL: Hide the entire app shell and show ONLY document content */
      body > div:first-child > div:first-child {
        display: block !important;
      }
      
      /* Hide ALL possible app navigation, sidebars, headers */
      .app-sidebar,
      .no-print,
      .pdf-exclude,
      [data-pdf-exclude="true"],
      aside,
      nav:not(.document-nav):not([class*="document"]),
      .navigation,
      .sidebar,
      .side-panel,
      header:not(.document-header):not([class*="Refined"]),
      footer:not(.document-footer):not([class*="Document"]),
      [class*="sidebar"],
      [class*="Sidebar"],
      [id*="sidebar"],
      [id*="Sidebar"],
      [class*="PageHeader"],
      [class*="page-header"],
      /* Hide any fixed positioned elements that aren't document-related */
      .fixed:not([class*="document"]):not([class*="Document"]) {
        display: none !important;
        visibility: hidden !important;
        width: 0 !important;
        height: 0 !important;
        overflow: hidden !important;
        position: absolute !important;
        left: -99999px !important;
      }
      
      /* Force the app container to show only content */
      .app-container {
        display: block !important;
      }
      
      /* Hide all buttons except those marked for print */
      button:not(.print-include) {
        display: none !important;
      }
      
      /* Remove all left margins that might be from sidebar layouts */
      * {
        margin-left: 0 !important;
      }
      
      /* Force main content areas to full width */
      main,
      [role="main"],
      .main-content,
      .document-content {
        width: 100% !important;
        max-width: 100% !important;
        margin-left: 0 !important;
        margin-right: 0 !important;
      }
      
      /* Ensure document content takes full width with generous padding */
      body {
        margin: 0 !important;
        padding: 0.75in !important;
        width: 100% !important;
        font-size: 14pt !important;
        background: white !important;
      }
      
      /* Force full width on flex containers */
      .flex-1,
      [class*="flex-1"] {
        width: 100% !important;
        flex: none !important;
        margin-left: 0 !important;
      }
      
      /* Override any lg:ml-* classes that create left margin for sidebar layouts */
      [class*="lg:ml-"],
      [class*="ml-"],
      [class*="md:ml-"],
      [class*="sm:ml-"] {
        margin-left: 0 !important;
      }
      
      /* Remove any fixed positioning except for document elements */
      .fixed {
        position: relative !important;
      }
      
      /* Increase base font size for better readability */
      html {
        font-size: 14pt !important;
      }
      
      /* Scale up all text elements proportionally */
      p, li, td, th, div, span {
        font-size: 14pt !important;
        line-height: 1.6 !important;
      }
      
      h1 {
        font-size: 24pt !important;
        margin-bottom: 16pt !important;
      }
      
      h2 {
        font-size: 20pt !important;
        margin-bottom: 12pt !important;
      }
      
      h3 {
        font-size: 16pt !important;
        margin-bottom: 10pt !important;
      }
      
      h4 {
        font-size: 14pt !important;
        margin-bottom: 8pt !important;
      }
      
      /* Add generous spacing between sections */
      .space-y-6 > * + * {
        margin-top: 24pt !important;
      }
      
      .space-y-4 > * + * {
        margin-top: 18pt !important;
      }
      
      .space-y-3 > * + * {
        margin-top: 14pt !important;
      }
      
      .space-y-2 > * + * {
        margin-top: 10pt !important;
      }
      
      /* Increase padding in boxes and containers */
      .p-6, .p-8, .p-4 {
        padding: 18pt !important;
      }
      
      .px-6, .px-8 {
        padding-left: 18pt !important;
        padding-right: 18pt !important;
      }
      
      .py-6, .py-8 {
        padding-top: 18pt !important;
        padding-bottom: 18pt !important;
      }
      
      .p-4 {
        padding: 14pt !important;
      }
      
      .px-4 {
        padding-left: 14pt !important;
        padding-right: 14pt !important;
      }
      
      .py-4 {
        padding-top: 14pt !important;
        padding-bottom: 14pt !important;
      }
      
      /* Ensure proper page breaks */
      .page-break-before {
        page-break-before: always;
      }
      
      .page-break-after {
        page-break-after: always;
      }
      
      .avoid-page-break {
        page-break-inside: avoid;
      }
      
      /* Ensure white background */
      body, html {
        background: white !important;
      }
      
      /* Remove shadows and borders that don't print well */
      * {
        box-shadow: none !important;
      }
      
      /* Optimize colors for print */
      .bg-\\[\\#f5fafb\\] {
        background-color: #f5fafb !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      .bg-\\[\\#ddecf0\\] {
        background-color: #ddecf0 !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      .bg-\\[\\#e3f2f7\\] {
        background-color: #e3f2f7 !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      .bg-\\[\\#6b2358\\] {
        background-color: #6b2358 !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      .bg-\\[\\#2f829b\\] {
        background-color: #2f829b !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      /* Ensure proper page margins - generous for professional look */
      @page {
        margin: 0.75in;
        size: letter;
      }
    }
  `;
  
  document.head.appendChild(printStyles);
  
  // Set document title for the PDF filename
  const originalTitle = document.title;
  document.title = documentTitle;
  
  // Trigger print dialog
  window.print();
  
  // Cleanup after print dialog closes
  setTimeout(() => {
    document.title = originalTitle;
    const stylesToRemove = document.getElementById('pdf-export-styles');
    if (stylesToRemove) {
      stylesToRemove.remove();
    }
  }, 1000);
};

/**
 * Export a specific element to PDF
 * Useful for documents with sidebars or elements to exclude
 */
export const exportElementToPDF = (elementId: string, documentTitle: string = 'document') => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id "${elementId}" not found`);
    return;
  }
  
  // Clone the element
  const clone = element.cloneNode(true) as HTMLElement;
  
  // Create a temporary container
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.appendChild(clone);
  document.body.appendChild(container);
  
  // Hide the original content
  const originalContent = document.body.innerHTML;
  document.body.innerHTML = '';
  document.body.appendChild(clone);
  
  // Set title and print
  const originalTitle = document.title;
  document.title = documentTitle;
  
  window.print();
  
  // Restore original content
  setTimeout(() => {
    document.title = originalTitle;
    document.body.innerHTML = originalContent;
  }, 1000);
};