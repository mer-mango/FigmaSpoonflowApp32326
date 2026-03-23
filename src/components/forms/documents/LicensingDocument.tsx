import React from 'react';
import { Button } from '../ui/button';
import { Edit, Download } from 'lucide-react';
import { DocumentFooter } from '../shared/DocumentFooter';
import { RefinedHeader } from '../shared/RefinedHeader';
import { PrintLogo } from '../shared/PrintLogo';
import { exportToPDF } from '../utils/pdfExport';

interface LicensingDocumentProps {
  documentData: any;
  onEdit?: () => void;
  onBack?: () => void;
}

export function LicensingDocument({ documentData, onEdit, onBack }: LicensingDocumentProps) {
  const {
    agreementTitle = '',
    agreementDate = '',
    licenseeName = '',
    licenseeOrganization = '',
    licenseeEmail = '',
    licenseType = '',
    licenseScope = '',
    territory = '',
    duration = '',
    licenseFee = '',
    serviceName = '',
    usageRights = [],
    restrictions = [],
    termsSections = []
  } = documentData || {};

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Edit Button */}
      <RefinedHeader onEdit={onEdit} onBack={onBack} showBackButton={!!onBack} />

      {/* Top PDF Export Button */}
      <div className="no-print pdf-exclude" data-pdf-exclude="true">
        <div className="fixed top-24 right-8 z-50">
          <Button
            onClick={() => exportToPDF('Licensing-Agreement')}
            className="bg-[#6b2358] hover:bg-[#6b2358]/90 text-white rounded-full px-6 py-2 shadow-lg flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export as PDF
          </Button>
        </div>
      </div>

      {/* Document Content */}
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Print-only Logo */}
          <PrintLogo />
          
          {/* Header */}
          <div className="mb-12">
            <h1 className="font-['Lora'] text-5xl text-[#034863] mb-3">{agreementTitle || 'Licensing Agreement & Terms'}</h1>
            <p className="font-['Poppins'] text-lg text-[#2f829b]">Effective Date: {agreementDate}</p>
          </div>

          {/* Parties */}
          <div className="mb-12 pb-8 border-b-2 border-[#ddecf0]">
            <h2 className="font-['Lora'] text-3xl text-[#034863] mb-6">Agreement Between</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-['Poppins'] font-medium text-base text-[#2f829b] mb-2">Licensor</h3>
                <p className="font-['Poppins'] text-base text-[#034863]">
                  Empower Health Strategies<br />
                  hello@empowerhealthstrategies.com
                </p>
              </div>
              <div>
                <h3 className="font-['Poppins'] font-medium text-base text-[#2f829b] mb-2">Licensee</h3>
                <p className="font-['Poppins'] text-base text-[#034863]">
                  {licenseeName || '[Licensee Name]'}<br />
                  {licenseeOrganization || '[Organization]'}<br />
                  {licenseeEmail || '[Email]'}
                </p>
              </div>
            </div>
          </div>

          {/* License Details */}
          <div className="mb-12">
            <h2 className="font-['Lora'] text-3xl text-[#034863] mb-6">License Details</h2>
            <div className="bg-[#f5fafb] p-6 rounded-xl space-y-4">
              <div>
                <span className="font-['Poppins'] font-medium text-base text-[#2f829b]">License Type: </span>
                <span className="font-['Poppins'] text-base text-[#034863]">{licenseType}</span>
              </div>
              <div>
                <span className="font-['Poppins'] font-medium text-base text-[#2f829b]">Scope: </span>
                <span className="font-['Poppins'] text-base text-[#034863]">{licenseScope}</span>
              </div>
              <div>
                <span className="font-['Poppins'] font-medium text-base text-[#2f829b]">Territory: </span>
                <span className="font-['Poppins'] text-base text-[#034863]">{territory}</span>
              </div>
              <div>
                <span className="font-['Poppins'] font-medium text-base text-[#2f829b]">Duration: </span>
                <span className="font-['Poppins'] text-base text-[#034863]">{duration}</span>
              </div>
              <div>
                <span className="font-['Poppins'] font-medium text-base text-[#2f829b]">License Fee: </span>
                <span className="font-['Poppins'] text-base text-[#034863]">{licenseFee}</span>
              </div>
              <div>
                <span className="font-['Poppins'] font-medium text-base text-[#2f829b]">Service Name: </span>
                <span className="font-['Poppins'] text-base text-[#034863]">{serviceName}</span>
              </div>
            </div>
          </div>

          {/* Usage Rights */}
          <div className="mb-12">
            <h2 className="font-['Lora'] text-3xl text-[#034863] mb-6">Usage Rights</h2>
            <div className="space-y-3">
              {usageRights.map((right: any, index: number) => (
                <div key={right.id} className="flex items-start gap-3">
                  <span className="font-['Poppins'] font-medium text-[#2f829b] min-w-[24px]">
                    {index + 1}.
                  </span>
                  <p className="font-['Poppins'] text-base text-[#034863]">{right.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Restrictions */}
          <div className="mb-12">
            <h2 className="font-['Lora'] text-3xl text-[#034863] mb-6">Restrictions</h2>
            <div className="space-y-3">
              {restrictions.map((restriction: any, index: number) => (
                <div key={restriction.id} className="flex items-start gap-3">
                  <span className="font-['Poppins'] font-medium text-[#2f829b] min-w-[24px]">
                    {index + 1}.
                  </span>
                  <p className="font-['Poppins'] text-base text-[#034863]">{restriction.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Terms & Conditions Sections */}
          {termsSections.map((section: any) => (
            <div key={section.id} className="mb-12">
              <h2 className="font-['Lora'] text-3xl text-[#034863] mb-4">{section.title}</h2>
              <p className="font-['Poppins'] text-base text-[#034863] leading-relaxed">
                {section.content}
              </p>
            </div>
          ))}

          {/* Signature Section */}
          <div className="mt-16 pt-8 border-t-2 border-[#ddecf0]">
            <div className="bg-[#6b2358] p-8 rounded-xl">
              <h3 className="font-['Lora'] text-2xl text-white mb-4 text-[30px]">Agreement Acceptance</h3>
              <p className="font-['Poppins'] text-base text-white mb-6">
                By signing below, both parties agree to the licensing terms and conditions outlined in this document.
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

          {/* Footer Note */}
          <DocumentFooter />
        </div>
      </div>
    </div>
  );
}