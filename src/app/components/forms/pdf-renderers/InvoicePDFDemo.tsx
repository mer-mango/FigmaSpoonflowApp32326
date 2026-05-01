import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { Button } from '../ui/button';
import { Download, FileText } from 'lucide-react';
import { InvoicePDF } from './Invoice_PDF';

/**
 * Invoice PDF Demo
 * 
 * Test the Invoice PDF renderer with sample data
 */

const sampleInvoiceData = {
  invoiceNumber: 'INV-2024-001',
  date: 'December 26, 2024',
  dueDate: 'January 25, 2025',
  clientName: 'Memorial Healthcare System',
  clientContact: 'Sarah Johnson, Director of Patient Experience',
  clientEmail: 'sarah.johnson@memorialhealthcare.com',
  clientPhone: '(555) 123-4567',
  clientAddress: '123 Healthcare Plaza, Chicago, IL 60601',
  lineItems: [
    {
      id: '1',
      description: 'Patient Experience Assessment & Strategic Planning',
      quantity: 1,
      unitPrice: 8500.00,
      amount: 8500.00,
    },
    {
      id: '2',
      description: 'Workshop Facilitation - Leadership Alignment Session',
      quantity: 2,
      unitPrice: 3500.00,
      amount: 7000.00,
    },
    {
      id: '3',
      description: 'Custom Training Materials Development',
      quantity: 1,
      unitPrice: 2500.00,
      amount: 2500.00,
    },
  ],
  subtotal: 18000.00,
  taxRate: 0,
  taxAmount: 0,
  total: 18000.00,
  notes: 'Thank you for partnering with Empower Health Strategies. We look forward to supporting your patient experience transformation journey.',
  paymentTerms: 'Payment is due within 30 days of invoice date. Late payments may be subject to a 1.5% monthly finance charge. Please reference the invoice number with your payment.',
};

export function InvoicePDFDemo() {
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [pdfKey, setPdfKey] = React.useState(0); // Cache buster

  const generateInvoicePDF = async () => {
    setIsGenerating(true);
    try {
      // Force re-render of PDF component with new key
      setPdfKey(prev => prev + 1);
      
      const blob = await pdf(<InvoicePDF key={pdfKey} documentData={sampleInvoiceData} />).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice-${sampleInvoiceData.invoiceNumber}.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      console.log('✅ Invoice PDF generated successfully!');
      console.log('📊 File size:', Math.round(blob.size / 1024), 'KB');
    } catch (error) {
      console.error('❌ PDF generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-['Lora'] text-5xl text-[#034863] mb-4">Invoice PDF Test</h1>
        <p className="font-['Poppins'] text-lg text-[#2f829b]">
          Test the new Invoice PDF renderer with sample data
        </p>
      </div>

      {/* Invoice Preview Card */}
      <div className="bg-white border-2 border-[#ddecf0] rounded-lg p-8 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-8 h-8 text-[#2f829b]" />
          <h2 className="font-['Lora'] text-3xl text-[#034863]">Sample Invoice</h2>
        </div>

        <div className="space-y-4 font-['Poppins']">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-[#2f829b] font-medium">Invoice Number</p>
              <p className="text-lg text-[#034863]">{sampleInvoiceData.invoiceNumber}</p>
            </div>
            <div>
              <p className="text-sm text-[#2f829b] font-medium">Date</p>
              <p className="text-lg text-[#034863]">{sampleInvoiceData.date}</p>
            </div>
          </div>

          <div className="border-t border-[#ddecf0] pt-4">
            <p className="text-sm text-[#2f829b] font-medium mb-2">Bill To</p>
            <p className="text-lg text-[#034863] font-medium">{sampleInvoiceData.clientName}</p>
            <p className="text-sm text-[#034863]">{sampleInvoiceData.clientContact}</p>
          </div>

          <div className="border-t border-[#ddecf0] pt-4">
            <p className="text-sm text-[#2f829b] font-medium mb-3">Line Items</p>
            {sampleInvoiceData.lineItems.map((item) => (
              <div key={item.id} className="flex justify-between items-start mb-2">
                <p className="text-sm text-[#034863] flex-1">{item.description}</p>
                <p className="text-sm text-[#034863] font-medium ml-4">
                  ${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t-2 border-[#6b2358] pt-4">
            <div className="flex justify-between items-center">
              <p className="text-xl text-[#6b2358] font-medium">Total Due</p>
              <p className="text-2xl text-[#6b2358] font-medium">
                ${sampleInvoiceData.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Download Button */}
      <div className="flex justify-center">
        <Button
          onClick={generateInvoicePDF}
          disabled={isGenerating}
          className="bg-[#6b2358] hover:bg-[#6b2358]/90 text-white font-['Poppins'] text-lg rounded-lg px-8 py-4"
        >
          <Download className="w-5 h-5 mr-2" />
          {isGenerating ? 'Generating PDF...' : 'Download Invoice PDF'}
        </Button>
      </div>

      {/* Info */}
      <div className="mt-8 p-6 bg-[#f5fafb] border-2 border-[#ddecf0] rounded-lg">
        <h3 className="font-['Poppins'] font-medium text-lg text-[#034863] mb-3">
          What to Check:
        </h3>
        <ul className="font-['Poppins'] text-sm text-[#034863] space-y-2">
          <li>✓ Logo and branding (Empower Health Strategies header)</li>
          <li>✓ Lora font for headings, Poppins for body text</li>
          <li>✓ Brand colors (#2f829b, #034863, #6b2358)</li>
          <li>✓ Perfect 0.75-inch margins on all sides</li>
          <li>✓ Clean table layout for line items</li>
          <li>✓ Professional totals section</li>
          <li>✓ Payment methods and terms sections</li>
          <li>✓ File size (should be 50-150 KB)</li>
        </ul>
      </div>
    </div>
  );
}