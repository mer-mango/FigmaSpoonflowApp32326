import React from 'react';
import { ArrowLeft, Download, Send } from 'lucide-react';
import { Button } from '../ui/button';
import { RefinedHeader } from '../shared/RefinedHeader';
import { DocumentFooter } from '../shared/DocumentFooter';
import { PreConsultGeneralData } from '../editors/PreConsultGeneralForm';

interface PreConsultGeneralDocumentProps {
  documentData: PreConsultGeneralData;
  onBack?: () => void;
  onEdit?: () => void;
}

export function PreConsultGeneralDocument({ documentData, onBack, onEdit }: PreConsultGeneralDocumentProps) {
  const [contactName, setContactName] = React.useState(documentData.contactName || '');
  const [organizationName, setOrganizationName] = React.useState(documentData.organizationName || '');
  const [contactEmail, setContactEmail] = React.useState(documentData.contactEmail || '');

  return (
    <div className="min-h-screen bg-white">
      {/* Full-width Header with Logo */}
      <RefinedHeader onEdit={onEdit} onBack={onBack} showBackButton={!!onBack} />

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Document Header */}
          <div className="mb-12">
            <h1 className="font-['Lora'] text-6xl text-[#034863] mb-2 pt-[0px] pr-[0px] pb-[6px] pl-[0px]">Pre-Consult Questionnaire</h1>
            <p className="font-['Poppins'] text-xl text-[#2f829b] mb-4">Preliminary Consultation</p>
            
            {/* Editable Contact Summary Line */}
            <div className="flex items-center gap-3 font-['Poppins'] text-lg text-[#034863]">
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Contact Name"
                className="border-b border-[#ddecf0] focus:border-[#2f829b] outline-none bg-transparent"
              />
              <span className="text-[#034863]/40">|</span>
              <input
                type="text"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="Organization"
                className="border-b border-[#ddecf0] focus:border-[#2f829b] outline-none bg-transparent"
              />
              <span className="text-[#034863]/40">|</span>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="Email"
                className="border-b border-[#ddecf0] focus:border-[#2f829b] outline-none bg-transparent"
              />
            </div>
          </div>

          {/* Instructions - Light Blue Shaded Card */}
          <div className="bg-[#f5fafb] border-2 border-[#ddecf0] rounded-lg p-8 mb-12">
            <p className="font-['Poppins'] text-lg text-[#034863] leading-relaxed">
              Thank you for your interest in Empower Health Strategies. The information below helps me understand 
              your context and goals so our consultation can be as focused and useful as possible.
            </p>
          </div>

          <div className="space-y-8">
            {/* Question 1 */}
            <div className="border-t border-[#ddecf0] pt-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#2f829b] text-white flex items-center justify-center font-['Poppins'] text-xl font-medium">1</div>
                <div className="flex-1">
                  <h3 className="font-['Poppins'] font-medium text-[#034863] text-xl">
                    Briefly tell us about your organization and the work you do.
                  </h3>
                </div>
              </div>
              <p className="font-['Poppins'] text-lg text-[#034863] whitespace-pre-wrap ml-16">
                {documentData.organizationDescription || '—'}
              </p>
              {documentData.organizationLinks && (
                <div className="mt-4 ml-16">
                  <p className="font-['Poppins'] text-base text-[#034863]/70 mb-2">Links or Additional Materials:</p>
                  <p className="font-['Poppins'] text-lg text-[#034863] whitespace-pre-wrap">
                    {documentData.organizationLinks}
                  </p>
                </div>
              )}
            </div>

            {/* Question 2 */}
            <div className="border-t border-[#ddecf0] pt-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#2f829b] text-white flex items-center justify-center font-['Poppins'] text-xl font-medium">2</div>
                <div className="flex-1">
                  <h3 className="font-['Poppins'] font-medium text-[#034863] text-xl">
                    What brings you to Empower Health Strategies right now?
                  </h3>
                </div>
              </div>
              <p className="font-['Poppins'] text-lg text-[#034863] whitespace-pre-wrap ml-16">
                {documentData.whatBringsYou || '—'}
              </p>
            </div>

            {/* Question 3 */}
            <div className="border-t border-[#ddecf0] pt-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#2f829b] text-white flex items-center justify-center font-['Poppins'] text-xl font-medium">3</div>
                <div className="flex-1">
                  <h3 className="font-['Poppins'] font-medium text-[#034863] text-xl">
                    What would success look like for you?
                  </h3>
                </div>
              </div>
              <p className="font-['Poppins'] text-lg text-[#034863] whitespace-pre-wrap ml-16">
                {documentData.successLooksLike || '—'}
              </p>
            </div>

            {/* Question 4 */}
            <div className="border-t border-[#ddecf0] pt-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#2f829b] text-white flex items-center justify-center font-['Poppins'] text-xl font-medium">4</div>
                <div className="flex-1">
                  <h3 className="font-['Poppins'] font-medium text-[#034863] text-xl">
                    What have you already tried or explored to address this?
                  </h3>
                </div>
              </div>
              <p className="font-['Poppins'] text-lg text-[#034863] whitespace-pre-wrap ml-16">
                {documentData.alreadyTried || '—'}
              </p>
            </div>

            {/* Question 5 */}
            <div className="border-t border-[#ddecf0] pt-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#2f829b] text-white flex items-center justify-center font-['Poppins'] text-xl font-medium">5</div>
                <div className="flex-1">
                  <h3 className="font-['Poppins'] font-medium text-[#034863] text-xl">
                    Who are the key stakeholders or decision-makers involved in this work?
                  </h3>
                </div>
              </div>
              <p className="font-['Poppins'] text-lg text-[#034863] whitespace-pre-wrap ml-16">
                {documentData.keyStakeholders || '—'}
              </p>
            </div>

            {/* Question 6 - Timeline */}
            <div className="border-t border-[#ddecf0] pt-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#2f829b] text-white flex items-center justify-center font-['Poppins'] text-xl font-medium">6</div>
                <div className="flex-1">
                  <h3 className="font-['Poppins'] font-medium text-[#034863] text-xl">
                    What's your ideal timeline for getting started?
                  </h3>
                </div>
              </div>
              <p className="font-['Poppins'] text-lg text-[#034863] whitespace-pre-wrap ml-16">
                {documentData.timeline || '—'}
              </p>
            </div>

            {/* Question 7 - Budget */}
            <div className="border-t border-[#ddecf0] pt-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#2f829b] text-white flex items-center justify-center font-['Poppins'] text-xl font-medium">7</div>
                <div className="flex-1">
                  <h3 className="font-['Poppins'] font-medium text-[#034863] text-xl">
                    What's your estimated budget range for this work?
                  </h3>
                </div>
              </div>
              <p className="font-['Poppins'] text-lg text-[#034863] ml-16">
                {documentData.budget || '—'}
              </p>
            </div>

            {/* Question 8 - How did you hear */}
            <div className="border-t border-[#ddecf0] pt-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#2f829b] text-white flex items-center justify-center font-['Poppins'] text-xl font-medium">8</div>
                <div className="flex-1">
                  <h3 className="font-['Poppins'] font-medium text-[#034863] text-xl">
                    How did you hear about Empower Health Strategies?
                  </h3>
                </div>
              </div>
              <p className="font-['Poppins'] text-lg text-[#034863] ml-16">
                {documentData.howDidYouHear === 'Other' && documentData.howDidYouHearOther 
                  ? `Other: ${documentData.howDidYouHearOther}`
                  : (documentData.howDidYouHear || '—')}
              </p>
            </div>
          </div>

          <DocumentFooter />

          <div className="flex justify-end gap-3 mt-8 print:hidden">
            <Button
              onClick={onBack}
              variant="outline"
              className="border-2 border-[#034863] text-[#034863] hover:bg-[#f5fafb] font-['Poppins'] rounded-lg px-8 py-3"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}