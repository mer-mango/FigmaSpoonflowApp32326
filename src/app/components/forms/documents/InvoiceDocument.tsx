import React from 'react';
import { Button } from '../ui/button';
import { CheckCircle2, FileDown, CreditCard, ExternalLink, Edit3, Download, ArrowRight } from 'lucide-react';
import { RefinedHeader } from '../shared/RefinedHeader';
import { DocumentFooter } from '../shared/DocumentFooter';
import { PrintLogo } from '../shared/PrintLogo';
import { exportToPDF } from '../utils/pdfExport';

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  clientName: string;
  clientContact: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  lineItems: LineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  notes?: string;
  paymentTerms?: string;
}

interface InvoiceDocumentProps {
  documentData: InvoiceData;
  onEdit?: () => void;
  onBack?: () => void;
}

export function InvoiceDocument({ documentData, onEdit, onBack }: InvoiceDocumentProps) {
  const [showSignature, setShowSignature] = React.useState(false);
  const [showEditRequest, setShowEditRequest] = React.useState(false);
  const [clientSignature, setClientSignature] = React.useState('');
  const [clientSignatureDate, setClientSignatureDate] = React.useState('');
  const [editRequest, setEditRequest] = React.useState('');
  const [status, setStatus] = React.useState<'pending' | 'approved' | 'edit-requested'>('pending');
  const consultantSignature = 'Meredith Mangold, CPXP';
  
  // Format currency with commas
  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };
  
  // Provide default values to prevent undefined errors
  const invoiceData = {
    invoiceNumber: documentData?.invoiceNumber || '',
    date: documentData?.date || '',
    dueDate: documentData?.dueDate || '',
    clientName: documentData?.clientName || '',
    clientContact: documentData?.clientContact || '',
    clientEmail: documentData?.clientEmail || '',
    clientPhone: documentData?.clientPhone || '',
    clientAddress: documentData?.clientAddress || '',
    lineItems: documentData?.lineItems || [],
    subtotal: documentData?.subtotal || 0,
    taxRate: documentData?.taxRate || 0,
    taxAmount: documentData?.taxAmount || 0,
    total: documentData?.total || 0,
    notes: documentData?.notes || '',
    paymentTerms: documentData?.paymentTerms || ''
  };

  const handleApprove = () => {
    setShowSignature(true);
  };

  const handleSign = () => {
    setStatus('approved');
    setShowSignature(false);
  };

  const handleRequestEdits = () => {
    setShowEditRequest(true);
  };

  const handleSubmitEdits = () => {
    setStatus('edit-requested');
    setShowEditRequest(false);
    // In a real app, this would send the edit request to the consultant
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Full-width Header with Logo */}
      <RefinedHeader onEdit={onEdit} onBack={onBack} showBackButton={!!onBack} />

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Print-only Logo */}
          <PrintLogo />
          
          {/* Document Header */}
          <div>
            <div className="flex items-start justify-between mb-8">
              <div>
                <h1 className="font-['Lora'] text-2xl text-[#034863] mb-2 pt-[0px] pr-[0px] pb-[6px] pl-[0px]">Invoice</h1>
                <p className="font-['Poppins'] text-base text-black">INVOICE #{invoiceData.invoiceNumber}</p>
              </div>
              <div className="flex gap-5">
                <div className="px-6 py-3 bg-[#f5fafb] border-2 border-[#ddecf0] rounded-lg">
                  <p className="font-['Poppins'] font-medium text-sm uppercase tracking-wide text-[#2f829b] mb-1 text-[16px]">Invoice Date</p>
                  <p className="font-['Poppins'] text-xl text-[rgb(3,72,99)]">{invoiceData.date}</p>
                </div>
                <div className="px-6 py-3 bg-[#6b2358] rounded-lg">
                  <p className="font-['Poppins'] font-medium text-sm uppercase tracking-wide text-white/90 mb-1 text-[16px]">Due Date</p>
                  <p className="font-['Poppins'] text-xl text-white font-medium">{invoiceData.dueDate}</p>
                </div>
              </div>
            </div>

            {/* Two Column Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <p className="font-['Poppins'] font-medium text-base uppercase tracking-wide text-[#2f829b] mb-4 text-[18px]">Bill To</p>
                <div className="space-y-1 font-['Poppins'] text-black">
                  <p className="font-['Lora'] text-2xl text-[#034863] mb-2">{invoiceData.clientName}</p>
                  <p className="text-base text-[18px]">{invoiceData.clientContact}</p>
                  <p className="text-base text-[#2f829b] text-[18px]">{invoiceData.clientEmail}</p>
                </div>
              </div>
              <div>
                <p className="font-['Poppins'] font-medium text-base uppercase tracking-wide text-[#2f829b] mb-4 text-[18px]">From</p>
                <div className="space-y-1 font-['Poppins'] text-black">
                  <p className="font-['Lora'] text-2xl text-[#034863] mb-2">Empower Health Strategies</p>
                  <p className="text-base text-[18px]">Meredith Mangold, CPXP, Founder</p>
                  <p className="text-base text-[#2f829b] text-[18px]">meredith@empowerhealthstrategies.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Items Table */}
          <div className="border-t border-[#ddecf0] pt-8 mt-6">
            <h2 className="font-['Lora'] text-4xl text-[#034863] mb-8">Services</h2>
            
            <div className="border-2 border-[#ddecf0] rounded-lg overflow-hidden">
              {/* Table Header */}
              <div className="bg-[#f5fafb] grid grid-cols-12 gap-4 p-4 border-b-2 border-[#ddecf0]">
                <div className="col-span-6">
                  <p className="font-['Poppins'] font-medium text-sm uppercase tracking-wide text-[#034863] text-[17px]">Description</p>
                </div>
                <div className="col-span-2 text-center">
                  <p className="font-['Poppins'] font-medium text-sm uppercase tracking-wide text-[#034863] text-[17px]">Quantity</p>
                </div>
                <div className="col-span-2 text-right">
                  <p className="font-['Poppins'] font-medium text-sm uppercase tracking-wide text-[#034863] text-[17px]">Rate</p>
                </div>
                <div className="col-span-2 text-right">
                  <p className="font-['Poppins'] font-medium text-sm uppercase tracking-wide text-[#034863] text-[17px]">Amount</p>
                </div>
              </div>

              {/* Table Rows */}
              {invoiceData.lineItems.map((item, index) => (
                <div 
                  key={item.id} 
                  className={`grid grid-cols-12 gap-4 p-4 ${
                    index !== invoiceData.lineItems.length - 1 ? 'border-b border-[#ddecf0]' : ''
                  }`}
                >
                  <div className="col-span-6">
                    <p className="font-['Poppins'] text-lg text-[#034863]">{item.description}</p>
                  </div>
                  <div className="col-span-2 text-center">
                    <p className="font-['Poppins'] text-lg text-[#034863]">{item.quantity}</p>
                  </div>
                  <div className="col-span-2 text-right">
                    <p className="font-['Poppins'] text-lg text-[#034863]">
                      ${formatCurrency(item.unitPrice)}
                    </p>
                  </div>
                  <div className="col-span-2 text-right">
                    <p className="font-['Poppins'] text-lg font-medium text-[#034863]">
                      ${formatCurrency(item.amount)}
                    </p>
                  </div>
                </div>
              ))}

              {/* Totals Section */}
              <div className="bg-[#f5fafb] border-t-2 border-[#ddecf0]">
                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-center pt-[0px] pr-[0px] pb-[5px] pl-[0px]">
                    <p className="font-['Poppins'] text-xl text-[#034863]">Subtotal:</p>
                    <p className="font-['Poppins'] text-xl text-[#034863]">
                      ${formatCurrency(invoiceData.subtotal)}
                    </p>
                  </div>
                  <div className="pt-[20px] border-t-2 border-[#6b2358] flex justify-between items-center pr-[0px] pb-[0px] pl-[0px]">
                    <p className="font-['Poppins'] text-3xl font-medium text-[#6b2358] text-[20px]">Total Due:</p>
                    <p className="font-['Poppins'] text-4xl font-medium text-[#6b2358] text-[20px]">
                      ${formatCurrency(invoiceData.total)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods & Terms - Combined Section */}
          <div className="border-t border-[#ddecf0] pt-12">
            <h2 className="font-['Lora'] text-4xl text-[#034863] mb-6">Payment Methods & Terms</h2>
            
            {/* Payment Terms */}
            {invoiceData.paymentTerms && (
              <div className="bg-[#f5fafb] p-6 rounded-lg border-2 border-[#ddecf0] mb-6">
                <p className="font-['Poppins'] text-lg text-[#034863] leading-relaxed whitespace-pre-line">
                  {invoiceData.paymentTerms}
                </p>
              </div>
            )}
          </div>

          {/* Notes */}
          {invoiceData.notes && (
            <div className="border-t border-[#ddecf0] pt-12">
              <h2 className="font-['Lora'] text-4xl text-[#034863] mb-6">Notes</h2>
              <p className="font-['Poppins'] text-lg text-[#034863] leading-relaxed whitespace-pre-line">
                {invoiceData.notes}
              </p>
            </div>
          )}

          {/* Approval & Signatures Section */}
          <div id="approval-section" className="border-t border-[#ddecf0] pt-12">
            <div className="p-10 bg-[#6b2358] rounded-lg">
              <div className="flex items-center gap-3 mb-6">
                <CreditCard className="w-7 h-7 text-white" />
                <h2 className="font-['Lora'] text-5xl text-white text-[36px]">Approval & Signatures</h2>
              </div>
              
              {!showSignature && status === 'pending' && (
                <div className="space-y-6">
                  <p className="font-['Poppins'] text-white text-xl">
                    Please review the invoice above. You may approve and sign to proceed to payment.
                  </p>
                  <Button
                    onClick={handleApprove}
                    className="w-full bg-white text-[#6b2358] hover:bg-white/80 font-['Poppins'] text-xl rounded-lg px-8 py-6"
                  >
                    <CheckCircle2 className="w-6 h-6 mr-2" />
                    Approve & Pay
                  </Button>
                </div>
              )}

              {showSignature && status === 'pending' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="font-['Poppins'] font-medium text-white text-xl">Client Signature *</label>
                      <input
                        type="text"
                        value={clientSignature}
                        onChange={(e) => setClientSignature(e.target.value)}
                        placeholder="Type your full name"
                        className="w-full px-4 py-2 border-2 border-white/20 rounded-lg focus:border-white focus:ring-white font-['Poppins'] italic bg-white text-[#034863] text-xl"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="font-['Poppins'] font-medium text-white text-xl">Date *</label>
                      <input
                        type="date"
                        value={clientSignatureDate}
                        onChange={(e) => setClientSignatureDate(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-white/20 rounded-lg focus:border-white focus:ring-white font-['Poppins'] bg-white text-[#034863] text-xl"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="font-['Poppins'] font-medium text-white text-xl">Consultant Signature</label>
                      <div className="w-full px-4 py-2 border-2 border-white/20 rounded-lg bg-white/10 font-['Poppins'] italic text-white text-xl">
                        {consultantSignature}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="font-['Poppins'] font-medium text-white text-xl">Date</label>
                      <div className="w-full px-4 py-2 border-2 border-white/20 rounded-lg bg-white/10 font-['Poppins'] text-white text-xl">
                        {invoiceData.date}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Button
                      onClick={() => setShowSignature(false)}
                      className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#6b2358] font-['Poppins'] text-lg rounded-lg px-6 py-3 transition-colors"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSign}
                      disabled={!clientSignature.trim() || !clientSignatureDate.trim()}
                      className="bg-white text-[#6b2358] hover:bg-[#f5fafb] font-['Poppins'] text-lg rounded-lg px-6 py-3 disabled:opacity-50"
                    >
                      <CreditCard className="w-5 h-5 mr-2" />
                      Confirm & Proceed to Payment
                    </Button>
                  </div>
                </div>
              )}

              {status === 'approved' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-white/10 rounded-lg">
                      <p className="font-['Poppins'] text-base text-white/80 mb-2">Client</p>
                      <p className="font-['Poppins'] italic text-white text-2xl border-b-2 border-white pb-2">{clientSignature}</p>
                      <p className="font-['Poppins'] text-sm text-white/60 mt-2">Signed on {clientSignatureDate}</p>
                    </div>
                    <div className="p-6 bg-white/10 rounded-lg">
                      <p className="font-['Poppins'] text-base text-white/80 mb-2">Consultant</p>
                      <p className="font-['Poppins'] italic text-white text-2xl border-b-2 border-white pb-2">{consultantSignature}</p>
                      <p className="font-['Poppins'] text-sm text-white/60 mt-2">Signed on {invoiceData.date}</p>
                    </div>
                  </div>

                  {/* Payment Link Section */}
                  <div className="border-t-2 border-white/20 pt-8">
                    <div className="bg-white/10 rounded-lg p-8">
                      <div className="flex items-center gap-3 mb-4">
                        <CreditCard className="w-6 h-6 text-white" />
                        <h3 className="font-['Lora'] text-3xl text-white">Complete Payment</h3>
                      </div>
                      <p className="font-['Poppins'] text-white text-lg mb-6">
                        Your invoice has been approved and signed. Click the button below to complete your payment securely.
                      </p>
                      <div className="bg-white/5 rounded-lg p-6 mb-6">
                        <div className="flex justify-between items-center">
                          <span className="font-['Poppins'] text-white text-xl">Amount Due:</span>
                          <span className="font-['Poppins'] text-white text-3xl font-medium">${formatCurrency(invoiceData.total)}</span>
                        </div>
                      </div>
                      <Button
                        onClick={() => {
                          // In a real app, this would open the actual Stripe payment link
                          const paymentUrl = `https://buy.stripe.com/test_payment_link_${invoiceData.invoiceNumber}`;
                          window.open(paymentUrl, '_blank');
                        }}
                        className="w-full bg-white text-[#6b2358] hover:bg-white/90 font-['Poppins'] text-xl rounded-lg px-8 py-6"
                      >
                        <CreditCard className="w-6 h-6 mr-2" />
                        Pay ${formatCurrency(invoiceData.total)} Now
                        <ExternalLink className="w-5 h-5 ml-2" />
                      </Button>
                      <p className="font-['Poppins'] text-white/70 text-sm mt-4 text-center">
                        Secure payment powered by Stripe
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Actions */}
          {status === 'pending' && !showSignature && !showEditRequest && (
            <div className="flex justify-end gap-4 pt-8">
              <Button
                onClick={onEdit}
                variant="outline"
                className="border-2 border-[#034863] text-[#034863] hover:bg-[#f5fafb] font-['Poppins'] text-lg rounded-lg px-6 py-3"
              >
                <Edit3 className="w-5 h-5 mr-2" />
                Edit
              </Button>
              <Button className="bg-[#034863] hover:bg-[#034863]/90 text-white font-['Poppins'] text-lg rounded-lg px-6 py-3">
                <Download className="w-5 h-5 mr-2" />
                Download PDF
              </Button>
              {onBack && (
                <Button
                  onClick={onBack}
                  variant="outline"
                  className="border-2 border-[#034863] text-[#034863] hover:bg-[#f5fafb] font-['Poppins'] text-lg rounded-lg px-6 py-3"
                >
                  <ArrowRight className="w-5 h-5 mr-2 rotate-180" />
                  Back
                </Button>
              )}
            </div>
          )}

          {/* Footer */}
          <DocumentFooter />
        </div>
      </div>
    </div>
  );
}