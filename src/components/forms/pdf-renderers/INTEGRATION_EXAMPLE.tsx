/**
 * Integration Example: How to Add PDF Generation to Existing Documents
 * 
 * This file shows practical examples of integrating @react-pdf/renderer
 * into your existing document components.
 */

import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { Button } from '../ui/button';
import { Download, FileDown, Send, Loader2 } from 'lucide-react';
import { SOWSingleOptionPDF } from './SOW_SingleOption_PDF';
import { LicensingPDF } from './Licensing_PDF';
import { PreConsultGeneralPDF } from './PreConsultGeneral_PDF';
import type { DocumentType, PDFGenerationOptions } from './types';

// ============================================================================
// Example 1: Simple "Download PDF" Button
// ============================================================================

interface SimplePDFButtonProps {
  documentType: DocumentType;
  documentData: any;
  filename?: string;
}

export function SimplePDFButton({ documentType, documentData, filename }: SimplePDFButtonProps) {
  const [isGenerating, setIsGenerating] = React.useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      let component;
      const defaultFilename = filename || 'document.pdf';

      switch (documentType) {
        case 'sow-single':
          component = <SOWSingleOptionPDF documentData={documentData} />;
          break;
        case 'licensing':
          component = <LicensingPDF documentData={documentData} />;
          break;
        case 'preconsult-general':
          component = <PreConsultGeneralPDF documentData={documentData} />;
          break;
        default:
          throw new Error(`Unknown document type: ${documentType}`);
      }

      const blob = await pdf(component).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = defaultFilename;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to generate PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={isGenerating}
      className="bg-[#2f829b] hover:bg-[#2f829b]/90 text-white"
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </>
      )}
    </Button>
  );
}

// ============================================================================
// Example 2: Advanced PDF Button with Options
// ============================================================================

interface AdvancedPDFButtonProps {
  documentType: DocumentType;
  documentData: any;
  options?: PDFGenerationOptions;
}

export function AdvancedPDFButton({ documentType, documentData, options }: AdvancedPDFButtonProps) {
  const [isGenerating, setIsGenerating] = React.useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);
    options?.onGenerateStart?.();

    try {
      let component;
      
      // Select appropriate PDF component
      switch (documentType) {
        case 'sow-single':
          component = <SOWSingleOptionPDF documentData={documentData} />;
          break;
        case 'licensing':
          component = <LicensingPDF documentData={documentData} />;
          break;
        case 'preconsult-general':
          component = <PreConsultGeneralPDF documentData={documentData} />;
          break;
        default:
          throw new Error(`Document type not supported: ${documentType}`);
      }

      // Generate PDF
      const blob = await pdf(component).toBlob();

      // Auto-download if enabled
      if (options?.autoDownload !== false) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${options?.filename || 'document'}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
      }

      // Success callback
      options?.onGenerateSuccess?.(blob);

    } catch (error) {
      console.error('PDF generation error:', error);
      options?.onGenerateError?.(error as Error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button onClick={generatePDF} disabled={isGenerating}>
      {isGenerating ? 'Generating...' : 'Generate PDF'}
    </Button>
  );
}

// ============================================================================
// Example 3: Replace Existing Export Button
// ============================================================================

/**
 * Drop-in replacement for your current exportToPDF function
 * 
 * BEFORE:
 * <Button onClick={() => exportToPDF('Scope-of-Work')}>Download</Button>
 * 
 * AFTER:
 * <Button onClick={() => exportToPDFNew('sow-single', documentData, 'Scope-of-Work')}>Download</Button>
 */

export async function exportToPDFNew(
  documentType: DocumentType,
  documentData: any,
  filename: string
): Promise<void> {
  let component;

  switch (documentType) {
    case 'sow-single':
      component = <SOWSingleOptionPDF documentData={documentData} />;
      break;
    case 'licensing':
      component = <LicensingPDF documentData={documentData} />;
      break;
    case 'preconsult-general':
      component = <PreConsultGeneralPDF documentData={documentData} />;
      break;
    default:
      throw new Error(`Document type not supported: ${documentType}`);
  }

  const blob = await pdf(component).toBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}

// ============================================================================
// Example 4: Integration with FormsApp Component
// ============================================================================

/**
 * This shows how to integrate into your existing FormsApp.tsx
 * 
 * Add this to your document view section:
 */

export function SOWDocumentWithPDF({ documentData, onEdit, onBack }: any) {
  const [showPDFOptions, setShowPDFOptions] = React.useState(false);

  return (
    <div className="relative">
      {/* Your existing HTML document for screen viewing */}
      <div className="screen-view">
        {/* ... your existing SOWSingleOption component ... */}
      </div>

      {/* PDF Export Options - positioned in top-right */}
      <div className="fixed top-24 right-8 z-50 print:hidden">
        <SimplePDFButton
          documentType="sow-single"
          documentData={documentData}
          filename="Scope-of-Work"
        />
      </div>

      {/* Or: Expandable PDF options panel */}
      {showPDFOptions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 print:hidden">
          <div className="bg-white rounded-xl p-8 max-w-md">
            <h3 className="text-2xl font-bold mb-4">Export Options</h3>
            
            <div className="space-y-3">
              <SimplePDFButton
                documentType="sow-single"
                documentData={documentData}
                filename="Scope-of-Work"
              />
              
              <Button
                variant="outline"
                onClick={() => {
                  // Generate and email to client
                  // ... your email logic here
                }}
              >
                <Send className="w-4 h-4 mr-2" />
                Email to Client
              </Button>
              
              <Button
                variant="outline"
                onClick={() => {
                  // Generate and save to storage
                  // ... your storage logic here
                }}
              >
                <FileDown className="w-4 h-4 mr-2" />
                Save to Storage
              </Button>
            </div>

            <Button
              variant="ghost"
              onClick={() => setShowPDFOptions(false)}
              className="mt-4 w-full"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Example 5: Email PDF as Attachment
// ============================================================================

export async function emailPDFToClient(
  documentType: DocumentType,
  documentData: any,
  recipientEmail: string,
  subject: string
): Promise<void> {
  // Generate PDF
  let component;
  switch (documentType) {
    case 'sow-single':
      component = <SOWSingleOptionPDF documentData={documentData} />;
      break;
    case 'licensing':
      component = <LicensingPDF documentData={documentData} />;
      break;
    case 'preconsult-general':
      component = <PreConsultGeneralPDF documentData={documentData} />;
      break;
    default:
      throw new Error(`Document type not supported: ${documentType}`);
  }

  const blob = await pdf(component).toBlob();

  // Send to your email endpoint
  const formData = new FormData();
  formData.append('pdf', blob, 'document.pdf');
  formData.append('to', recipientEmail);
  formData.append('subject', subject);

  const response = await fetch('/api/send-email', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to send email');
  }
}

// ============================================================================
// Example 6: Save PDF to Supabase Storage
// ============================================================================

export async function savePDFToStorage(
  documentType: DocumentType,
  documentData: any,
  filename: string,
  supabase: any
): Promise<string> {
  // Generate PDF
  let component;
  switch (documentType) {
    case 'sow-single':
      component = <SOWSingleOptionPDF documentData={documentData} />;
      break;
    case 'licensing':
      component = <LicensingPDF documentData={documentData} />;
      break;
    case 'preconsult-general':
      component = <PreConsultGeneralPDF documentData={documentData} />;
      break;
    default:
      throw new Error(`Document type not supported: ${documentType}`);
  }

  const blob = await pdf(component).toBlob();
  const arrayBuffer = await blob.arrayBuffer();

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('make-a89809a8-documents')
    .upload(`pdfs/${filename}.pdf`, arrayBuffer, {
      contentType: 'application/pdf',
      upsert: true,
    });

  if (error) {
    throw error;
  }

  // Get signed URL
  const { data: urlData } = await supabase.storage
    .from('make-a89809a8-documents')
    .createSignedUrl(`pdfs/${filename}.pdf`, 3600);

  return urlData.signedUrl;
}

// ============================================================================
// Example 7: Batch PDF Generation
// ============================================================================

export async function generateMultiplePDFs(
  documents: Array<{ type: DocumentType; data: any; filename: string }>
): Promise<Blob[]> {
  const pdfs = await Promise.all(
    documents.map(async ({ type, data, filename }) => {
      let component;
      
      switch (type) {
        case 'sow-single':
          component = <SOWSingleOptionPDF documentData={data} />;
          break;
        case 'licensing':
          component = <LicensingPDF documentData={data} />;
          break;
        case 'preconsult-general':
          component = <PreConsultGeneralPDF documentData={data} />;
          break;
        default:
          throw new Error(`Document type not supported: ${type}`);
      }

      return await pdf(component).toBlob();
    })
  );

  return pdfs;
}

// ============================================================================
// Example 8: Progress Indicator for Large PDFs
// ============================================================================

export function PDFGeneratorWithProgress({ documentType, documentData }: any) {
  const [progress, setProgress] = React.useState(0);
  const [isGenerating, setIsGenerating] = React.useState(false);

  const generateWithProgress = async () => {
    setIsGenerating(true);
    setProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 100);

      let component;
      switch (documentType) {
        case 'sow-single':
          component = <SOWSingleOptionPDF documentData={documentData} />;
          break;
        case 'licensing':
          component = <LicensingPDF documentData={documentData} />;
          break;
        case 'preconsult-general':
          component = <PreConsultGeneralPDF documentData={documentData} />;
          break;
        default:
          throw new Error(`Document type not supported: ${documentType}`);
      }

      const blob = await pdf(component).toBlob();
      
      clearInterval(progressInterval);
      setProgress(100);

      // Download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'document.pdf';
      link.click();
      URL.revokeObjectURL(url);

      setTimeout(() => {
        setIsGenerating(false);
        setProgress(0);
      }, 500);
      
    } catch (error) {
      console.error('PDF generation failed:', error);
      setIsGenerating(false);
      setProgress(0);
    }
  };

  return (
    <div>
      <Button onClick={generateWithProgress} disabled={isGenerating}>
        {isGenerating ? 'Generating...' : 'Download PDF'}
      </Button>
      
      {isGenerating && (
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#2f829b] h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-1">{progress}% complete</p>
        </div>
      )}
    </div>
  );
}
