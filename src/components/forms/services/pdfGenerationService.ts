/**
 * PDF Generation Service
 * 
 * Centralized service for generating PDFs from form data.
 * Designed to work with both:
 * 1. Direct document downloads (current use case)
 * 2. Flow wizard automation (future use case)
 */

import { pdf } from '@react-pdf/renderer';
import { 
  SOWSingleOptionPDF,
  LicensingPDF,
  PreConsultGeneralPDF,
  InvoicePDF,
  // Import other PDF components as we create them
} from '../pdf-renderers';

export type DocumentType = 
  | 'sow-single'
  | 'sow-multiple'
  | 'licensing'
  | 'preconsult-general'
  | 'preconsult-training'
  | 'preconsult-audit'
  | 'invoice'
  | 'services'
  | 'payment-params'
  | 'workshop-curriculum'
  | 'innovation-audit'
  | 'feedback-testimonial'
  | 'scheduling';

export interface PDFGenerationResult {
  success: boolean;
  blob?: Blob;
  error?: string;
  fileSize?: number;
  fileName: string;
}

/**
 * Generate a PDF from document data
 * 
 * This is the core function used by:
 * - Manual download buttons
 * - Flow wizard automation
 * - Email attachments
 * - Storage uploads
 */
export async function generateDocumentPDF(
  documentType: DocumentType,
  documentData: any,
  options?: {
    clientSignature?: string;
    clientSignatureDate?: string;
    consultantSignature?: string;
  }
): Promise<PDFGenerationResult> {
  try {
    // Select the appropriate PDF component
    let component;
    let fileName: string;

    switch (documentType) {
      case 'sow-single':
        component = (
          <SOWSingleOptionPDF 
            documentData={documentData}
            clientSignature={options?.clientSignature}
            clientSignatureDate={options?.clientSignatureDate}
            consultantSignature={options?.consultantSignature}
          />
        );
        fileName = 'Scope-of-Work.pdf';
        break;

      case 'licensing':
        component = <LicensingPDF documentData={documentData} />;
        fileName = 'Licensing-Agreement.pdf';
        break;

      case 'preconsult-general':
        component = <PreConsultGeneralPDF documentData={documentData} />;
        fileName = 'Pre-Consult-Questionnaire.pdf';
        break;

      case 'invoice':
        component = <InvoicePDF documentData={documentData} />;
        fileName = 'Invoice.pdf';
        break;

      default:
        return {
          success: false,
          error: `PDF generation not yet implemented for document type: ${documentType}`,
          fileName: 'unknown.pdf',
        };
    }

    // Generate the PDF blob
    const blob = await pdf(component).toBlob();

    return {
      success: true,
      blob,
      fileSize: blob.size,
      fileName,
    };

  } catch (error) {
    console.error('PDF generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      fileName: 'error.pdf',
    };
  }
}

/**
 * Download a PDF to the user's computer
 * 
 * Use case: Manual download button in document preview
 */
export async function downloadPDF(
  documentType: DocumentType,
  documentData: any,
  options?: {
    clientSignature?: string;
    clientSignatureDate?: string;
    consultantSignature?: string;
    customFileName?: string;
  }
): Promise<void> {
  const result = await generateDocumentPDF(documentType, documentData, options);

  if (!result.success || !result.blob) {
    throw new Error(result.error || 'Failed to generate PDF');
  }

  // Create download link
  const url = URL.createObjectURL(result.blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = options?.customFileName || result.fileName;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Upload PDF to Supabase Storage
 * 
 * Use case: Flow wizard completion - save PDF for client access
 */
export async function uploadPDFToStorage(
  documentType: DocumentType,
  documentData: any,
  supabase: any,
  options?: {
    clientSignature?: string;
    clientSignatureDate?: string;
    consultantSignature?: string;
    storagePath?: string; // e.g., "flows/flow-123/sow.pdf"
  }
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const result = await generateDocumentPDF(documentType, documentData, options);

    if (!result.success || !result.blob) {
      return {
        success: false,
        error: result.error || 'Failed to generate PDF',
      };
    }

    // Convert blob to array buffer for upload
    const arrayBuffer = await result.blob.arrayBuffer();

    // Determine storage path
    const storagePath = options?.storagePath || `pdfs/${Date.now()}-${result.fileName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('make-a89809a8-documents')
      .upload(storagePath, arrayBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      return {
        success: false,
        error: uploadError.message,
      };
    }

    // Get signed URL (valid for 1 hour by default)
    const { data: urlData, error: urlError } = await supabase.storage
      .from('make-a89809a8-documents')
      .createSignedUrl(storagePath, 3600);

    if (urlError) {
      return {
        success: false,
        error: urlError.message,
      };
    }

    return {
      success: true,
      url: urlData.signedUrl,
    };

  } catch (error) {
    console.error('PDF upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Generate PDF for email attachment
 * 
 * Use case: Send PDF to client via email after flow completion
 */
export async function generatePDFForEmail(
  documentType: DocumentType,
  documentData: any,
  options?: {
    clientSignature?: string;
    clientSignatureDate?: string;
    consultantSignature?: string;
  }
): Promise<{ success: boolean; blob?: Blob; fileName?: string; error?: string }> {
  const result = await generateDocumentPDF(documentType, documentData, options);

  if (!result.success || !result.blob) {
    return {
      success: false,
      error: result.error || 'Failed to generate PDF',
    };
  }

  return {
    success: true,
    blob: result.blob,
    fileName: result.fileName,
  };
}

/**
 * Generate multiple PDFs at once
 * 
 * Use case: Flow completion generates SOW + Invoice + Licensing Agreement
 */
export async function generateMultiplePDFs(
  documents: Array<{
    type: DocumentType;
    data: any;
    options?: {
      clientSignature?: string;
      clientSignatureDate?: string;
      consultantSignature?: string;
    };
  }>
): Promise<Array<PDFGenerationResult>> {
  const results = await Promise.all(
    documents.map(doc => generateDocumentPDF(doc.type, doc.data, doc.options))
  );

  return results;
}