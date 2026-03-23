import React from 'react';
import { ArrowLeft, Download } from 'lucide-react';
import { Button } from '../ui/button';
import { RefinedHeader } from '../shared/RefinedHeader';
import { DocumentFooter } from '../shared/DocumentFooter';
import { TrainingPreConsultData } from '../editors/TrainingPreConsultForm';
import { TextLogo } from '../shared/TextLogo';

interface TrainingPreConsultPreviewProps {
  data: TrainingPreConsultData;
  onBack: () => void;
  onEdit: () => void;
}

export function TrainingPreConsultPreview({ data, onBack, onEdit }: TrainingPreConsultPreviewProps) {
  // Use custom titles if provided, otherwise use defaults
  const displayTitle = data.customTitle || 'Pre-Consultation Questionnaire: Training';
  const displaySubtitle = data.customSubtitle || 'PX Strategy Workshop & Training';

  const [contactName, setContactName] = React.useState(data.contactName || '');
  const [organizationName, setOrganizationName] = React.useState(data.organizationName || '');
  const [contactEmail, setContactEmail] = React.useState(data.contactEmail || '');

  return (
    <div className="min-h-screen bg-white">
      {/* Full-width Header with Logo */}
      <RefinedHeader onEdit={onEdit} onBack={onBack} showBackButton={!!onBack} />

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Document Header */}
          <div className="mb-12">
            <h1 className="font-['Lora'] text-6xl text-[#034863] mb-2 pt-[0px] pr-[0px] pb-[6px] pl-[0px]">{displayTitle}</h1>
            <p className="font-['Poppins'] text-xl text-[#2f829b] mb-4">{displaySubtitle}</p>
            
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
              Thank you for your interest in a PX Strategy Workshop or Training. The questions below help me understand 
              your goals and context so our consultation can be as focused and useful as possible.
            </p>
          </div>

          <div className="space-y-8">
            {/* Question 1 - Organization Context */}
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
                {data.organizationContext || '—'}
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

            {/* Question 2 - Target Audience */}
            <div className="border-t border-[#ddecf0] pt-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#2f829b] text-white flex items-center justify-center font-['Poppins'] text-xl font-medium">2</div>
                <div className="flex-1">
                  <h3 className="font-['Poppins'] font-medium text-[#034863] text-xl">
                    Who would this virtual workshop or training be for?
                  </h3>
                </div>
              </div>
              {data.targetAudience && data.targetAudience.length > 0 ? (
                <ul className="list-disc list-inside space-y-2 font-['Poppins'] text-base text-[#034863] ml-16">
                  {data.targetAudience.map((audience, idx) => (
                    <li key={idx}>{audience}</li>
                  ))}
                </ul>
              ) : (
                <p className="font-['Poppins'] text-lg text-[#034863] ml-16">—</p>
              )}
              {data.targetAudienceOther && (
                <div className="mt-4 ml-16">
                  <p className="font-['Poppins'] text-base text-[#034863]/70 mb-2">Other audience:</p>
                  <p className="font-['Poppins'] text-lg text-[#034863]">
                    {data.targetAudienceOther}
                  </p>
                </div>
              )}
            </div>

            {/* Question 3 - Attendee Count */}
            <div className="border-t border-[#ddecf0] pt-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#2f829b] text-white flex items-center justify-center font-['Poppins'] text-xl font-medium">3</div>
                <div className="flex-1">
                  <h3 className="font-['Poppins'] font-medium text-[#034863] text-xl">
                    Approximately how many people would this workshop or training be for?
                  </h3>
                </div>
              </div>
              <p className="font-['Poppins'] text-lg text-[#034863] ml-16">
                {data.attendeeCount || '—'}
              </p>
            </div>

            {/* Question 4 - Engagement Types */}
            <div className="border-t border-[#ddecf0] pt-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#2f829b] text-white flex items-center justify-center font-['Poppins'] text-xl font-medium">4</div>
                <div className="flex-1">
                  <h3 className="font-['Poppins'] font-medium text-[#034863] text-xl">
                    What type(s) of engagement are you most interested in exploring?
                  </h3>
                </div>
              </div>
              {data.engagementTypes && data.engagementTypes.length > 0 ? (
                <ul className="list-disc list-inside space-y-2 font-['Poppins'] text-base text-[#034863] ml-16">
                  {data.engagementTypes.map((type, idx) => (
                    <li key={idx}>{type}</li>
                  ))}
                </ul>
              ) : (
                <p className="font-['Poppins'] text-lg text-[#034863] ml-16">—</p>
              )}
            </div>

            {/* Question 5 - What Prompted */}
            <div className="border-t border-[#ddecf0] pt-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#2f829b] text-white flex items-center justify-center font-['Poppins'] text-xl font-medium">5</div>
                <div className="flex-1">
                  <h3 className="font-['Poppins'] font-medium text-[#034863] text-xl">
                    What prompted you to explore a Patient Experience (PX) Strategy Workshop or Training at this time?
                  </h3>
                </div>
              </div>
              <p className="font-['Poppins'] text-lg text-[#034863] whitespace-pre-wrap ml-16">
                {data.whatPrompted || '—'}
              </p>
            </div>

            {/* Question 6 - Questions to Address */}
            <div className="border-t border-[#ddecf0] pt-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#2f829b] text-white flex items-center justify-center font-['Poppins'] text-xl font-medium">6</div>
                <div className="flex-1">
                  <h3 className="font-['Poppins'] font-medium text-[#034863] text-xl">
                    What questions do you hope to address during the consultation and/or is there anything else you'd like to share before we connect?
                  </h3>
                </div>
              </div>
              <p className="font-['Poppins'] text-lg text-[#034863] whitespace-pre-wrap ml-16">
                {data.questionsToAddress || '—'}
              </p>
            </div>

            {/* Question 7 - Timeline */}
            <div className="border-t border-[#ddecf0] pt-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#2f829b] text-white flex items-center justify-center font-['Poppins'] text-xl font-medium">7</div>
                <div className="flex-1">
                  <h3 className="font-['Poppins'] font-medium text-[#034863] text-xl">
                    What's your ideal timeline for getting started?
                  </h3>
                </div>
              </div>
              <p className="font-['Poppins'] text-lg text-[#034863] whitespace-pre-wrap ml-16">
                {data.timeline || '—'}
              </p>
            </div>

            {/* Question 8 - Budget */}
            <div className="border-t border-[#ddecf0] pt-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#2f829b] text-white flex items-center justify-center font-['Poppins'] text-xl font-medium">8</div>
                <div className="flex-1">
                  <h3 className="font-['Poppins'] font-medium text-[#034863] text-xl">
                    What is your budget?
                  </h3>
                </div>
              </div>
              <p className="font-['Poppins'] text-lg text-[#034863] ml-16">
                {data.budget || '—'}
              </p>
            </div>

            {/* Question 9 - How did you hear */}
            <div className="border-t border-[#ddecf0] pt-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#2f829b] text-white flex items-center justify-center font-['Poppins'] text-xl font-medium">9</div>
                <div className="flex-1">
                  <h3 className="font-['Poppins'] font-medium text-[#034863] text-xl">
                    How did you hear about Empower Health Strategies?
                  </h3>
                </div>
              </div>
              <p className="font-['Poppins'] text-lg text-[#034863] ml-16">
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
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}