import React, { useState } from 'react';
import { DocumentFooter } from '../shared/DocumentFooter';
import { FeedbackTestimonialData } from '../editors/FeedbackTestimonialForm';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Send, ArrowLeft, Edit, Download } from 'lucide-react';
import { PrintLogo } from '../shared/PrintLogo';
import logo from 'figma:asset/c4b42eda92a6395a0d27891152702b904ad22088.png';

interface FeedbackTestimonialDocumentProps {
  data: FeedbackTestimonialData;
  onBack?: () => void;
  onEdit?: () => void;
  isClientView?: boolean; // True when sent to client, false in preview mode
}

export function FeedbackTestimonialDocument({
  data,
  onBack,
  onEdit,
  isClientView = false
}: FeedbackTestimonialDocumentProps) {
  // Client response state (only used when isClientView is true)
  const [answer1, setAnswer1] = useState(data.answer1 || '');
  const [answer2, setAnswer2] = useState(data.answer2 || '');
  const [answer3, setAnswer3] = useState(data.answer3 || '');
  const [testimonialPermission, setTestimonialPermission] = useState(data.testimonialPermission || '');
  const [creditPreference, setCreditPreference] = useState(data.creditPreference || '');

  const testimonialOptions = [
    'Yes, you may use my feedback with full attribution (name, title, organization)',
    'Yes, you may use my feedback anonymously',
    'No, please keep my feedback private'
  ];

  const creditOptions = [
    'Full name and title (e.g., "Jane Smith, Director of Patient Experience at Memorial Hospital")',
    'First name and organization (e.g., "Jane from Memorial Hospital")',
    'First name only (e.g., "Jane")',
    'Anonymous (no attribution)'
  ];

  const handleSubmit = () => {
    // In a real implementation, this would send the data to the server
    alert('Thank you for your feedback! Your responses have been submitted.');
    console.log('Client responses:', {
      answer1,
      answer2,
      answer3,
      testimonialPermission,
      creditPreference
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Logo */}
      <div className="w-full bg-white border-b border-[#ddecf0] pt-6 pb-3 px-4 sm:px-6 lg:px-8 print:hidden">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <img 
              src={logo} 
              alt="Empower Health Strategies"
              className="h-24"
              style={{ imageRendering: 'crisp-edges' }}
            />
            {!isClientView && (
              <div className="flex items-center gap-3">
                {onEdit && (
                  <Button
                    onClick={onEdit}
                    variant="outline"
                    className="border-2 border-[#034863] text-[#034863] hover:bg-[#f5fafb] font-['Poppins'] rounded-lg"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Form
                  </Button>
                )}
                <Button
                  onClick={() => window.print()}
                  className="bg-[#6b2358] hover:bg-[#6b2358]/90 text-white font-['Poppins'] rounded-lg"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                {onBack && (
                  <Button
                    onClick={onBack}
                    variant="outline"
                    className="border-2 border-[#034863] text-[#034863] hover:bg-[#f5fafb] font-['Poppins'] rounded-lg"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Print-only Logo */}
          <PrintLogo />
          
          {/* Document Header */}
          <div className="mb-12">
            <h1 className="font-['Lora'] text-2xl text-[#034863] mb-4">
              Feedback & Testimonial Request
            </h1>
            {data.serviceName && (
              <p className="font-['Poppins'] text-lg text-[#2f829b]">
                Re: {data.serviceName}
              </p>
            )}
            {data.contactName && (
              <p className="font-['Poppins'] text-base text-[#034863] mt-2">
                For: {data.contactName}
              </p>
            )}
          </div>

          <div className="space-y-8">
            {/* Introduction */}
            <div className="bg-[#f5fafb] p-8 rounded-xl border-2 border-[#ddecf0]">
              <p className="font-['Poppins'] text-[18px] text-[#034863] leading-relaxed whitespace-pre-wrap">
                {data.introText}
              </p>
            </div>

            {/* Question 1 */}
            <div className="border-2 border-[#ddecf0] rounded-xl p-8 bg-white">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#2f829b] text-white flex items-center justify-center text-lg font-medium">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-['Poppins'] font-semibold text-[#034863] text-[20px] mb-4">
                    {data.question1}
                  </h3>
                  {isClientView ? (
                    <Textarea
                      value={answer1}
                      onChange={(e) => setAnswer1(e.target.value)}
                      rows={5}
                      className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                      placeholder="Share your thoughts here..."
                    />
                  ) : (
                    <div className="bg-[#f5fafb] border-2 border-[#ddecf0] rounded-lg p-4 min-h-[120px]">
                      <p className="font-['Poppins'] text-[18px] text-[#034863] whitespace-pre-wrap">
                        {answer1 || 'Client response will appear here'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Question 2 */}
            <div className="border-2 border-[#ddecf0] rounded-xl p-8 bg-white">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#2f829b] text-white flex items-center justify-center text-lg font-medium">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-['Poppins'] font-semibold text-[#034863] text-[20px] mb-4">
                    {data.question2}
                  </h3>
                  {isClientView ? (
                    <Textarea
                      value={answer2}
                      onChange={(e) => setAnswer2(e.target.value)}
                      rows={5}
                      className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                      placeholder="Share your thoughts here..."
                    />
                  ) : (
                    <div className="bg-[#f5fafb] border-2 border-[#ddecf0] rounded-lg p-4 min-h-[120px]">
                      <p className="font-['Poppins'] text-[18px] text-[#034863] whitespace-pre-wrap">
                        {answer2 || 'Client response will appear here'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Question 3 */}
            <div className="border-2 border-[#ddecf0] rounded-xl p-8 bg-white">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#2f829b] text-white flex items-center justify-center text-lg font-medium">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-['Poppins'] font-semibold text-[#034863] text-[20px] mb-4">
                    {data.question3}
                  </h3>
                  {isClientView ? (
                    <Textarea
                      value={answer3}
                      onChange={(e) => setAnswer3(e.target.value)}
                      rows={5}
                      className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                      placeholder="Share your thoughts here (optional)..."
                    />
                  ) : (
                    <div className="bg-[#f5fafb] border-2 border-[#ddecf0] rounded-lg p-4 min-h-[120px]">
                      <p className="font-['Poppins'] text-[18px] text-[#034863] whitespace-pre-wrap">
                        {answer3 || 'Client response will appear here (optional)'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Testimonial Permission */}
            <div className="border-2 border-[#6b2358]/30 bg-[#f8f3f7] rounded-xl p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#6b2358] text-white flex items-center justify-center text-lg font-medium">
                  4
                </div>
                <div className="flex-1">
                  <h3 className="font-['Poppins'] font-semibold text-[#6b2358] text-[20px] mb-4">
                    {data.testimonialQuestion}
                  </h3>
                  {isClientView ? (
                    <div className="space-y-3">
                      {testimonialOptions.map((option) => (
                        <label
                          key={option}
                          className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-white/50 transition-colors"
                        >
                          <input
                            type="radio"
                            name="testimonialPermission"
                            value={option}
                            checked={testimonialPermission === option}
                            onChange={(e) => setTestimonialPermission(e.target.value)}
                            className="mt-1 w-4 h-4 text-[#6b2358] focus:ring-[#6b2358]"
                          />
                          <span className="font-['Poppins'] text-[18px] text-[#6b2358]">
                            {option}
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white border-2 border-[#6b2358]/30 rounded-lg p-4">
                      <p className="font-['Poppins'] text-[18px] text-[#6b2358] font-medium">
                        {testimonialPermission || 'Client will select their preference'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Credit Preference */}
            <div className="border-2 border-[#6b2358]/30 bg-[#f8f3f7] rounded-xl p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#6b2358] text-white flex items-center justify-center text-lg font-medium">
                  5
                </div>
                <div className="flex-1">
                  <h3 className="font-['Poppins'] font-semibold text-[#6b2358] text-[20px] mb-4">
                    {data.creditQuestion}
                  </h3>
                  {isClientView ? (
                    <div className="space-y-3">
                      {creditOptions.map((option) => (
                        <label
                          key={option}
                          className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-white/50 transition-colors"
                        >
                          <input
                            type="radio"
                            name="creditPreference"
                            value={option}
                            checked={creditPreference === option}
                            onChange={(e) => setCreditPreference(e.target.value)}
                            className="mt-1 w-4 h-4 text-[#6b2358] focus:ring-[#6b2358]"
                          />
                          <span className="font-['Poppins'] text-[18px] text-[#6b2358]">
                            {option}
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white border-2 border-[#6b2358]/30 rounded-lg p-4">
                      <p className="font-['Poppins'] text-[18px] text-[#6b2358] font-medium">
                        {creditPreference || 'Client will select their preference'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Closing Message */}
            <div className="bg-[#f5fafb] p-8 rounded-xl border-2 border-[#ddecf0]">
              <p className="font-['Poppins'] text-[18px] text-[#034863] leading-relaxed whitespace-pre-wrap">
                {data.closingText}
              </p>
            </div>

            {/* Submit Button (only in client view) */}
            {isClientView && (
              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleSubmit}
                  className="bg-[#6b2358] hover:bg-[#6b2358]/90 text-white font-['Poppins'] rounded-lg px-8 py-4 text-lg"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Submit Feedback
                </Button>
              </div>
            )}
          </div>

          {/* Document Footer */}
          <div className="mt-16">
            <DocumentFooter />
          </div>
        </div>
      </div>
    </div>
  );
}