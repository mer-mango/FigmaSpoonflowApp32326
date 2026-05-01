import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { Button } from '../ui/button';
import { Download, FileDown } from 'lucide-react';
import { SOWSingleOptionPDF } from './SOW_SingleOption_PDF';
import { LicensingPDF } from './Licensing_PDF';
import { PreConsultGeneralPDF } from './PreConsultGeneral_PDF';

/**
 * PDF Generator Demo Component
 * 
 * This demonstrates how to use @react-pdf/renderer to generate actual PDFs.
 * 
 * KEY CONCEPTS:
 * 1. The PDF components (SOWSingleOptionPDF, etc.) define the PDF structure
 * 2. The pdf() function from @react-pdf/renderer converts them to actual PDFs
 * 3. You can download, upload to storage, or attach to emails
 */

interface PDFGeneratorDemoProps {
  documentType: 'sow' | 'licensing' | 'preconsult';
  documentData: any;
  clientSignature?: string;
  clientSignatureDate?: string;
  consultantSignature?: string;
}

export function PDFGeneratorDemo({ 
  documentType, 
  documentData,
  clientSignature,
  clientSignatureDate,
  consultantSignature
}: PDFGeneratorDemoProps) {
  const [isGenerating, setIsGenerating] = React.useState(false);

  /**
   * Generate and download PDF
   * This is the core function that shows how to use @react-pdf/renderer
   */
  const generateAndDownloadPDF = async () => {
    setIsGenerating(true);
    
    try {
      let pdfComponent;
      let filename;

      // Select the appropriate PDF component based on document type
      switch (documentType) {
        case 'sow':
          pdfComponent = (
            <SOWSingleOptionPDF 
              documentData={documentData}
              clientSignature={clientSignature}
              clientSignatureDate={clientSignatureDate}
              consultantSignature={consultantSignature}
            />
          );
          filename = 'Scope-of-Work.pdf';
          break;
        
        case 'licensing':
          pdfComponent = <LicensingPDF documentData={documentData} />;
          filename = 'Licensing-Agreement.pdf';
          break;
        
        case 'preconsult':
          pdfComponent = <PreConsultGeneralPDF documentData={documentData} />;
          filename = 'Pre-Consult-Questionnaire.pdf';
          break;
        
        default:
          throw new Error('Unknown document type');
      }

      // Generate the PDF blob
      const blob = await pdf(pdfComponent).toBlob();
      
      // Create download link and trigger download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      
      // Cleanup
      URL.revokeObjectURL(url);
      
      console.log('✅ PDF generated successfully:', filename);
    } catch (error) {
      console.error('❌ Error generating PDF:', error);
      alert('Failed to generate PDF. Check console for details.');
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Alternative: Upload to Supabase Storage
   * This shows how you could save the PDF to your backend instead of downloading
   */
  const uploadPDFToStorage = async () => {
    setIsGenerating(true);
    
    try {
      let pdfComponent;
      let filename;

      // Select component (same as above)
      switch (documentType) {
        case 'sow':
          pdfComponent = (
            <SOWSingleOptionPDF 
              documentData={documentData}
              clientSignature={clientSignature}
              clientSignatureDate={clientSignatureDate}
              consultantSignature={consultantSignature}
            />
          );
          filename = `sow-${Date.now()}.pdf`;
          break;
        
        case 'licensing':
          pdfComponent = <LicensingPDF documentData={documentData} />;
          filename = `licensing-${Date.now()}.pdf`;
          break;
        
        case 'preconsult':
          pdfComponent = <PreConsultGeneralPDF documentData={documentData} />;
          filename = `preconsult-${Date.now()}.pdf`;
          break;
        
        default:
          throw new Error('Unknown document type');
      }

      // Generate PDF blob
      const blob = await pdf(pdfComponent).toBlob();
      
      // Convert blob to array buffer for upload
      const arrayBuffer = await blob.arrayBuffer();
      
      // TODO: Upload to Supabase Storage
      // const { data, error } = await supabase.storage
      //   .from('make-a89809a8-documents')
      //   .upload(`pdfs/${filename}`, arrayBuffer, {
      //     contentType: 'application/pdf'
      //   });
      
      console.log('📤 PDF ready to upload:', filename, 'Size:', blob.size, 'bytes');
      alert('Upload functionality would go here. Check console for details.');
      
    } catch (error) {
      console.error('❌ Error generating PDF for upload:', error);
      alert('Failed to generate PDF. Check console for details.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4 p-6 bg-[#f5fafb] border-2 border-[#ddecf0] rounded-lg">
      <div className="space-y-2">
        <h3 className="font-['Poppins'] font-medium text-[#034863] text-lg">
          PDF Generation Options
        </h3>
        <p className="font-['Poppins'] text-sm text-[#034863]/70">
          Generate a professional PDF using @react-pdf/renderer
        </p>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={generateAndDownloadPDF}
          disabled={isGenerating}
          className="bg-[#2f829b] hover:bg-[#2f829b]/90 text-white font-['Poppins'] rounded-lg px-6 py-2 flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          {isGenerating ? 'Generating...' : 'Download PDF'}
        </Button>

        <Button
          onClick={uploadPDFToStorage}
          disabled={isGenerating}
          variant="outline"
          className="border-2 border-[#2f829b] text-[#2f829b] hover:bg-[#2f829b]/10 font-['Poppins'] rounded-lg px-6 py-2 flex items-center gap-2"
        >
          <FileDown className="w-4 h-4" />
          {isGenerating ? 'Generating...' : 'Save to Storage'}
        </Button>
      </div>

      {/* Technical notes */}
      <div className="mt-6 pt-4 border-t border-[#ddecf0]">
        <details className="text-xs text-[#034863]/60">
          <summary className="cursor-pointer font-medium mb-2">Technical Implementation Notes</summary>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>PDF components are in <code>/components/forms/pdf-renderers/</code></li>
            <li>Uses <code>@react-pdf/renderer</code> for native PDF generation</li>
            <li>No HTML-to-PDF conversion = no print CSS issues</li>
            <li>Perfect 0.75" margins via StyleSheet</li>
            <li>Can download, upload to storage, or attach to emails</li>
            <li>Same data object as your current documents</li>
            <li>Conditional sections work perfectly with React logic</li>
          </ul>
        </details>
      </div>
    </div>
  );
}
