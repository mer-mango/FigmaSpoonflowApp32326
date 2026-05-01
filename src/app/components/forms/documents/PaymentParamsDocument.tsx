import React from 'react';
import { Button } from '../ui/button';
import { Edit, CreditCard, Download } from 'lucide-react';
import { DocumentFooter } from '../shared/DocumentFooter';
import { RefinedHeader } from '../shared/RefinedHeader';
import { PrintLogo } from '../shared/PrintLogo';
import { exportToPDF } from '../utils/pdfExport';

interface PaymentParamsDocumentProps {
  documentData: any;
  onEdit?: () => void;
  onBack?: () => void;
}

export function PaymentParamsDocument({ documentData, onEdit, onBack }: PaymentParamsDocumentProps) {
  const {
    agreementTitle = '',
    agreementDate = '',
    projectName = '',
    clientName = '',
    totalProjectValue = 0,
    milestones = [],
    paymentMethods = [],
    paymentTerms = '',
    cancellationPolicy = '',
    additionalNotes = ''
  } = documentData || {};

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Edit Button */}
      <RefinedHeader onEdit={onEdit} onBack={onBack} showBackButton={!!onBack} />

      {/* Document Content */}
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Print-only Logo */}
          <PrintLogo />
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-['Lora'] text-5xl text-[#034863] mb-3">{agreementTitle || 'Payment Schedule & Terms'}</h1>
            <p className="font-['Poppins'] text-lg text-[#2f829b]">{agreementDate}</p>
          </div>

          {/* Project Summary */}
          <div className="mb-12 pb-8 border-b-2 border-[#ddecf0]">
            <h2 className="font-['Poppins'] font-semibold text-3xl text-[#034863] mb-6">Project Summary</h2>
            <div className="bg-[#f5fafb] p-6 rounded-xl space-y-3">
              <div>
                <span className="font-['Poppins'] font-medium text-base text-[#2f829b]">Project: </span>
                <span className="font-['Poppins'] text-base text-[#034863]">{projectName || '[Project Name]'}</span>
              </div>
              <div>
                <span className="font-['Poppins'] font-medium text-base text-[#2f829b]">Client: </span>
                <span className="font-['Poppins'] text-base text-[#034863]">{clientName || '[Client Name]'}</span>
              </div>
              <div>
                <span className="font-['Poppins'] font-medium text-base text-[#2f829b]">Total Project Value: </span>
                <span className="font-['Poppins'] text-xl text-[#034863]">{formatCurrency(totalProjectValue)}</span>
              </div>
            </div>
          </div>

          {/* Payment Milestones */}
          <div className="mb-12">
            <h2 className="font-['Poppins'] font-semibold text-3xl text-[#034863] mb-6">Payment Milestones</h2>
            <div className="space-y-6">
              {milestones.map((milestone: any, index: number) => (
                <div key={milestone.id} className="border-2 border-[#ddecf0] rounded-lg p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#2f829b] text-white font-['Poppins'] font-medium text-sm">
                          {index + 1}
                        </span>
                        <h3 className="font-['Poppins'] font-medium text-lg text-[#034863]">
                          {milestone.description}
                        </h3>
                      </div>
                      <p className="font-['Poppins'] text-base text-[#2f829b] ml-11">
                        Due: {milestone.dueDate}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-['Poppins'] text-2xl text-[#034863]">
                        {formatCurrency(milestone.amount)}
                      </p>
                      <p className="font-['Poppins'] text-sm text-[#2f829b]">
                        {milestone.percentage}% of total
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mb-12">
            <h2 className="font-['Poppins'] font-semibold text-3xl text-[#034863] mb-6">Payment Methods</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ACH Transfer */}
              <div className="border-2 border-[#ddecf0] rounded-lg p-6 bg-white">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#f5fafb] flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-[#2f829b]" />
                  </div>
                  <div>
                    <h3 className="font-['Poppins'] font-semibold text-lg text-[#034863] mb-2">
                      ACH Transfer
                    </h3>
                    <p className="font-['Poppins'] text-base text-[#2f829b]">
                      Direct bank transfer details available upon request
                    </p>
                  </div>
                </div>
              </div>

              {/* Credit Card */}
              <div className="border-2 border-[#ddecf0] rounded-lg p-6 bg-white">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#f5fafb] flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-[#2f829b]" />
                  </div>
                  <div>
                    <h3 className="font-['Poppins'] font-semibold text-lg text-[#034863] mb-2">
                      Credit Card
                    </h3>
                    <p className="font-['Poppins'] text-base text-[#2f829b]">
                      Secure payment link available
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Terms */}
          <div className="mb-12">
            <h2 className="font-['Poppins'] font-semibold text-3xl text-[#034863] mb-6">Payment Terms</h2>
            <p className="font-['Poppins'] text-base text-[#034863] leading-relaxed">
              {paymentTerms}
            </p>
          </div>

          {/* Cancellation Policy */}
          <div className="mb-12">
            <h2 className="font-['Poppins'] font-semibold text-3xl text-[#034863] mb-6">Cancellation Policy</h2>
            <p className="font-['Poppins'] text-base text-[#034863] leading-relaxed">
              {cancellationPolicy}
            </p>
          </div>

          {/* Additional Notes */}
          {additionalNotes && (
            <div className="mb-12">
              <h2 className="font-['Poppins'] font-semibold text-3xl text-[#034863] mb-6">Additional Notes</h2>
              <p className="font-['Poppins'] text-base text-[#034863] leading-relaxed">
                {additionalNotes}
              </p>
            </div>
          )}

          {/* Acceptance Section */}
          <div className="mt-12 pt-8 border-t border-[#ddecf0]">
            <div className="bg-[#6b2358] p-8 rounded-xl">
              <h3 className="font-['Poppins'] font-semibold text-lg text-white mb-3">Agreement Acceptance</h3>
              <p className="font-['Poppins'] text-base text-white mb-6">
                By signing below, both parties agree to the payment schedule and terms outlined in this document.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="font-['Poppins'] font-medium text-sm text-white block">Client Signature *</label>
                  <input
                    type="text"
                    placeholder="Type your full name"
                    className="w-full px-4 py-3 border-2 border-white/20 rounded-lg focus:border-white focus:ring-white font-['Poppins'] italic bg-white text-[#034863]"
                  />
                  <div className="mt-2">
                    <label className="font-['Poppins'] text-xs text-white block mb-1">Date</label>
                    <input
                      type="date"
                      className="w-full px-4 py-2 border-2 border-white/20 rounded-lg focus:border-white focus:ring-white font-['Poppins'] bg-white text-[#034863]"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="font-['Poppins'] font-medium text-sm text-white block">Empower Health Strategies</label>
                  <input
                    type="text"
                    value="Meredith Mangold, CPXP"
                    readOnly
                    className="w-full px-4 py-3 border-2 border-white/20 rounded-lg font-['Poppins'] italic bg-white/10 text-white cursor-not-allowed"
                  />
                  <div className="mt-2">
                    <label className="font-['Poppins'] text-xs text-white block mb-1">Date</label>
                    <input
                      type="date"
                      className="w-full px-4 py-2 border-2 border-white/20 rounded-lg focus:border-white focus:ring-white font-['Poppins'] bg-white text-[#034863]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <DocumentFooter />
        </div>
      </div>
    </div>
  );
}