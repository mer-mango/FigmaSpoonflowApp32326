import React from 'react';
import { Button } from '../ui/button';
import { ArrowLeft, Edit, Download, CheckCircle2, FileDown } from 'lucide-react';
import { RefinedHeader } from '../shared/RefinedHeader';
import { DocumentFooter } from '../shared/DocumentFooter';
import { exportToPDF } from '../utils/pdfExport';

interface PXAuditIntakeDocumentProps {
  documentData: any;
  onEdit: () => void;
  onBack: () => void;
}

export function PXAuditIntakeDocument({ documentData, onEdit, onBack }: PXAuditIntakeDocumentProps) {
  const handleDownloadPDF = () => {
    exportToPDF('PX-Audit-Intake-Form');
  };

  const handleApproveAndExport = () => {
    // Future: Add approval logic here
    alert('Form approved!');
    exportToPDF('PX-Audit-Intake-Form');
  };

  const handleApprove = () => {
    // Future: Add approval logic here
    alert('Form approved!');
  };

  // Helper to format audience list
  const getAudienceList = () => {
    const audiences = [];
    if (documentData.audience?.patients) audiences.push('Patients');
    if (documentData.audience?.caregivers) audiences.push('Caregivers');
    if (documentData.audience?.clinicians) audiences.push('Clinicians');
    if (documentData.audience?.careTeams) audiences.push('Care teams / care coordinators');
    if (documentData.audience?.healthSystem) audiences.push('Health system or organization');
    if (documentData.audience?.other && documentData.audience?.otherText) {
      audiences.push(`Other: ${documentData.audience.otherText}`);
    }
    return audiences.length > 0 ? audiences : ['Not specified'];
  };

  return (
    <div className="min-h-screen bg-white">
      <RefinedHeader onEdit={onEdit} onBack={onBack} showBackButton={true} />

      {/* Top PDF Export Button */}
      <div className="py-4 px-4 sm:px-6 lg:px-8 no-print">
        <div className="max-w-5xl mx-auto flex justify-end">
          <Button
            onClick={handleDownloadPDF}
            className="bg-[#6b2358] hover:bg-[#6b2358]/90 text-white font-['Poppins'] rounded-lg px-6 py-2"
          >
            <FileDown className="w-5 h-5 mr-2" />
            Export as PDF
          </Button>
        </div>
      </div>

      {/* Document Content */}
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="font-['Lora'] text-2xl text-[#034863] mb-3">
              Patient Experience (PX) & Impact Audit
            </h1>
            <p className="font-['Poppins'] text-base text-[#034863]/60 mb-6">
              Onboarding Intake: Product Context & Access
            </p>
            
            {/* Contact Info Grid - without blue box */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base font-['Poppins'] border-b border-[#ddecf0] pb-6">
              <div>
                <span className="text-[#034863]/50">Contact Name:</span>
                <span className="ml-2 text-[#034863]">{documentData.contactName || '[Name]'}</span>
              </div>
              <div>
                <span className="text-[#034863]/50">Organization:</span>
                <span className="ml-2 text-[#034863]">{documentData.organizationName || '[Organization]'}</span>
              </div>
              <div>
                <span className="text-[#034863]/50">Email:</span>
                <span className="ml-2 text-[#034863]">{documentData.contactEmail || '[Email]'}</span>
              </div>
              <div>
                <span className="text-[#034863]/50">Product:</span>
                <span className="ml-2 text-[#034863]">{documentData.productName || '[Product]'}</span>
              </div>
            </div>
          </div>

          {/* Introduction - Light Blue Box */}
          <div className="bg-[#e3f2f7] p-6 rounded-lg mb-12">
            <p className="font-['Poppins'] text-base text-[#034863] leading-relaxed">
              Thank you for your interest in Empower Health Strategies. The questions below help me understand your context and goals so our time together can be as focused and useful as possible. This should take 5 few minutes to complete.
            </p>
          </div>

          {/* Question 1 */}
          <div className="mb-10">
            <div className="flex items-start gap-4 mb-4">
              <span className="flex-shrink-0 w-10 h-10 bg-[#2f829b] text-white rounded-full flex items-center justify-center font-['Poppins'] font-bold text-lg">
                1
              </span>
              <div className="flex-1">
                <h3 className="font-['Poppins'] font-medium text-xl text-[#034863] mb-2">
                  In your own words, what problem does your product exist to solve?
                </h3>
                <p className="text-sm text-[#034863]/60 mb-3 italic">
                  This surfaces your primary framing and assumed pain point.
                </p>
              </div>
            </div>
            <div className="ml-14">
              <p className="font-['Poppins'] text-lg text-black whitespace-pre-wrap leading-relaxed">
                {documentData.problemStatement || 'Not answered'}
              </p>
            </div>
          </div>

          {/* Question 2 */}
          <div className="mb-10">
            <div className="flex items-start gap-4 mb-4">
              <span className="flex-shrink-0 w-10 h-10 bg-[#2f829b] text-white rounded-full flex items-center justify-center font-['Poppins'] font-bold text-lg">
                2
              </span>
              <div className="flex-1">
                <h3 className="font-['Poppins'] font-medium text-xl text-[#034863] mb-2">
                  Who is this product primarily designed for today?
                </h3>
                <p className="text-sm text-[#034863]/60 mb-3 italic">
                  Select all that apply
                </p>
              </div>
            </div>
            <div className="ml-14">
              <ul className="space-y-2">
                {getAudienceList().map((audience, index) => (
                  <li key={index} className="flex items-center gap-2 font-['Poppins'] text-lg text-black">
                    <CheckCircle2 className="w-5 h-5 text-[#2f829b]" />
                    {audience}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Question 3 */}
          <div className="mb-10">
            <div className="flex items-start gap-4 mb-4">
              <span className="flex-shrink-0 w-10 h-10 bg-[#2f829b] text-white rounded-full flex items-center justify-center font-['Poppins'] font-bold text-lg">
                3
              </span>
              <div className="flex-1">
                <h3 className="font-['Poppins'] font-medium text-xl text-[#034863] mb-2">
                  How do you currently describe the value of this product to that audience?
                </h3>
                <p className="text-sm text-[#034863]/60 mb-3 italic">
                  This is your value proposition, unfiltered.
                </p>
              </div>
            </div>
            <div className="ml-14">
              <p className="font-['Poppins'] text-lg text-black whitespace-pre-wrap leading-relaxed">
                {documentData.valueProposition || 'Not answered'}
              </p>
            </div>
          </div>

          {/* Question 4 */}
          <div className="mb-10">
            <div className="flex items-start gap-4 mb-4">
              <span className="flex-shrink-0 w-10 h-10 bg-[#2f829b] text-white rounded-full flex items-center justify-center font-['Poppins'] font-bold text-lg">
                4
              </span>
              <div className="flex-1">
                <h3 className="font-['Poppins'] font-medium text-xl text-[#034863] mb-2">
                  Where do you believe this product fits into a patient's real-life health journey?
                </h3>
                <p className="text-sm text-[#034863]/60 mb-3 italic">
                  For example: before diagnosis, during treatment, between visits, during flares, long-term management, etc.
                </p>
              </div>
            </div>
            <div className="ml-14">
              <p className="font-['Poppins'] text-lg text-black whitespace-pre-wrap leading-relaxed">
                {documentData.journeyFit || 'Not answered'}
              </p>
            </div>
          </div>

          {/* Question 5 */}
          <div className="mb-10">
            <div className="flex items-start gap-4 mb-4">
              <span className="flex-shrink-0 w-10 h-10 bg-[#2f829b] text-white rounded-full flex items-center justify-center font-['Poppins'] font-bold text-lg">
                5
              </span>
              <div className="flex-1">
                <h3 className="font-['Poppins'] font-medium text-xl text-[#034863] mb-2">
                  What do you think patients (or end users) appreciate most about this product today?
                </h3>
                <p className="text-sm text-[#034863]/60 mb-3 italic">
                  Your perception of what's working.
                </p>
              </div>
            </div>
            <div className="ml-14">
              <p className="font-['Poppins'] text-lg text-black whitespace-pre-wrap leading-relaxed">
                {documentData.userAppreciation || 'Not answered'}
              </p>
            </div>
          </div>

          {/* Question 6 */}
          <div className="mb-10">
            <div className="flex items-start gap-4 mb-4">
              <span className="flex-shrink-0 w-10 h-10 bg-[#2f829b] text-white rounded-full flex items-center justify-center font-['Poppins'] font-bold text-lg">
                6
              </span>
              <div className="flex-1">
                <h3 className="font-['Poppins'] font-medium text-xl text-[#034863] mb-2">
                  Where do you suspect there may be friction, confusion, or drop-off?
                </h3>
                <p className="text-sm text-[#034863]/60 mb-3 italic">
                  Early self-awareness of experience gaps.
                </p>
              </div>
            </div>
            <div className="ml-14">
              <p className="font-['Poppins'] text-lg text-black whitespace-pre-wrap leading-relaxed">
                {documentData.frictionPoints || 'Not answered'}
              </p>
            </div>
          </div>

          {/* Question 7 */}
          <div className="mb-10">
            <div className="flex items-start gap-4 mb-4">
              <span className="flex-shrink-0 w-10 h-10 bg-[#2f829b] text-white rounded-full flex items-center justify-center font-['Poppins'] font-bold text-lg">
                7
              </span>
              <div className="flex-1">
                <h3 className="font-['Poppins'] font-medium text-xl text-[#034863] mb-2">
                  What questions or uncertainties are you hoping this audit will help clarify?
                </h3>
                <p className="text-sm text-[#034863]/60 mb-3 italic">
                  Aligns expectations and focus.
                </p>
              </div>
            </div>
            <div className="ml-14">
              <p className="font-['Poppins'] text-lg text-black whitespace-pre-wrap leading-relaxed">
                {documentData.auditGoals || 'Not answered'}
              </p>
            </div>
          </div>

          {/* Question 8 - Product Access */}
          <div className="mb-12">
            <div className="flex items-start gap-4 mb-4">
              <span className="flex-shrink-0 w-10 h-10 bg-[#2f829b] text-white rounded-full flex items-center justify-center font-['Poppins'] font-bold text-lg">
                8
              </span>
              <div className="flex-1">
                <h3 className="font-['Poppins'] font-medium text-xl text-[#034863] mb-2">
                  Product Access & Context
                </h3>
                <p className="text-sm text-[#034863]/60 mb-4 italic">
                  Please share any relevant access or materials below.
                </p>
              </div>
            </div>
            
            <div className="ml-14 space-y-6">
              {/* Login Credentials */}
              {documentData.productAccess?.loginCredentials && (
                <div className="bg-[#e3f2f7] p-5 rounded-lg">
                  <h4 className="font-['Poppins'] font-medium text-[#034863] mb-2 text-base">
                    Product Login or Demo Credentials
                  </h4>
                  <p className="font-['Poppins'] text-black text-base whitespace-pre-wrap">
                    {documentData.productAccess.loginCredentials}
                  </p>
                </div>
              )}

              {/* Demo Links */}
              {documentData.productAccess?.demoLinks && (
                <div className="bg-[#e3f2f7] p-5 rounded-lg">
                  <h4 className="font-['Poppins'] font-medium text-[#034863] mb-2 text-base">
                    Demo Links or Test Environment
                  </h4>
                  <p className="font-['Poppins'] text-black text-base whitespace-pre-wrap break-all">
                    {documentData.productAccess.demoLinks}
                  </p>
                </div>
              )}

              {/* Documentation */}
              {documentData.productAccess?.documentationLinks && (
                <div className="bg-[#e3f2f7] p-5 rounded-lg">
                  <h4 className="font-['Poppins'] font-medium text-[#034863] mb-2 text-base">
                    Product Documentation or Onboarding Materials
                  </h4>
                  <p className="font-['Poppins'] text-black text-base whitespace-pre-wrap break-all">
                    {documentData.productAccess.documentationLinks}
                  </p>
                </div>
              )}

              {/* Additional Notes */}
              {documentData.productAccess?.additionalNotes && (
                <div className="bg-[#e3f2f7] p-5 rounded-lg">
                  <h4 className="font-['Poppins'] font-medium text-[#034863] mb-2 text-base">
                    Additional Notes or Context
                  </h4>
                  <p className="font-['Poppins'] text-black text-base whitespace-pre-wrap">
                    {documentData.productAccess.additionalNotes}
                  </p>
                </div>
              )}

              {!documentData.productAccess?.loginCredentials && 
               !documentData.productAccess?.demoLinks && 
               !documentData.productAccess?.documentationLinks && 
               !documentData.productAccess?.additionalNotes && (
                <p className="font-['Poppins'] text-[#034863]/50 italic text-base">
                  No product access information provided
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <DocumentFooter />

          {/* Bottom Action Buttons */}
          <div className="mt-12 pt-8 border-t-2 border-[#ddecf0] no-print">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={handleApproveAndExport}
                className="bg-[#6b2358] hover:bg-[#6b2358]/90 text-white font-['Poppins'] rounded-lg px-8 py-3 w-full sm:w-auto"
              >
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Approve & Export as PDF
              </Button>
              <Button
                onClick={handleApprove}
                className="bg-[#2f829b] hover:bg-[#2f829b]/90 text-white font-['Poppins'] rounded-lg px-8 py-3 w-full sm:w-auto"
              >
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Approve
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}