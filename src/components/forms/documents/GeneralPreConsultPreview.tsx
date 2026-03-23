import React from 'react';
import { ArrowLeft, Download } from 'lucide-react';
import { Button } from '../ui/button';
import { RefinedHeader } from '../shared/RefinedHeader';
import { DocumentFooter } from '../shared/DocumentFooter';
import { GeneralPreConsultData } from '../editors/GeneralPreConsultForm';

interface GeneralPreConsultPreviewProps {
  data: GeneralPreConsultData;
  onBack: () => void;
  onEdit: () => void;
}

export function GeneralPreConsultPreview({ data, onBack, onEdit }: GeneralPreConsultPreviewProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Full-width Header with Logo */}
      <RefinedHeader onEdit={onEdit} onBack={onBack} showBackButton={!!onBack} />

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Document Header */}
          <div className="mb-12">
            <h1 className="font-['Lora'] text-2xl text-[#034863] mb-2 pt-[0px] pr-[0px] pb-[6px] pl-[0px]">Pre-Consult Questionnaire</h1>
            <p className="font-['Poppins'] text-xl text-[#2f829b]">Preliminary Consultation</p>
            {/* Contact Information */}
            <div className="mt-6 font-['Poppins'] text-base text-[#034863]">{data.contactName || '—'} | {data.organizationName || '—'} | {data.contactEmail || '—'}</div>
          </div>

          {/* Instructions - Light Blue Shaded Card */}
          <div className="bg-[#f5fafb] border-2 border-[#ddecf0] rounded-lg p-8 mb-12">
            <p className="font-['Poppins'] text-lg text-[#034863] leading-relaxed">
              Thank you for your interest in Empower Health Strategies. The questions below help me understand 
              your context and goals so our consultation can be as focused and useful as possible.
            </p>
          </div>

          <div className="space-y-8">
            {/* Question 1 */}
            <div>
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#2f829b] text-white flex items-center justify-center font-['Poppins'] text-xl font-medium">1</div>
                <div className="flex-1">
                  <h3 className="font-['Poppins'] font-medium text-[#034863] text-xl mb-3">
                    Briefly tell us about your organization and the work you do.
                  </h3>
                </div>
              </div>
              <p className="font-['Poppins'] text-lg text-[#034863] whitespace-pre-wrap ml-16">
                {data.organizationDescription || '—'}
              </p>
              {data.organizationLinks && (
                <div className="mt-4 ml-16">
                  <p className="font-['Poppins'] text-base text-[#034863]/70 mb-2">Links or Additional Materials:</p>
                  <p className="font-['Poppins'] text-lg text-[#034863] whitespace-pre-wrap">
                    {data.organizationLinks}
                  </p>
                </div>
              )}
            </div>

            {/* Question 2 */}
            <div>
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#2f829b] text-white flex items-center justify-center font-['Poppins'] text-xl font-medium">2</div>
                <div className="flex-1">
                  <h3 className="font-['Poppins'] font-medium text-[#034863] text-xl mb-3">
                    What brings you to Empower Health Strategies right now?
                  </h3>
                </div>
              </div>
              <p className="font-['Poppins'] text-lg text-[#034863] whitespace-pre-wrap ml-16">
                {data.whatBringsYou || '—'}
              </p>
            </div>

            {/* Question 3 */}
            <div>
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#2f829b] text-white flex items-center justify-center font-['Poppins'] text-xl font-medium">3</div>
                <div className="flex-1">
                  <h3 className="font-['Poppins'] font-medium text-[#034863] text-xl mb-3">
                    What would success look like for you?
                  </h3>
                </div>
              </div>
              <p className="font-['Poppins'] text-lg text-[#034863] whitespace-pre-wrap ml-16">
                {data.successLooksLike || '—'}
              </p>
            </div>

            {/* Question 4 */}
            <div>
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#2f829b] text-white flex items-center justify-center font-['Poppins'] text-xl font-medium">4</div>
                <div className="flex-1">
                  <h3 className="font-['Poppins'] font-medium text-[#034863] text-xl mb-3">
                    What have you already tried or explored to address this?
                  </h3>
                </div>
              </div>
              <p className="font-['Poppins'] text-lg text-[#034863] whitespace-pre-wrap ml-16">
                {data.alreadyTried || '—'}
              </p>
            </div>

            {/* Question 5 */}
            <div>
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#2f829b] text-white flex items-center justify-center font-['Poppins'] text-xl font-medium">5</div>
                <div className="flex-1">
                  <h3 className="font-['Poppins'] font-medium text-[#034863] text-xl mb-3">
                    Who are the key stakeholders or decision-makers involved in this work?
                  </h3>
                </div>
              </div>
              <p className="font-['Poppins'] text-lg text-[#034863] whitespace-pre-wrap ml-16">
                {data.keyStakeholders || '—'}
              </p>
            </div>

            {/* Question 6 - Timeline */}
            <div>
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#2f829b] text-white flex items-center justify-center font-['Poppins'] text-xl font-medium">6</div>
                <div className="flex-1">
                  <h3 className="font-['Poppins'] font-medium text-[#034863] text-xl mb-3">
                    What's your ideal timeline for getting started?
                  </h3>
                </div>
              </div>
              <p className="font-['Poppins'] text-lg text-[#034863] whitespace-pre-wrap ml-16">
                {data.timeline || '—'}
              </p>
            </div>

            {/* Question 7 - Budget */}
            <div>
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#2f829b] text-white flex items-center justify-center font-['Poppins'] text-xl font-medium">7</div>
                <div className="flex-1">
                  <h3 className="font-['Poppins'] font-medium text-[#034863] text-xl mb-3">
                    What's your estimated budget range for this work?
                  </h3>
                </div>
              </div>
              <p className="font-['Poppins'] text-lg text-[#034863]">
                {data.budget || '—'}
              </p>
            </div>

            {/* Question 8 - How did you hear */}
            <div>
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#2f829b] text-white flex items-center justify-center font-['Poppins'] text-xl font-medium">8</div>
                <div className="flex-1">
                  <h3 className="font-['Poppins'] font-medium text-[#034863] text-xl mb-3">
                    How did you hear about Empower Health Strategies?
                  </h3>
                </div>
              </div>
              <p className="font-['Poppins'] text-lg text-[#034863]">
                {data.howDidYouHear === 'Other' && data.howDidYouHearOther 
                  ? `Other: ${data.howDidYouHearOther}`
                  : (data.howDidYouHear || '—')}
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
              Back to Flow Wizard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}