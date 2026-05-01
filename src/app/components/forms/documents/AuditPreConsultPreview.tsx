import React from 'react';
import { ArrowLeft, Download } from 'lucide-react';
import { Button } from '../ui/button';
import { RefinedHeader } from '../shared/RefinedHeader';
import { DocumentFooter } from '../shared/DocumentFooter';
import { AuditPreConsultData } from '../editors/AuditPreConsultForm';

interface AuditPreConsultPreviewProps {
  data: AuditPreConsultData;
  onBack: () => void;
  onEdit: () => void;
}

export function AuditPreConsultPreview({ data, onBack, onEdit }: AuditPreConsultPreviewProps) {
  // Use custom titles if provided, otherwise use defaults
  const displayTitle = data.customTitle || 'Pre-Consultation Questionnaire: Audit';
  const displaySubtitle = data.customSubtitle || 'Innovation PX & Impact Audit';

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
            <h1 className="font-['Lora'] text-2xl text-[#034863] mb-2 pt-[0px] pr-[0px] pb-[6px] pl-[0px]">{displayTitle}</h1>
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
              Thank you for your interest in an Innovation PX & Impact Audit. The questions below help me understand 
              your context and goals so our consultation can be as focused and useful as possible.
            </p>
          </div>

          <div className="space-y-8">
            {/* Question 1 - Organization Description */}
            <div className="border-t border-[#ddecf0] pt-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#2f829b] text-white flex items-center justify-center font-['Poppins'] text-xl font-medium">1</div>
                <div className="flex-1">
                  <h3 className="font-['Poppins'] font-medium text-[#034863] text-xl">
                    Briefly share about your organization and the product or care experience you're working on.
                  </h3>
                </div>
              </div>
              <p className="font-['Poppins'] text-lg text-[#034863] whitespace-pre-wrap ml-16">
                {data.organizationDescription || '—'}
              </p>
              {data.uploadedDocuments && data.uploadedDocuments.length > 0 && (
                <div className="mt-4 ml-16">
                  <p className="font-['Poppins'] text-base text-[#034863]/70 mb-2">Uploaded Documents:</p>
                  <ul className="list-disc list-inside space-y-1 font-['Poppins'] text-base text-[#034863]">
                    {data.uploadedDocuments.map((doc, idx) => (
                      <li key={idx}>{doc}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Question 2 - Product Stage */}
            <div className="border-t border-[#ddecf0] pt-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#2f829b] text-white flex items-center justify-center font-['Poppins'] text-xl font-medium">2</div>
                <div className="flex-1">
                  <h3 className="font-['Poppins'] font-medium text-[#034863] text-xl">
                    If you're building a specific product, what stage is it currently in?
                  </h3>
                </div>
              </div>
              <p className="font-['Poppins'] text-lg text-[#034863] ml-16">
                {data.productStage || '—'}
              </p>
            </div>

            {/* Question 3 - Audit Prompt */}
            <div className="border-t border-[#ddecf0] pt-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#2f829b] text-white flex items-center justify-center font-['Poppins'] text-xl font-medium">3</div>
                <div className="flex-1">
                  <h3 className="font-['Poppins'] font-medium text-[#034863] text-xl">
                    What prompted you to seek a Patient Experience (PX) & Impact Audit now?
                  </h3>
                </div>
              </div>
              <p className="font-['Poppins'] text-lg text-[#034863] whitespace-pre-wrap ml-16">
                {data.auditPrompt || '—'}
              </p>
            </div>

            {/* Question 4 - Areas to Clarity */}
            <div className="border-t border-[#ddecf0] pt-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#2f829b] text-white flex items-center justify-center font-['Poppins'] text-xl font-medium">4</div>
                <div className="flex-1">
                  <h3 className="font-['Poppins'] font-medium text-[#034863] text-xl">
                    Which areas are you most hoping an audit will help clarify or improve?
                  </h3>
                </div>
              </div>
              {data.areasToClarity && data.areasToClarity.length > 0 ? (
                <ul className="list-disc list-inside space-y-2 font-['Poppins'] text-base text-[#034863] ml-16">
                  {data.areasToClarity.map((area, idx) => (
                    <li key={idx}>{area}</li>
                  ))}
                </ul>
              ) : (
                <p className="font-['Poppins'] text-lg text-[#034863] ml-16">—</p>
              )}
              {data.areasOtherText && (
                <div className="mt-4 ml-16">
                  <p className="font-['Poppins'] text-base text-[#034863]/70 mb-2">Additional details:</p>
                  <p className="font-['Poppins'] text-lg text-[#034863] whitespace-pre-wrap">
                    {data.areasOtherText}
                  </p>
                </div>
              )}
            </div>

            {/* Question 5 - Decision Involvement */}
            <div className="border-t border-[#ddecf0] pt-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#2f829b] text-white flex items-center justify-center font-['Poppins'] text-xl font-medium">5</div>
                <div className="flex-1">
                  <h3 className="font-['Poppins'] font-medium text-[#034863] text-xl">
                    Who is involved in product or experience decisions today?
                  </h3>
                </div>
              </div>
              <p className="font-['Poppins'] text-lg text-[#034863] whitespace-pre-wrap ml-16">
                {data.decisionInvolvement || '—'}
              </p>
            </div>

            {/* Question 6 - Consultation Goals */}
            <div className="border-t border-[#ddecf0] pt-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#2f829b] text-white flex items-center justify-center font-['Poppins'] text-xl font-medium">6</div>
                <div className="flex-1">
                  <h3 className="font-['Poppins'] font-medium text-[#034863] text-xl">
                    What would make this preliminary consultation feel successful for you?
                  </h3>
                </div>
              </div>
              {data.consultationGoals && data.consultationGoals.length > 0 ? (
                <ul className="list-disc list-inside space-y-2 font-['Poppins'] text-base text-[#034863] ml-16">
                  {data.consultationGoals.map((goal, idx) => (
                    <li key={idx}>{goal}</li>
                  ))}
                </ul>
              ) : (
                <p className="font-['Poppins'] text-lg text-[#034863] ml-16">—</p>
              )}
              {data.consultationGoalsOther && (
                <div className="mt-4 ml-16">
                  <p className="font-['Poppins'] text-base text-[#034863]/70 mb-2">Additional goals:</p>
                  <p className="font-['Poppins'] text-lg text-[#034863] whitespace-pre-wrap">
                    {data.consultationGoalsOther}
                  </p>
                </div>
              )}
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
                    What is your budget for this audit?
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