import React from 'react';
import { ArrowLeft, Calendar, Mail, Globe, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { RefinedHeader } from '../shared/RefinedHeader';
import { DocumentFooter } from '../shared/DocumentFooter';
import { SchedulingData } from '../editors/SchedulingForm';

interface SchedulingDocumentProps {
  documentData: SchedulingData;
  onEdit: () => void;
}

export function SchedulingDocument({ documentData, onEdit }: SchedulingDocumentProps) {
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header - Screen Only */}
        <div className="print:hidden mb-6">
          <RefinedHeader />
          <div className="flex items-center justify-between mt-6">
            <h1 className="font-['Lora'] text-4xl text-[#034863]">Scheduler: Preliminary Consultation</h1>
            <Button
              onClick={onEdit}
              variant="outline"
              className="border-2 border-[#034863] text-[#034863] hover:bg-[#f5fafb] font-['Poppins'] rounded-lg"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>

        {/* Document Content */}
        <div className="bg-white">
          {/* Logo for Print */}
          <div className="hidden print:block mb-8">
            <RefinedHeader />
          </div>

          {/* Single Column Layout */}
          <div>
            {/* Next Steps Section */}
            <div className="mb-8">
              <h2 className="font-['Lora'] text-2xl text-[#034863] mb-6">
                Next Steps
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#2f829b] text-white rounded-full flex items-center justify-center font-['Poppins'] font-semibold text-lg">
                    1
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="font-['Poppins'] text-[18px] text-[#034863]">
                      <strong>Schedule:</strong> Use the embedded calendar below to select a convenient time
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#2f829b] text-white rounded-full flex items-center justify-center font-['Poppins'] font-semibold text-lg">
                    2
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="font-['Poppins'] text-[18px] text-[#034863]">
                      <strong>Confirmation:</strong> Look for a confirmation email from{' '}
                      <a href="mailto:meredith@empowerhealthstrategies.com" className="text-[#2f829b] underline">
                        meredith@empowerhealthstrategies.com
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#2f829b] text-white rounded-full flex items-center justify-center font-['Poppins'] font-semibold text-lg">
                    3
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="font-['Poppins'] text-[18px] text-[#034863]">
                      <strong>No confirmation?</strong> Please{' '}
                      <a href="mailto:meredith@empowerhealthstrategies.com" className="text-[#2f829b] underline">
                        email me
                      </a>{' '}
                      directly and I'll assist you
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#2f829b] text-white rounded-full flex items-center justify-center font-['Poppins'] font-semibold text-lg">
                    4
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="font-['Poppins'] text-[18px] text-[#034863]">
                      <strong>Join the call:</strong> Log onto the Google Meet link you receive on the date and time indicated in your invite. Looking forward to connecting with you for this initial complimentary consultation to discuss your patient experience strategy needs and explore how we can work together!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Instructions */}
            {documentData.additionalInstructions && (
              <div className="mb-8">
                <div className="bg-[#f5fafb] border-2 border-[#2f829b] rounded-lg p-4">
                  <p className="font-['Poppins'] text-[16px] text-[#034863] whitespace-pre-wrap">
                    {documentData.additionalInstructions}
                  </p>
                </div>
              </div>
            )}

            {/* Google Calendar Embed - Full Width */}
            <div className="mb-8">
              <div className="bg-[#f5fafb] border-2 border-[#ddecf0] rounded-lg overflow-hidden" style={{ minHeight: '600px' }}>
                <iframe
                  src={documentData.schedulingLink}
                  width="100%"
                  height="600"
                  frameBorder="0"
                  scrolling="yes"
                  className="w-full"
                  title="Schedule Appointment"
                ></iframe>
              </div>

              {/* Fallback Link */}
              <div className="mt-6 text-center">
                <p className="font-['Poppins'] text-sm text-[#034863]/70 mb-3">
                  Calendar not loading? Click below:
                </p>
                <a
                  href={documentData.schedulingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#2f829b] hover:bg-[#034863] text-white font-['Poppins'] px-6 py-3 rounded-lg transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  Open Scheduling Page
                </a>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t-2 border-[#ddecf0] pt-8">
            <DocumentFooter />
          </div>
        </div>
      </div>
    </div>
  );
}