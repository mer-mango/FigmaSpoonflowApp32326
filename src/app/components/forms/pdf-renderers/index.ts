/**
 * PDF Renderer Components
 * 
 * Native PDF generation using @react-pdf/renderer
 * 
 * Usage:
 *   import { SOWSingleOptionPDF, generatePDF } from './pdf-renderers';
 */

// PDF Component Exports
export { SOWSingleOptionPDF } from './SOW_SingleOption_PDF';
export { LicensingPDF } from './Licensing_PDF';
export { PreConsultGeneralPDF } from './PreConsultGeneral_PDF';
export { InvoicePDF } from './Invoice_PDF';

// Demo Components
export { PDFGeneratorDemo } from './PDFGeneratorDemo';
export { ComparisonDemo } from './ComparisonDemo';

// Utility Functions
import { pdf } from '@react-pdf/renderer';

/**
 * Helper function to generate and download a PDF
 * 
 * @param component - The PDF component to render
 * @param filename - The filename for the downloaded PDF
 * 
 * @example
 * ```tsx
 * import { generatePDF, SOWSingleOptionPDF } from './pdf-renderers';
 * 
 * await generatePDF(
 *   <SOWSingleOptionPDF documentData={data} />,
 *   'scope-of-work.pdf'
 * );
 * ```
 */
export async function generatePDF(component: React.ReactElement, filename: string): Promise<void> {
  const blob = await pdf(component).toBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Helper function to generate a PDF blob (for uploading to storage)
 * 
 * @param component - The PDF component to render
 * @returns Promise<Blob> - The generated PDF as a Blob
 * 
 * @example
 * ```tsx
 * import { generatePDFBlob, SOWSingleOptionPDF } from './pdf-renderers';
 * 
 * const blob = await generatePDFBlob(
 *   <SOWSingleOptionPDF documentData={data} />
 * );
 * 
 * // Upload to Supabase Storage
 * await supabase.storage
 *   .from('documents')
 *   .upload('file.pdf', blob);
 * ```
 */
export async function generatePDFBlob(component: React.ReactElement): Promise<Blob> {
  return await pdf(component).toBlob();
}

/**
 * Helper function to generate a PDF as ArrayBuffer (for server-side processing)
 * 
 * @param component - The PDF component to render
 * @returns Promise<ArrayBuffer> - The generated PDF as an ArrayBuffer
 */
export async function generatePDFBuffer(component: React.ReactElement): Promise<ArrayBuffer> {
  const blob = await pdf(component).toBlob();
  return await blob.arrayBuffer();
}