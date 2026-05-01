import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { Button } from '../ui/button';
import { Download, Eye, FileText, Zap, CheckCircle2 } from 'lucide-react';
import { SOWSingleOptionPDF } from './SOW_SingleOption_PDF';
import { exportToPDF } from '../utils/pdfExport';

/**
 * Comparison Demo Component
 * 
 * This component demonstrates the difference between:
 * 1. Current approach: HTML → Print CSS → PDF conversion
 * 2. New approach: @react-pdf/renderer → Native PDF
 * 
 * Use this to see the benefits side-by-side.
 */

interface ComparisonDemoProps {
  documentData: any;
  clientSignature?: string;
  clientSignatureDate?: string;
  consultantSignature?: string;
}

export function ComparisonDemo({ 
  documentData,
  clientSignature,
  clientSignatureDate,
  consultantSignature
}: ComparisonDemoProps) {
  const [isGeneratingOld, setIsGeneratingOld] = React.useState(false);
  const [isGeneratingNew, setIsGeneratingNew] = React.useState(false);

  // Old method: HTML to PDF
  const generateOldWay = async () => {
    setIsGeneratingOld(true);
    try {
      await exportToPDF('Scope-of-Work-OLD');
      console.log('📄 Old method: HTML converted to PDF');
    } catch (error) {
      console.error('❌ Old method failed:', error);
    } finally {
      setIsGeneratingOld(false);
    }
  };

  // New method: @react-pdf/renderer
  const generateNewWay = async () => {
    setIsGeneratingNew(true);
    try {
      const blob = await pdf(
        <SOWSingleOptionPDF 
          documentData={documentData}
          clientSignature={clientSignature}
          clientSignatureDate={clientSignatureDate}
          consultantSignature={consultantSignature}
        />
      ).toBlob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Scope-of-Work-NEW.pdf';
      link.click();
      URL.revokeObjectURL(url);
      
      console.log('✨ New method: Native PDF generated');
      console.log('   File size:', Math.round(blob.size / 1024), 'KB');
    } catch (error) {
      console.error('❌ New method failed:', error);
    } finally {
      setIsGeneratingNew(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8 bg-white rounded-xl border-2 border-[#ddecf0]">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="font-['Lora'] text-4xl text-[#034863] mb-3">PDF Generation Comparison</h2>
        <p className="font-['Poppins'] text-lg text-[#2f829b]">
          See the difference between HTML-to-PDF and native PDF generation
        </p>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Current Method */}
        <div className="border-2 border-[#034863]/20 rounded-lg p-6 bg-[#f5fafb]/30">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-6 h-6 text-[#034863]/60" />
            <h3 className="font-['Poppins'] font-medium text-xl text-[#034863]">Current Method</h3>
          </div>
          
          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-2">
              <span className="text-[#034863]/60 mt-1">→</span>
              <p className="font-['Poppins'] text-sm text-[#034863]/80">Renders HTML in browser</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#034863]/60 mt-1">→</span>
              <p className="font-['Poppins'] text-sm text-[#034863]/80">Applies print CSS styles</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#034863]/60 mt-1">→</span>
              <p className="font-['Poppins'] text-sm text-[#034863]/80">Browser converts to PDF</p>
            </div>
          </div>

          <div className="bg-white/60 rounded-lg p-4 mb-4 space-y-2">
            <p className="font-['Poppins'] text-xs text-[#034863]/60">Issues:</p>
            <ul className="space-y-1 text-xs text-[#034863]/80 list-disc list-inside">
              <li>Inconsistent margins across browsers</li>
              <li>Print CSS can be unpredictable</li>
              <li>Font rendering varies</li>
              <li>Page breaks may split content oddly</li>
              <li>Larger file sizes</li>
            </ul>
          </div>

          <Button
            onClick={generateOldWay}
            disabled={isGeneratingOld}
            variant="outline"
            className="w-full border-2 border-[#034863] text-[#034863] hover:bg-[#034863]/10 font-['Poppins'] rounded-lg py-3"
          >
            <Download className="w-4 h-4 mr-2" />
            {isGeneratingOld ? 'Generating...' : 'Download (Old Method)'}
          </Button>
        </div>

        {/* New Method */}
        <div className="border-2 border-[#2f829b] rounded-lg p-6 bg-gradient-to-br from-[#2f829b]/5 to-[#6b2358]/5">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-6 h-6 text-[#2f829b]" />
            <h3 className="font-['Poppins'] font-medium text-xl text-[#2f829b]">@react-pdf/renderer</h3>
          </div>
          
          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-2">
              <span className="text-[#2f829b] mt-1">→</span>
              <p className="font-['Poppins'] text-sm text-[#034863]">React components define structure</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#2f829b] mt-1">→</span>
              <p className="font-['Poppins'] text-sm text-[#034863]">Native PDF generation library</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#2f829b] mt-1">→</span>
              <p className="font-['Poppins'] text-sm text-[#034863]">Direct PDF binary creation</p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 mb-4 space-y-2">
            <p className="font-['Poppins'] text-xs text-[#2f829b] font-medium">Benefits:</p>
            <ul className="space-y-1 text-xs text-[#034863] list-none space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3 h-3 text-[#2f829b] mt-0.5 flex-shrink-0" />
                <span>Perfect 0.75" margins every time</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3 h-3 text-[#2f829b] mt-0.5 flex-shrink-0" />
                <span>Consistent across all platforms</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3 h-3 text-[#2f829b] mt-0.5 flex-shrink-0" />
                <span>Professional PDF typography</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3 h-3 text-[#2f829b] mt-0.5 flex-shrink-0" />
                <span>Controlled page breaks</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3 h-3 text-[#2f829b] mt-0.5 flex-shrink-0" />
                <span>Smaller file sizes (50-200KB)</span>
              </li>
            </ul>
          </div>

          <Button
            onClick={generateNewWay}
            disabled={isGeneratingNew}
            className="w-full bg-[#2f829b] hover:bg-[#2f829b]/90 text-white font-['Poppins'] rounded-lg py-3"
          >
            <Download className="w-4 h-4 mr-2" />
            {isGeneratingNew ? 'Generating...' : 'Download (New Method)'}
          </Button>
        </div>
      </div>

      {/* Key Points */}
      <div className="bg-[#f5fafb] border-2 border-[#ddecf0] rounded-lg p-6">
        <h4 className="font-['Poppins'] font-medium text-lg text-[#034863] mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5 text-[#2f829b]" />
          Important: Your Data Stays the Same
        </h4>
        <div className="space-y-3 font-['Poppins'] text-sm text-[#034863]/80">
          <p>
            Both methods use <strong>the exact same data object</strong>. The only difference is how the PDF is generated:
          </p>
          <div className="bg-white rounded-lg p-4 font-mono text-xs">
            <div className="text-[#034863]/60 mb-2">// Your data (unchanged)</div>
            <div className="text-[#2f829b]">const documentData = {'{'}</div>
            <div className="ml-4 text-[#034863]">projectOptions: [{'{'} title, subtitle, ... {'}'}],</div>
            <div className="ml-4 text-[#034863]">enabledSections: {'{'} ... {'}'},</div>
            <div className="text-[#2f829b]">{'}'}</div>
            <div className="mt-3 text-[#034863]/60">// Old: HTML component uses data</div>
            <div className="text-[#034863]">&lt;SOWSingleOption documentData={'{'}data{'}'} /&gt;</div>
            <div className="mt-2 text-[#034863]/60">// New: PDF component uses same data</div>
            <div className="text-[#2f829b]">&lt;SOWSingleOptionPDF documentData={'{'}data{'}'} /&gt;</div>
          </div>
          <p className="mt-3">
            ✅ Template Editor still works<br />
            ✅ Conditional sections still work<br />
            ✅ Dynamic content still works<br />
            ✅ All your existing logic still works
          </p>
        </div>
      </div>

      {/* Next Steps */}
      <div className="mt-6 p-4 bg-[#6b2358]/5 border border-[#6b2358]/20 rounded-lg">
        <p className="font-['Poppins'] text-sm text-[#034863]">
          <strong className="text-[#6b2358]">Recommendation:</strong> Try downloading both PDFs and compare them. 
          The new method produces smaller, more professional PDFs with perfect margins.
        </p>
      </div>
    </div>
  );
}
