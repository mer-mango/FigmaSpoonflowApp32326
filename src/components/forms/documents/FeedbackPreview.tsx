import React from 'react';
import { ArrowLeft, Download } from 'lucide-react';
import { Button } from '../ui/button';
import { RefinedHeader } from '../shared/RefinedHeader';
import { DocumentFooter } from '../shared/DocumentFooter';
import { FeedbackData } from '../editors/FeedbackForm';

interface FeedbackPreviewProps {
  data: FeedbackData;
  onBack: () => void;
  onEdit: () => void;
}

export function FeedbackPreview({ data, onBack, onEdit }: FeedbackPreviewProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Full-width Header with Logo */}
      <RefinedHeader onEdit={onEdit} onBack={onBack} showBackButton={!!onBack} />

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Document Header */}
          <div className="mb-12">
            <h1 className="font-['Lora'] text-2xl text-[#034863] mb-2 pt-[0px] pr-[0px] pb-[6px] pl-[0px]">Feedback Form</h1>
            <p className="font-['Poppins'] text-xl text-[#2f829b]">Help us improve our services</p>
          </div>

          <div className="space-y-8">
            {/* Introduction */}
            <div className="bg-[#f5fafb] border-2 border-[#ddecf0] rounded-lg p-8">
              <p className="font-['Poppins'] text-lg text-[#034863] leading-relaxed whitespace-pre-wrap">
                {data.introText}
              </p>
            </div>

            {/* Question 1 */}
            <div>
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#2f829b] text-white flex items-center justify-center font-['Poppins'] text-xl font-medium">1</div>
                <div className="flex-1">
                  <h3 className="font-['Poppins'] font-medium text-[#034863] text-xl mb-3">
                    {data.question1}
                  </h3>
                </div>
              </div>
              <p className="font-['Poppins'] text-lg text-[#034863] whitespace-pre-wrap ml-16">
                {data.answer1 || '—'}
              </p>
            </div>

            {/* Question 2 */}
            <div>
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#2f829b] text-white flex items-center justify-center font-['Poppins'] text-xl font-medium">2</div>
                <div className="flex-1">
                  <h3 className="font-['Poppins'] font-medium text-[#034863] text-xl mb-3">
                    {data.question2}
                  </h3>
                </div>
              </div>
              <p className="font-['Poppins'] text-lg text-[#034863] whitespace-pre-wrap ml-16">
                {data.answer2 || '—'}
              </p>
            </div>

            {/* Question 3 */}
            <div>
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#2f829b] text-white flex items-center justify-center font-['Poppins'] text-xl font-medium">3</div>
                <div className="flex-1">
                  <h3 className="font-['Poppins'] font-medium text-[#034863] text-xl mb-3">
                    {data.question3}
                  </h3>
                </div>
              </div>
              <p className="font-['Poppins'] text-lg text-[#034863] whitespace-pre-wrap ml-16">
                {data.answer3 || '—'}
              </p>
            </div>

            {/* Testimonial Permission */}
            <div>
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#2f829b] text-white flex items-center justify-center font-['Poppins'] text-xl font-medium">4</div>
                <div className="flex-1">
                  <h3 className="font-['Poppins'] font-medium text-[#034863] text-xl mb-3">
                    {data.testimonialQuestion}
                  </h3>
                </div>
              </div>
              <p className="font-['Poppins'] text-lg text-[#034863] ml-16">
                {data.testimonialPermission || '—'}
              </p>
            </div>

            {/* Credit Preference */}
            <div>
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#2f829b] text-white flex items-center justify-center font-['Poppins'] text-xl font-medium">5</div>
                <div className="flex-1">
                  <h3 className="font-['Poppins'] font-medium text-[#034863] text-xl mb-3">
                    {data.creditQuestion}
                  </h3>
                </div>
              </div>
              <p className="font-['Poppins'] text-lg text-[#034863] ml-16">
                {data.creditPreference || '—'}
              </p>
            </div>

            {/* Closing Message */}
            <div className="bg-[#f5fafb] border-2 border-[#ddecf0] rounded-lg p-8">
              <p className="font-['Poppins'] text-lg text-[#034863] leading-relaxed whitespace-pre-wrap">
                {data.closingText}
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